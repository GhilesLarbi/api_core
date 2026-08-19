"""Configures the structlog pipeline once at startup, enforcing that each log call carries a
valid event enum and action; locally it renders a Rich console, deployed it emits JSON lines."""

import logging, sys, structlog
from app.core.settings import settings, Environment
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from rich.console import Console
from rich.traceback import Traceback
import sysconfig, traceback, httpx, json

from rich.panel import Panel
from rich.columns import Columns
from rich.json import JSON
from rich.text import Text
from rich.console import Group

from .enums import LogAction, LogEvent


# Processor: splits LogEvent enum into event=<key> + message=<human description>

#########################################################################################################
#########################################################################################################
def extract_event_message(logger_instance, log_method, event_dict):
    event = event_dict.get("event")
    if isinstance(event, LogEvent):
        event_dict["event"] = event.name.lower()
        event_dict.setdefault("message", event.value)
    return event_dict


# Processor: enforces action= on every log call

#########################################################################################################
#########################################################################################################
def require_action(logger_instance, log_method, event_dict):
    # Foreign logs (uvicorn, third-party stdlib loggers) carry _record — skip enforcement
    if "_record" in event_dict:
        return event_dict

    action = event_dict.get("action")
    if action is None:
        raise ValueError(
            f"Log call is missing required 'action' field. "
            f"Event: '{event_dict.get('event', '?')}'. "
            f"Pass action=LogAction.X directly or bind it via structlog.contextvars.bind_contextvars()."
        )
    valid = {a.value for a in LogAction}
    if str(action) not in valid:
        raise ValueError(
            f"Invalid log action '{action}'. Must be one of: {sorted(valid)}."
        )
    return event_dict


# Processor: turns foreign httpx request lines into standard event/action log lines
# Exact host -> platform label (checked first).
HTTPX_HOST_PLATFORMS = {}

# Domain-suffix fallback for dynamic hosts a third party hands back at runtime.
HTTPX_HOST_SUFFIX_PLATFORMS = {}

#########################################################################################################
#########################################################################################################
def platform_for_host(host: str) -> str:
    platform = HTTPX_HOST_PLATFORMS.get(host)
    if platform is None:
        platform = next(
            (p for suffix, p in HTTPX_HOST_SUFFIX_PLATFORMS.items() if host.endswith(suffix)),
            host,
        )
    return platform

#########################################################################################################
#########################################################################################################
def enrich_httpx_logs(logger_instance, log_method, event_dict):
    record = event_dict.get("_record")
    if record is None:
        return event_dict

    # Foreign 'event' strings are already %-formatted by ProcessorFormatter; the raw
    # args are only exposed (pass_foreign_args=True) so we can parse them here. Pop them
    # for EVERY foreign record so PositionalArgumentsFormatter never re-applies them
    # to an already-formatted string (URLs may contain literal '%').
    args = event_dict.pop("positional_args", None)

    if record.name != "httpx" and not record.name.startswith("httpx."):
        return event_dict

    event_dict["action"] = LogAction.OUTBOUND_HTTP
    event_dict["message"] = event_dict.get("event")  # original httpx line, preserved verbatim
    event_dict["event"] = LogEvent.HTTP_REQUEST_COMPLETED.name.lower()

    # httpx 0.28: logger.info('HTTP Request: %s %s "%s %d %s"', method, url, ver, code, reason)
    if isinstance(args, tuple) and len(args) == 5:
        try:
            method, url, _http_version, status_code, _reason = args
            platform = platform_for_host(httpx.URL(str(url)).host)
            event_dict["http_method"] = str(method)
            event_dict["url"] = str(url)
            event_dict["status_code"] = int(status_code)
            event_dict["platform"] = platform
            if int(status_code) >= 500:
                event_dict["level"] = "error"
            elif int(status_code) >= 400:
                event_dict["level"] = "warning"
        except Exception:
            pass  # never lose the log line over enrichment parsing

    return event_dict


# Processor: serializes Pydantic models, SQLAlchemy objects, dicts

#########################################################################################################
#########################################################################################################
def serialize_custom_objects(logger_instance, log_method, event_dict):
    for key, value in event_dict.items():
        if key in ("timestamp", "level", "event", "message", "logger", "exception", "_record", "exc_info"):
            continue
        if isinstance(value, (BaseModel, list, dict)) or hasattr(value, "_sa_instance_state"):
            try:
                event_dict[key] = jsonable_encoder(value, exclude_none=True, sqlalchemy_safe=True)
            except Exception as e:
                event_dict[key] = f"<Serialization Error: {e}>"
    return event_dict


# Processor: strips noisy context vars from local console output

#########################################################################################################
#########################################################################################################
def remove_context_vars(logger_instance, log_method, event_dict):
    keys_to_hide = [
        "request_id",
        "ip",
        "user_agent",
        "method",
        "country_code",
        "country_name",
        "user_id",
        "email",
        "endpoint",
        "response",
        "request_payload",
        "headers",
        "params",
        "http_request",
        "http_response",
    ]
    for key in keys_to_hide:
        event_dict.pop(key, None)
    return event_dict


# Processor: extracts exception info into structured fields (JSON renderer only)

