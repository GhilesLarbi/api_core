from uuid import UUID

import structlog

from app.taskiq.main import broker
from app.taskiq.dependencies.factories import UserServiceDep
from app.core.logger import LogAction, LogEvent

logger = structlog.get_logger(__name__)

#########################################################################################################
#########################################################################################################
@broker.task
async def log_user_task(
    user_id: str,
    user_service: UserServiceDep,
) -> None:
    user = await user_service.get_user(user_id=UUID(user_id))
    logger.info(
        LogEvent.USER_LOGGED,
        action=LogAction.SERVER,
        user=user,
    )
