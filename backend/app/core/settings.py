import os
from enum import StrEnum
from pydantic import AnyHttpUrl, model_validator
from pydantic_settings import BaseSettings
from app.core.language.enums import Lang

#########################################################################################################
#########################################################################################################
class Environment(StrEnum):
    PRODUCTION = "PRODUCTION"
    STAGING = "STAGING"
    LOCAL = "LOCAL"

#########################################################################################################
#########################################################################################################
class Settings(BaseSettings):
    PROJECT_NAME: str = "SaaS Template"

    ENVIRONMENT: Environment = os.environ.get("ENVIRONMENT", Environment.LOCAL)

    DEBUG: bool = False

    DEFAULT_LANG: Lang = Lang.EN

    #############################################
    #############################################
    API_HOST: str = '0.0.0.0'
    API_PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    #############################################
    #############################################
    API_WORKERS: int = 4
    @model_validator(mode="after")
    def set_api_workers(self) -> "Settings":
        if self.ENVIRONMENT == Environment.PRODUCTION:
            self.API_WORKERS = 4
        elif self.ENVIRONMENT == Environment.STAGING:
            self.API_WORKERS = 4
        else:
            self.API_WORKERS = 1
        return self

    #############################################
    #############################################
    TASKIQ_WORKERS: int = 2
    @model_validator(mode="after")
    def set_taskiq_workers(self) -> "Settings":
        if self.ENVIRONMENT == Environment.PRODUCTION:
            self.TASKIQ_WORKERS = 2
        elif self.ENVIRONMENT == Environment.STAGING:
            self.TASKIQ_WORKERS = 2
        else:
            self.TASKIQ_WORKERS = 1
        return self


    #############################################
    #############################################
    SERVER_HOST: AnyHttpUrl = f"http://127.0.0.1:8000"
    USER_WEB_HOST: AnyHttpUrl = "http://localhost:3000"
    ADMIN_WEB_HOST: AnyHttpUrl = "http://localhost:3002"
    SEAWEEDFS_CDN_HOST: AnyHttpUrl = "http://localhost:8333"
    @model_validator(mode="after")
    def set_hosts(self) -> "Settings":
        if self.ENVIRONMENT == Environment.PRODUCTION:
            self.SERVER_HOST = AnyHttpUrl("https://api.example.com")
            self.USER_WEB_HOST = AnyHttpUrl("https://example.com")
            self.ADMIN_WEB_HOST = AnyHttpUrl("https://admin.example.com")
            self.SEAWEEDFS_CDN_HOST = AnyHttpUrl("https://cdn.example.com")
        elif self.ENVIRONMENT == Environment.STAGING:
            self.SERVER_HOST = AnyHttpUrl("https://api.staging.example.com")
            self.USER_WEB_HOST = AnyHttpUrl("https://staging.example.com")
            self.ADMIN_WEB_HOST = AnyHttpUrl("https://admin.staging.example.com")
            self.SEAWEEDFS_CDN_HOST = AnyHttpUrl("https://cdn.staging.example.com")
        else:
            self.SERVER_HOST = AnyHttpUrl("http://127.0.0.1:8000")
            self.USER_WEB_HOST = AnyHttpUrl("http://localhost:3000")
            self.ADMIN_WEB_HOST = AnyHttpUrl("http://localhost:3002")
            self.SEAWEEDFS_CDN_HOST = AnyHttpUrl("http://localhost:8333")
        return self

    #############################################
    #############################################
    REFRESH_TOKEN_EXPIRE: int = 180 * 24 * 3600
    ACCESS_TOKEN_EXPIRE: int = 15 * 60
    PASSWORD_RESET_TOKEN_EXPIRE: int = 24 * 3600


    #############################################
    #############################################
    EMAIL_VERIFICATION_TOKEN_EXPIRE: int = 48 * 3600
    EMAIL_CHANGE_TOKEN_EXPIRE: int = 24 * 3600
    ALGORITHM: str = "HS256"

    #############################################
    #############################################
    MAIL_FROM_NAME: str = "SaaS Template"
    MAIL_SSL_TLS: bool = True
    MAIL_STARTTLS: bool = False
    SEND_EMAILS: bool = False

    REQUESTS_TIME_OUT: int = 30

    # how long a worker may serve its own copy of the admin-editable settings, in seconds
    APP_CONFIG_RELOAD_INTERVAL: int = 60

    TEMP_BUCKET: str = "temp-fs"
    PRESIGN_EXPIRES_IN: int = 3600
    MIN_UPLOAD_SIZE: int = 10 * 1024
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024
    FILE_SNIFF_SIZE: int = 8192


settings = Settings()
