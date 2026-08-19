from app.core.exceptions.enums import ErrorCode

#########################################################################################################
#########################################################################################################
class AppError(Exception):
    """Base application error. Carries an ErrorCode; the HTTP status code is derived from it."""

    #########################################################################################################
    #########################################################################################################
    def __init__(
        self,
        error_code: ErrorCode,
    ) -> None:
        self.error_code = error_code
        self.status_code = error_code.status_code
        super().__init__(error_code.message)
