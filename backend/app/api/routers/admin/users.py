from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query

from typing import Annotated
from app.api.dependencies.auth import RequireAdmin
from app.core.permissions import users as users_permission
from app.models import Admin
from app.api.dependencies.factories import UserServiceDep
from app.api.dependencies.language import require_lang
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.messages.enums import SuccessCode
from app.core.middlewares.logger_context import StructlogRoute
from app.schemas import common as common_schemas
from app.schemas.common import Paginated
from app.schemas.user import (
    UserAdminCreate,
    UserAdminUpdate,
    UserResponse,
    UserSortBy,
    UserSortDirection,
)

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.get(
    "",
    response_model=Paginated[UserResponse],
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def list_users(
    db_admin: Annotated[Admin, RequireAdmin(users_permission.read)],
    user_service: UserServiceDep,
    q: Optional[str] = None,
    sort_by: UserSortBy = Query(default=UserSortBy.CREATED_AT),
    sort_direction: UserSortDirection = Query(default=UserSortDirection.DESC),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
):
    items, total = await user_service.list_users(
        q=q,
        sort_by=sort_by,
        sort_direction=sort_direction,
        page=page,
        limit=limit,
    )
    return Paginated(items=items, total=total, page=page, limit=limit)

#########################################################################################################
#########################################################################################################
@router.post(
    "",
    response_model=UserResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ALREADY_EXISTS,
        ErrorCode.COMPROMISED_PASSWORD,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def create_user(
    user_create: UserAdminCreate,
    db_admin: Annotated[Admin, RequireAdmin(users_permission.create)],
    user_service: UserServiceDep,
):
    return await user_service.admin_create_user(user_create=user_create)

#########################################################################################################
#########################################################################################################
@router.put(
    "/{user_id}",
    response_model=UserResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.ALREADY_EXISTS,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def update_user(
    user_id: UUID,
    user_update: UserAdminUpdate,
    db_admin: Annotated[Admin, RequireAdmin(users_permission.update)],
    user_service: UserServiceDep,
):
    return await user_service.admin_update_user(
        user_id=user_id,
        user_update=user_update,
    )

#########################################################################################################
#########################################################################################################
@router.delete(
    "/{user_id}",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def delete_user(
    user_id: UUID,
    db_admin: Annotated[Admin, RequireAdmin(users_permission.delete)],
    user_service: UserServiceDep,
):
    await user_service.delete_user(user_id=user_id)
    return common_schemas.MessageResponse.of(code=SuccessCode.USER_ACCOUNT_DELETED)
