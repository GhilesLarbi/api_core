"""Custom route class installed on every router so each HTTP request gets structured
access logging. It rebinds structlog contextvars with the request's id, path, headers and
body before the endpoint runs, which is how every log line during a request carries
request scoped fields in CloudWatch, then emits the completed or failed access line with
status, duration and response payload."""

import time, json, structlog
from typing import Callable
from fastapi import Request, Response
from fastapi.routing import APIRoute
from app.core.logger import LogAction, LogEvent

logger = structlog.get_logger("api.access")
MAX_LOG_SIZE = 1_024 * 1024

#########################################################################################################
#########################################################################################################
class StructlogRoute(APIRoute):
    #########################################################################################################
    #########################################################################################################
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            structlog.contextvars.clear_contextvars()
            request_body = None
            if request.method in ("POST", "PUT", "PATCH"):
                try:
                    body_bytes = await request.body()
                    if body_bytes:
                        content_type = request.headers.get("content-type", "").lower()
                        if "application/json" in content_type:
                            try:
                                request_body = json.loads(body_bytes)
                            except Exception:
                                request_body = body_bytes.decode(errors="replace")
                        else:
                            request_body = body_bytes.decode(errors="replace")
                except Exception:
                    request_body = "<error-capturing-body>"

            structlog.contextvars.bind_contextvars(
                method=request.method,
                path=request.url.path,
                params=dict(request.query_params),
                request_payload=request_body,
                headers=dict(request.headers),
            )

            start_time = time.perf_counter()
            request.state.start_time = start_time

            response: Response = await original_route_handler(request)

            process_time = time.perf_counter() - start_time
            response_body = "<non-json-response>"

            content_type = response.headers.get("content-type", "").lower()
            if "application/json" in content_type:
                try:
                    raw = response.body
                    if len(raw) <= MAX_LOG_SIZE:
                        response_body = json.loads(raw)
                    else:
                        response_body = "<response-too-large>"
                except Exception:
                    pass

            log_kwargs = dict(
                status_code=response.status_code,
                process_time=f"{process_time:.4f}s",
                response=response_body,
            )

            if response.status_code >= 400:
                logger.error(LogEvent.HTTP_REQUEST_FAILED, action=LogAction.INBOUND_HTTP, **log_kwargs)
            else:
                logger.info(LogEvent.HTTP_REQUEST_COMPLETED, action=LogAction.INBOUND_HTTP, **log_kwargs)

            return response

        return custom_route_handler
