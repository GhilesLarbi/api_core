from fastapi import Depends, Header, params
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated, List, Optional, Type
from uuid import UUID

from app.core.settings import settings
from app.core.security import decode_access_token
from app.core.app_config import get_app_config
from app.core.exceptions.exceptions import AppError
from app.core.exceptions.enums import ErrorCode
from app.core.permissions import Node
from app.api.dependencies.factories import UserServiceDep, AdminServiceDep
from app.models import User, Admin

oauth2_user_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/user/login",
    refreshUrl=f"{settings.API_V1_STR}/user/refresh",
    auto_error=False,
    scheme_name="UserBearer",
)

oauth2_admin_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/admin/login",
    refreshUrl=f"{settings.API_V1_STR}/admin/refresh",
    auto_error=False,
    scheme_name="AdminBearer",
)

#########################################################################################################
#########################################################################################################
async def get_authenticated_user(
    token: Annotated[str, Depends(oauth2_user_scheme)],
    user_service: UserServiceDep
) -> User:
    user_id_str = decode_access_token(token)
    if not user_id_str:
        raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)

    db_user = await user_service.get_user(user_id=UUID(user_id_str))
    if not db_user:
        raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)
    return db_user

AuthenticatedUser = Annotated[User, Depends(get_authenticated_user)]

#########################################################################################################
#########################################################################################################
async def get_optional_authenticated_user(
    token: Annotated[str, Depends(oauth2_user_scheme)],
    user_service: UserServiceDep,
) -> Optional[User]:
    if not token:
        return None

    return await get_authenticated_user(token=token, user_service=user_service)

OptionalAuthenticatedUser = Annotated[Optional[User], Depends(get_optional_authenticated_user)]

#########################################################################################################
#########################################################################################################
async def get_visitor_saved_post_ids(
    saved_post_ids: Annotated[Optional[str], Header(alias="X-Saved-Post-Ids")] = None,
) -> List[UUID]:
    if not saved_post_ids:
        return []

    wanted: List[UUID] = []
    for raw in saved_post_ids.split(","):
        try:
            wanted.append(UUID(raw.strip()))
        except ValueError:
            continue

    return wanted

VisitorSavedPostIdsDep = Annotated[List[UUID], Depends(get_visitor_saved_post_ids)]

#########################################################################################################
#########################################################################################################
async def get_authenticated_admin(
    token: Annotated[str, Depends(oauth2_admin_scheme)],
    admin_service: AdminServiceDep
) -> Admin:
    admin_id_str = decode_access_token(token)
    if not admin_id_str:
        raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)

    db_admin = await admin_service.get_admin(admin_id=UUID(admin_id_str))
    if not db_admin:
        raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)
    return db_admin

AuthenticatedAdmin = Annotated[Admin, Depends(get_authenticated_admin)]

#########################################################################################################
#########################################################################################################
async def require_available() -> None:
    if (await get_app_config()).maintenance_mode:
        raise AppError(error_code=ErrorCode.MAINTENANCE)

#########################################################################################################
#########################################################################################################
def RequireAdmin(permission: Type[Node]) -> params.Depends:
    async def dependency(
        db_admin: AuthenticatedAdmin,
        admin_service: AdminServiceDep,
    ) -> Admin:
        if not await admin_service.has_permission(admin_id=db_admin.id, path=permission.path()):
            raise AppError(error_code=ErrorCode.UNAUTHORIZED_ACCESS)
        return db_admin

    return Depends(dependency)
