from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Any, TYPE_CHECKING


_SECRETS_CACHE: Optional["Secrets"] = None 

class Secrets(BaseSettings):
    ADMIN_USER_EMAIL: str
    ADMIN_USER_PASSWORD: str
    TEST_USER_EMAIL: str
    TEST_USER_PASSWORD: str


    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_PORT: str
    POSTGRES_HOST: str
    POSTGRES_PROXY_HOST: str

    SECRET_KEY: str        

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )


def get_secrets() -> Secrets:
    global _SECRETS_CACHE
    if _SECRETS_CACHE is not None:
        return _SECRETS_CACHE
    
    _SECRETS_CACHE = Secrets()
    return _SECRETS_CACHE



############################################################################
############################################################################
class SecretsProxy:
    def __getattr__(self, name: str) -> Any:
        real_secrets = get_secrets()
        return getattr(real_secrets, name)

if TYPE_CHECKING:
    secrets = Secrets()
else:
    secrets = SecretsProxy()