from typing import Annotated, AsyncGenerator

from taskiq import TaskiqDepends

from app.services.service_provider import ServiceProvider
from app.services.user.user_service import UserService

from app.core.connections import AsyncSessionLocal

#########################################################################################################
# ---  Providers ---
#########################################################################################################

#########################################################################################################
#########################################################################################################
async def get_service_provider() -> AsyncGenerator[ServiceProvider, None]:
    provider = ServiceProvider(session_factory=AsyncSessionLocal)
    try:
        yield provider
    finally:
        await provider._close_current_session()


ServiceProviderDep = Annotated[ServiceProvider, TaskiqDepends(get_service_provider)]

#########################################################################################################
# --- Service Factories ---
#########################################################################################################

#########################################################################################################
#########################################################################################################
def get_user_service(services: ServiceProviderDep) -> UserService:
    return services.user_service


UserServiceDep = Annotated[UserService, TaskiqDepends(get_user_service)]
