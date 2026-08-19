from app.core.exceptions.enums import ErrorCode
from app.core.middlewares.exceptions import ErrorResponse

#########################################################################################################
#########################################################################################################
def error_responses(*codes: ErrorCode) -> dict:
    """Build the OpenAPI `responses=` entry for the given ErrorCodes.

    Status code and message are read from each ErrorCode, so the docs stay in sync
    with what the handlers actually return. Codes sharing a status are grouped, one
    example per code.
    """
    grouped: dict[int, list[ErrorCode]] = {}
    for code in codes:
        grouped.setdefault(code.status_code, []).append(code)

    responses: dict = {}
    for status_code, group in grouped.items():
        examples = {}
        for code in group:
            value = {
                "success": False,
                "error_code": code.name,
                "message": code.message,
            }
            # `field` is only populated for validation errors, so only show it there.
            if code is ErrorCode.INVALID_PARAMETERS:
                value["field"] = "body.email"
            examples[code.name] = {"value": value}

        responses[status_code] = {
            "model": ErrorResponse,
            "content": {"application/json": {"examples": examples}},
        }
    return responses
