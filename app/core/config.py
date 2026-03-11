from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "api_core"

    API_HOST: str = '0.0.0.0'
    API_PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    SERVER_HOST: AnyHttpUrl = f"http://127.0.0.1:8000" 
    FRONTEND_HOST: AnyHttpUrl = "http://localhost:3000"

    REFRESH_TOKEN_EXPIRE_DAYS: int = 180 # 6 months
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    ALGORITHM: str = "HS256"    

    DEBUG: bool = False

    
settings = Settings()