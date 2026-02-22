from taskiq_redis import RedisAsyncResultBackend, ListQueueBroker, RedisScheduleSource
from taskiq import TaskiqScheduler
from app.core.secrets import secrets
from taskiq.middlewares.taskiq_admin_middleware import TaskiqAdminMiddleware

#####################################################################################
#####################################################################################
result_backend = RedisAsyncResultBackend(
    redis_url=f"redis://{secrets.REDIS_HOST}:{secrets.REDIS_PORT}/0"
)

#####################################################################################
#####################################################################################
broker = (
    ListQueueBroker(url=f"redis://{secrets.REDIS_HOST}:{secrets.REDIS_PORT}/0")
    .with_result_backend(result_backend)

    .with_middlewares(
        TaskiqAdminMiddleware(
            url="http://taskiq_dashboard:8000",
            api_token="supersecret",
            taskiq_broker_name="my_worker",
        )
    )
)

#####################################################################################
#####################################################################################
redis_source = RedisScheduleSource(
    f"redis://{secrets.REDIS_HOST}:{secrets.REDIS_PORT}/0"
)

#####################################################################################
#####################################################################################
scheduler = TaskiqScheduler(
    broker=broker, 
    sources=[redis_source]
)