#########################################################################################################
#########################################################################################################
def serialize_error_info(logger_instance, log_method, event_dict):
    exc_info = event_dict.pop("exc_info", None)

    if exc_info:
        if exc_info is True:
            exc_info = sys.exc_info()
        elif isinstance(exc_info, BaseException):
            exc_info = (type(exc_info), exc_info, exc_info.__traceback__)

        if exc_info and exc_info != (None, None, None):
            exc_type, exc_value, exc_traceback = exc_info

            event_dict["error_type"] = exc_type.__name__
            event_dict["error_message"] = str(exc_value)

            frames = traceback.extract_tb(exc_traceback)
            event_dict["traceback"] = [
                {
                    "file": frame.filename,
                    "line": frame.lineno,
                    "function": frame.name,
                    "code": frame.line,
                }
                for frame in frames
            ]

            if isinstance(exc_value, httpx.HTTPStatusError):
                request = exc_value.request
                response = exc_value.response

                req_body = None
                try:
                    if hasattr(request, "content") and request.content:
                        req_body = request.content.decode("utf-8")
                except Exception:
                    req_body = "<binary_or_undecodable>"

                res_body = None
                try:
                    res_body = response.json()
                except (json.JSONDecodeError, ValueError):
                    res_body = response.text

                query_params = dict(request.url.params)

                event_dict["http_request"] = {
                    "url": str(request.url),
                    "method": request.method,
                    "query_params": query_params,
                    "headers": dict(request.headers),
                    "body": req_body,
                }
                event_dict["http_response"] = {
                    "status_code": response.status_code,
                    "headers": dict(response.headers),
                    "body": res_body,
                }

    return event_dict


# Rich traceback formatter for local console output

#########################################################################################################
#########################################################################################################
def rich_traceback_formatter(sio, exc_info):
    console = Console(file=sio, force_terminal=True, width=140)

    site_packages = sysconfig.get_path("purelib")
    std_lib = sysconfig.get_path("stdlib")

    tb = Traceback.from_exception(
        *exc_info,
        show_locals=False,
        max_frames=2,
        suppress=[site_packages, std_lib],
    )
    sio.write("\n")
    console.print(tb)

    _, exc_value, _ = exc_info

    if isinstance(exc_value, httpx.HTTPStatusError):
        req = exc_value.request
        res = exc_value.response

        #########################################################################################################
        #########################################################################################################
        def format_headers(headers):
            return "\n".join([f"[cyan]{k}[/]: {v}" for k, v in headers.items()])

        #########################################################################################################
        #########################################################################################################
        def format_json_data(data):
            if not data:
                return Text("<Empty>", style="dim italic")
            try:
                if isinstance(data, (dict, list)):
                    return JSON(json.dumps(data))
                if isinstance(data, bytes):
                    data = data.decode("utf-8")
                return JSON(data)
            except Exception:
                return Text(str(data), style="yellow")

        query_params = dict(req.url.params)

        req_body_content = None
        try:
            if hasattr(req, "read"):
                req_body_content = req.read().decode("utf-8")
            elif req.content:
                req_body_content = req.content.decode("utf-8")
        except Exception:
            pass

        res_body_content = None
        try:
            res_body_content = res.text
        except Exception:
            pass

        request_group_items = [
            Text(f"{req.method} {req.url}", style="bold green"),
            Text(""),
        ]
        if query_params:
            request_group_items.extend([
                Text("Query Params:", style="bold underline"),
                format_json_data(query_params),
                Text(""),
            ])
        request_group_items.extend([
            Text("Headers:", style="bold underline"),
            Text.from_markup(format_headers(req.headers)),
            Text(""),
            Text("Body:", style="bold underline"),
            format_json_data(req_body_content),
        ])

        request_panel = Panel(
            Group(*request_group_items),
            title="[bold green]HTTP Request[/]",
            expand=True,
        )
        response_panel = Panel(
            Group(
                Text(f"Status: {res.status_code} {res.reason_phrase}", style="bold red"),
                Text(""),
                Text("Headers:", style="bold underline"),
                Text.from_markup(format_headers(res.headers)),
                Text(""),
                Text("Body:", style="bold underline"),
                format_json_data(res_body_content),
            ),
            title="[bold red]HTTP Response[/]",
            expand=True,
        )

        console.print("\n")
        console.print(Columns([request_panel, response_panel]))
        console.print("\n")


# Main logging setup — call once at startup

#########################################################################################################
#########################################################################################################
def setup_logging():
    common_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        enrich_httpx_logs,
        extract_event_message,
        require_action,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.PositionalArgumentsFormatter(),
        serialize_custom_objects,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if settings.ENVIRONMENT == Environment.LOCAL:
        processors_chain = [
            structlog.processors.TimeStamper(fmt="%m-%d %H:%M", utc=False),
            remove_context_vars,
            structlog.dev.ConsoleRenderer(
                colors=True,
                exception_formatter=rich_traceback_formatter,
            ),
        ]
    else:
        processors_chain = [
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            serialize_error_info,
            structlog.processors.JSONRenderer(),
        ]

    structlog.configure(
        processors=common_processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=common_processors,
        # Expose foreign records' raw %-args as `positional_args` so enrich_httpx_logs
        # can parse method/url/status out of httpx request lines. enrich_httpx_logs pops
        # the key for every foreign record, so nothing downstream ever re-formats.
        pass_foreign_args=True,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            *processors_chain,
        ],
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.INFO if not settings.DEBUG else logging.DEBUG)

    # no gunicorn.access here — a handler on it re-enables per-request access logs
    for _log in ["uvicorn", "uvicorn.error", "gunicorn", "gunicorn.error"]:
        _logger = logging.getLogger(_log)
        _logger.handlers = [handler]
        _logger.propagate = False

    logging.captureWarnings(True)

    logging.getLogger("py.warnings").handlers = [handler]
    logging.getLogger("py.warnings").propagate = False
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("botocore").setLevel(logging.WARNING)
