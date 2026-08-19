from typing import Annotated, Any, Callable

import structlog
from fastapi import BackgroundTasks, Depends

from app.core.connections import AsyncSessionLocalNoPool
from app.core.logger import LogAction, LogEvent
from app.services.service_provider import ServiceProvider


logger = structlog.get_logger(__name__)


#########################################################################################################
#########################################################################################################
class ServicesBackgroundTasksClass:

    #########################################################################################################
    #########################################################################################################
    def __init__(
        self,
        background_tasks: BackgroundTasks,
    ) -> None:
        self.background_tasks = background_tasks

    #########################################################################################################
    #########################################################################################################
    def add_task(
        self,
        func: Callable,
        *args: Any,
        **kwargs: Any,
    ) -> None:
        service_instance = getattr(func, "__self__", None)
        if not service_instance:
            raise TypeError("The function passed to add_task must be a method of a service instance.")

        service_class = type(service_instance)
        method_name = func.__name__

        #########################################################################################################
        #########################################################################################################
        async def task_runner() -> None:
            provider = ServiceProvider(session_factory=AsyncSessionLocalNoPool)

            try:
                fresh_instance = provider.get_by_class(dependency_class=service_class)
                method_to_call = getattr(fresh_instance, method_name)
                await method_to_call(*args, **kwargs)
                if provider._session:
                    await provider.session.commit()
            except Exception as e:
                logger.error(
                    LogEvent.BACKGROUND_TASK_FAILED,
                    action=LogAction.SERVER,
                    service=service_class.__name__,
                    method=method_name,
                    args=args,
                    kwargs=kwargs,
                    exc_info=e,
                )
                if provider._session:
                    await provider._session.rollback()
            finally:
                await provider._close_current_session()

        self.background_tasks.add_task(task_runner)


#########################################################################################################
#########################################################################################################
def get_service_background_tasks(background_tasks: BackgroundTasks) -> ServicesBackgroundTasksClass:
    return ServicesBackgroundTasksClass(background_tasks=background_tasks)


ServicesBackgroundTasks = Annotated[ServicesBackgroundTasksClass, Depends(get_service_background_tasks)]
