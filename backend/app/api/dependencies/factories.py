from fastapi import Depends
from typing import Annotated, AsyncGenerator

from app.services.service_provider import ServiceProvider
from app.services.user.user_service import UserService
from app.services.admin.admin_service import AdminService
from app.services.permission.permission_service import PermissionService
from app.services.post.post_service import PostService

from app.core.connections import AsyncSessionLocal

# ---  Providers ---

#########################################################################################################
#########################################################################################################
async def get_service_provider() -> AsyncGenerator[ServiceProvider, None]:
    provider = ServiceProvider(session_factory=AsyncSessionLocal)
    try:
        yield provider
    finally:
        await provider._close_current_session()


ServiceProviderDep = Annotated[ServiceProvider, Depends(get_service_provider)]

# --- Service Factories ---

#########################################################################################################
#########################################################################################################
def get_user_service(services: ServiceProviderDep) -> UserService:
    return services.user_service


UserServiceDep = Annotated[UserService, Depends(get_user_service)]

#########################################################################################################
#########################################################################################################
def get_admin_service(services: ServiceProviderDep) -> AdminService:
    return services.admin_service


AdminServiceDep = Annotated[AdminService, Depends(get_admin_service)]

#########################################################################################################
#########################################################################################################
def get_permission_service(services: ServiceProviderDep) -> PermissionService:
    return services.permission_service


PermissionServiceDep = Annotated[PermissionService, Depends(get_permission_service)]

#########################################################################################################
#########################################################################################################
def get_post_service(services: ServiceProviderDep) -> PostService:
    return services.post_service


PostServiceDep = Annotated[PostService, Depends(get_post_service)]
