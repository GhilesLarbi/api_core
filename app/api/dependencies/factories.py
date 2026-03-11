from fastapi import Depends
from typing import Annotated, AsyncGenerator

from app.services.service_provider import ServiceProvider
from app.services.user.user_service import UserService
from app.services.profile.profile_service import ProfileService
from app.services.post.post_service import PostService

from app.core.db_sessions import AsyncSessionLocal

#################################################################################
# ---  Providers ---
#################################################################################

async def get_service_provider() -> AsyncGenerator[ServiceProvider, None]:    
    provider = ServiceProvider(session_factory=AsyncSessionLocal)
    try:
        yield provider
    finally:
        await provider._close_current_session()


ServiceProviderDep = Annotated[ServiceProvider, Depends(get_service_provider)]

#################################################################################
# --- Service Factories ---
#################################################################################
def get_user_service(services: ServiceProviderDep) -> UserService:
    return services.user_service

def get_profile_service(services: ServiceProviderDep) -> ProfileService:
    return services.profile_service

def get_post_service(services: ServiceProviderDep) -> PostService:
    return services.post_service


UserServiceDep = Annotated[UserService, Depends(get_user_service)]
ProfileServiceDep = Annotated[ProfileService, Depends(get_profile_service)]
PostServiceDep = Annotated[PostService, Depends(get_post_service)]