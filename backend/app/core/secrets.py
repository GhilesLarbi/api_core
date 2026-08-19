from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Any, TYPE_CHECKING


_SECRETS_CACHE: Optional["Secrets"] = None 

#########################################################################################################
#########################################################################################################
class Secrets(BaseSettings):
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_PORT: str
    POSTGRES_HOST: str

    REDIS_USER: str
    REDIS_PASSWORD: str
    REDIS_HOST: str
    REDIS_PORT: str

    MAIL_SERVER: str
    MAIL_PORT: int
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str

    SEAWEEDFS_HOST: str
    SEAWEEDFS_S3_PORT: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str

    SECRET_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )

    #########################################################################################################
    #########################################################################################################
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    #########################################################################################################
    #########################################################################################################
    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_USER}:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    #########################################################################################################
    #########################################################################################################
    @property
    def SEAWEEDFS_S3_URL(self) -> str:
        return f"http://{self.SEAWEEDFS_HOST}:{self.SEAWEEDFS_S3_PORT}"

#########################################################################################################
#########################################################################################################
def get_secrets() -> Secrets:
    global _SECRETS_CACHE
    if _SECRETS_CACHE is not None:
        return _SECRETS_CACHE
    
    _SECRETS_CACHE = Secrets()
    return _SECRETS_CACHE

#########################################################################################################
#########################################################################################################
class SecretsProxy:
    #########################################################################################################
    #########################################################################################################
    def __getattr__(self, name: str) -> Any:
        real_secrets = get_secrets()
        return getattr(real_secrets, name)

if TYPE_CHECKING:
    secrets = Secrets()
else:
    secrets = SecretsProxy()