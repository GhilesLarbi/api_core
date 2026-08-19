"""Shared factory for outbound httpx clients, the single path every third party call takes
so all external traffic is uniformly logged and time-limited."""

import json

import httpx
import structlog

from app.core.settings import settings
from app.core.logger import LogAction, LogEvent
from app.core.logger.setup import platform_for_host

logger = structlog.get_logger(__name__)

LOGGED_CONTENT_TYPES = ("application/json", "text/")

# Keep logged bodies bounded so a single log line stays parseable.
MAX_LOGGED_BODY_CHARS = 16_384

#########################################################################################################
#########################################################################################################
def _truncate(text: str) -> str:
    if len(text) > MAX_LOGGED_BODY_CHARS:
        return text[:MAX_LOGGED_BODY_CHARS] + f"...<truncated, {len(text)} chars total>"
    return text

#########################################################################################################
#########################################################################################################
async def _log_response(response: httpx.Response) -> None:
    request = response.request
    status = response.status_code
    url = str(request.url)

    req_body = None
    try:
        if request.content:
            req_body = _truncate(request.content.decode("utf-8"))
    except Exception:
        req_body = "<binary_or_undecodable>"

    res_body = None
    content_type = response.headers.get("content-type", "")
    if status >= 400 or content_type.startswith(LOGGED_CONTENT_TYPES):
        try:
            await response.aread()
            if len(response.text) > MAX_LOGGED_BODY_CHARS:
                res_body = _truncate(response.text)
            else:
                try:
                    res_body = response.json()
                except (json.JSONDecodeError, ValueError):
                    res_body = response.text
        except Exception:
            res_body = "<unreadable>"

    log = logger.error if status >= 500 else logger.warning if status >= 400 else logger.info
    log(
        LogEvent.HTTP_REQUEST_COMPLETED,
        action=LogAction.OUTBOUND_HTTP,
        message=f'HTTP Request: {request.method} {url} "{response.http_version} {status} {response.reason_phrase}"',
        http_method=request.method,
        url=url,
        status_code=status,
        platform=platform_for_host(request.url.host),
        http_request={
            "url": url,
            "method": request.method,
            "query_params": dict(request.url.params),
            "headers": dict(request.headers),
            "body": req_body,
        },
        http_response={
            "status_code": status,
            "headers": dict(response.headers),
            "body": res_body,
        },
    )

#########################################################################################################
#########################################################################################################
def http_client(**kwargs) -> httpx.AsyncClient:
    event_hooks = kwargs.pop("event_hooks", {})
    event_hooks = {**event_hooks, "response": [_log_response, *event_hooks.get("response", [])]}
    kwargs.setdefault("timeout", settings.REQUESTS_TIME_OUT)
    return httpx.AsyncClient(event_hooks=event_hooks, **kwargs)
