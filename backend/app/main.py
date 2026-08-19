from app.core.settings import settings, Environment
from app.core.secrets import secrets
from app.core.logger import setup_logging

setup_logging()

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api.routers.user import router as user_router
from app.api.routers.public import router as public_router
from app.api.routers.admin import router as admin_router
from app.core.connections import connect_redis, close_redis, connect_s3, close_s3
from app.core.exceptions import AppError
from app.core.middlewares.exceptions import (
    global_exception_handler,
    app_error_handler,
    http_exception_handler,
    request_validation_exception_handler,
    response_validation_exception_handler,
)
from app.core.middlewares.language import LanguageMiddleware
import gunicorn.app.base, uvicorn




#########################################################################################################
#########################################################################################################
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_redis()
    await connect_s3()
    yield
    await close_s3()
    await close_redis()


#########################################################################################################
#########################################################################################################
app = FastAPI(
    lifespan=lifespan,
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="SaaS Template API — authentication, accounts, admin permissions, storage and app configuration.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=None,
    redoc_url=None,
    redirect_slashes=False,
)


app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, request_validation_exception_handler)
app.add_exception_handler(ResponseValidationError, response_validation_exception_handler)
app.add_middleware(SessionMiddleware, secret_key=secrets.SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=(
        r"https://([a-z0-9-]+\.)*example\.com"            # example.com + any subdomain depth
        r"|https?://([a-z0-9-]+\.)*localhost(:\d+)?"      # localhost + subdomains + any port
        r"|https?://127\.0\.0\.1(:\d+)?"                  # 127.0.0.1 + any port
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LanguageMiddleware)
app.add_middleware(GZipMiddleware)


app.include_router(router=user_router)
app.include_router(router=public_router)
app.include_router(router=admin_router)


#########################################################################################################
#########################################################################################################
class StandaloneApplication(gunicorn.app.base.BaseApplication):
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        config = {key: value for key, value in self.options.items()
                  if key in self.cfg.settings and value is not None}
        for key, value in config.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application



#########################################################################################################
#########################################################################################################
if __name__ == "__main__":
    if settings.ENVIRONMENT in (Environment.PRODUCTION, Environment.STAGING):
        def _rewire_logging(_):
            setup_logging()

        gunicorn_options = {
            "bind": f"{settings.API_HOST}:{settings.API_PORT}",
            "workers": settings.API_WORKERS,
            "worker_class": "uvicorn_worker.UvicornWorker",
            "reload": False,
            "accesslog": None,
            "post_worker_init": _rewire_logging,
            "when_ready": _rewire_logging,
        }
        StandaloneApplication(app, gunicorn_options).run()
    else:
        uvicorn.run(
            "app.main:app",
            host=settings.API_HOST,
            port=settings.API_PORT,
            reload=True,
            log_level="info",
            access_log=False,
            use_colors=False,
            timeout_graceful_shutdown=1,
        )
