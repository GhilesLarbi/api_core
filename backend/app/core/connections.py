from contextlib import AsyncExitStack
from typing import Any, AsyncGenerator

import aioboto3
import redis.asyncio as aioredis
import structlog
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.settings import settings
from app.core.logger import LogAction, LogEvent
from app.core.secrets import secrets


logger = structlog.get_logger(__name__)


#########################################################################################################
#########################################################################################################
_engine = create_async_engine(
    secrets.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=30,
    max_overflow=50,
    pool_timeout=30,
    pool_recycle=1800,
    echo=False,
    connect_args={
        "server_settings": {
            "application_name": settings.PROJECT_NAME,
        },
    },
)
AsyncSessionLocal = async_sessionmaker(bind=_engine, expire_on_commit=False)


#########################################################################################################
#########################################################################################################
_engine_no_pool = create_async_engine(
    secrets.DATABASE_URL,
    poolclass=NullPool,
    pool_pre_ping=True,
    echo=False,
    connect_args={
        "timeout": 10,
        "command_timeout": 60,
        "server_settings": {
            "application_name": settings.PROJECT_NAME,
        },
    },
)
AsyncSessionLocalNoPool = async_sessionmaker(bind=_engine_no_pool, expire_on_commit=False)


#########################################################################################################
#########################################################################################################
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


#########################################################################################################
#########################################################################################################
async def get_async_db_no_pool() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocalNoPool() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


#########################################################################################################
#########################################################################################################
_redis_client = aioredis.from_url(
    secrets.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
)


#########################################################################################################
#########################################################################################################
async def connect_redis() -> None:
    await _redis_client.ping()
    logger.info(
        LogEvent.REDIS_CONNECTED,
        action=LogAction.SERVER,
    )


#########################################################################################################
#########################################################################################################
async def close_redis() -> None:
    await _redis_client.aclose()
    logger.info(
        LogEvent.REDIS_CLOSED,
        action=LogAction.SERVER,
    )


#########################################################################################################
#########################################################################################################
def get_redis() -> aioredis.Redis:
    return _redis_client


#########################################################################################################
#########################################################################################################
s3_session = aioboto3.Session(
    aws_access_key_id=secrets.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=secrets.AWS_SECRET_ACCESS_KEY,
    region_name="us-east-1",
)
_s3_stack: AsyncExitStack | None = None
_s3_client: Any = None


#########################################################################################################
#########################################################################################################
async def connect_s3() -> None:
    global _s3_stack, _s3_client
    _s3_stack = AsyncExitStack()
    _s3_client = await _s3_stack.enter_async_context(
        s3_session.client("s3", endpoint_url=secrets.SEAWEEDFS_S3_URL)
    )
    logger.info(
        LogEvent.S3_CONNECTED,
        action=LogAction.SERVER,
    )


#########################################################################################################
#########################################################################################################
async def close_s3() -> None:
    global _s3_stack, _s3_client
    if _s3_stack is not None:
        await _s3_stack.aclose()
        _s3_stack = None
        _s3_client = None
        logger.info(
            LogEvent.S3_CLOSED,
            action=LogAction.SERVER,
        )


#########################################################################################################
#########################################################################################################
def get_s3() -> Any:
    return _s3_client
