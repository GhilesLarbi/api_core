"""Last line of defense translating every error that escapes an endpoint into the uniform
JSON envelope the storefront, mobile app and admin dashboard parse — a success flag plus an
error code name and message. Registered on the FastAPI app at startup, and each handler also
emits the access log line so failed requests still reach the logs with status and timing."""

import time
from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from fastapi.responses import JSONResponse
from app.core.exceptions import AppError, ErrorCode
from app.core.logger import LogAction, LogEvent
from pydantic import BaseModel, field_serializer
from typing import Optional
import structlog

logger = structlog.get_logger("api.access")

#########################################################################################################
#########################################################################################################
def _process_time(request: Request) -> str:
    start = getattr(request.state, "start_time", None)
    if start is None:
        return "0.0000s"
    return f"{time.perf_counter() - start:.4f}s"

#########################################################################################################
#########################################################################################################
class ErrorResponse(BaseModel):
    success: bool = False
    error_code: Optional[ErrorCode] = ErrorCode.UNKNOWN_ERROR
    message: Optional[str] = None
    field: Optional[str] = None

    @field_serializer("error_code")
    def serialize_error_code(
        self,
        error_code: ErrorCode,
        _info,
    ):
        return error_code.name

#########################################################################################################
#########################################################################################################
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    content = ErrorResponse(
        error_code=ErrorCode.UNKNOWN_ERROR,
        message=f"{str(exc)}",
    ).model_dump(mode="json", exclude_none=True)
    logger.error(
        LogEvent.HTTP_REQUEST_FAILED,
        action=LogAction.SERVER,
        status_code=500,
        process_time=_process_time(request=request),
        response=content,
        exc_info=exc,
    )
    return JSONResponse(status_code=500, content=content)

#########################################################################################################
#########################################################################################################
async def app_error_handler(
    request: Request,
    exc: AppError,
):
    content = ErrorResponse(
        error_code=exc.error_code,
        # A raise site may attach its own message when the code alone cannot say enough.
        message=getattr(exc, "message", None) or exc.error_code.message,
    ).model_dump(mode="json", exclude_none=True)
    logger.info(
        LogEvent.HTTP_REQUEST_COMPLETED,
        action=LogAction.SERVER,
        status_code=exc.status_code,
        process_time=_process_time(request=request),
        response=content,
    )
    return JSONResponse(status_code=exc.status_code, content=content)

#########################################################################################################
#########################################################################################################
async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):
    content = ErrorResponse(
        error_code=ErrorCode.INVALID_PARAMETERS,
        message=exc.detail,
    ).model_dump(mode="json", exclude_none=True)
    logger.info(
        LogEvent.HTTP_REQUEST_COMPLETED,
        action=LogAction.SERVER,
        status_code=exc.status_code,
        process_time=_process_time(request=request),
        response=content,
    )
    return JSONResponse(status_code=exc.status_code, content=content)

#########################################################################################################
#########################################################################################################
async def request_validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    errors = exc.errors()
    for error in errors:
        if 'ctx' in error and 'error' in error['ctx']:
            error['ctx']['error'] = str(error['ctx']['error'])

    if errors:
        error = errors[0]
        error_response = ErrorResponse(
            error_code=ErrorCode.INVALID_PARAMETERS,
            message=str(error.get('msg', 'Validation error')),
            field='.'.join(map(str, error['loc'])) if error['loc'] else None,
        )
    else:
        error_response = ErrorResponse(
            error_code=ErrorCode.INVALID_PARAMETERS,
            message="Validation error",
        )

    content = error_response.model_dump(mode="json", exclude_none=True)
    logger.info(
        LogEvent.HTTP_REQUEST_COMPLETED,
        action=LogAction.SERVER,
        status_code=422,
        process_time=_process_time(request=request),
        response=content,
    )
    return JSONResponse(status_code=422, content=content)

#########################################################################################################
#########################################################################################################
async def response_validation_exception_handler(
    request: Request,
    exc: ResponseValidationError,
):
    content = ErrorResponse(
        error_code=ErrorCode.DEVELOPMENT_ISSUE,
    ).model_dump(mode="json", exclude_none=True)
    logger.error(
        LogEvent.HTTP_REQUEST_FAILED,
        action=LogAction.SERVER,
        status_code=400,
        process_time=_process_time(request=request),
        response=content,
        exc_info=exc,
    )
    return JSONResponse(status_code=400, content=content)
