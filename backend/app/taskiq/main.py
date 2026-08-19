from app.core.logger import setup_logging
setup_logging()

from taskiq_redis import RedisAsyncResultBackend, ListQueueBroker, RedisScheduleSource
from taskiq import TaskiqScheduler, TaskiqEvents, TaskiqState
from app.core.connections import close_redis, close_s3, connect_redis, connect_s3
from app.core.secrets import secrets

#########################################################################################################
#########################################################################################################
result_backend = RedisAsyncResultBackend(
    redis_url=secrets.REDIS_URL,
)

broker = (
    # redis-py 8 defaults socket_timeout to 5s; the blocking BRPOP in listen() must be
    # able to wait indefinitely, so disable the read timeout on the broker connection.
    ListQueueBroker(url=secrets.REDIS_URL, socket_timeout=None)
    .with_result_backend(result_backend)
)


@broker.on_event(TaskiqEvents.WORKER_STARTUP)
async def worker_startup(state: TaskiqState) -> None:
    await connect_redis()
    await connect_s3()

@broker.on_event(TaskiqEvents.WORKER_SHUTDOWN)
async def worker_shutdown(state: TaskiqState) -> None:
    await close_s3()
    await close_redis()


#########################################################################################################
#########################################################################################################
redis_source = RedisScheduleSource(secrets.REDIS_URL)

scheduler = TaskiqScheduler(
    broker=broker,
    sources=[redis_source],
)

