import redis.asyncio as redis
from app.core.secrets import secrets

redis_client = redis.from_url(
    f"redis://{secrets.REDIS_HOST}:{secrets.REDIS_PORT}/0",
    encoding="utf-8",
    decode_responses=True
)

async def get_redis():
    yield redis_client