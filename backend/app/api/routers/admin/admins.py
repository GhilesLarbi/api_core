from uuid import UUID
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query

from app.api.dependencies.auth import RequireAdmin
from app.api.dependencies.factories import AdminServiceDep
from app.api.dependencies.language import require_lang
from app.core.permissions import admins as admins_permission
from app.models import Admin
from app.schemas.admin import (
    AdminCreate,
    AdminPasswordReset,
    AdminPermissionsUpdate,
    AdminProfileUpdate,
    AdminResponse,
    AdminSortBy,
    AdminSortDirection,
)
from app.schemas import common as common_schemas
from app.schemas.common import Paginated
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.messages.enums import SuccessCode
from app.core.middlewares.logger_context import StructlogRoute

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.get(
    "",
    response_model=Paginated[AdminResponse],
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def list_admins(
    db_admin: Annotated[Admin, RequireAdmin(admins_permission.read)],
    admin_service: AdminServiceDep,
    q: Optional[str] = None,
    sort_by: AdminSortBy = Query(default=AdminSortBy.CREATED_AT),
    sort_direction: AdminSortDirection = Query(default=AdminSortDirection.DESC),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
):
    items, total = await admin_service.list_admins(
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
    response_model=AdminResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ALREADY_EXISTS,
        ErrorCode.COMPROMISED_PASSWORD,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def create_admin(
    admin_create: AdminCreate,
    db_admin: Annotated[Admin, RequireAdmin(admins_permission.create)],
    admin_service: AdminServiceDep,
):
    return await admin_service.create_admin(admin_create=admin_create)

#########################################################################################################
#########################################################################################################
@router.put(
    "/{admin_id}",
    response_model=AdminResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.ALREADY_EXISTS,
        ErrorCode.BAD_REQUEST,
        ErrorCode.COMPROMISED_PASSWORD,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def update_admin_profile(
    admin_id: UUID,
    admin_profile_update: AdminProfileUpdate,
    db_admin: Annotated[Admin, RequireAdmin(admins_permission.update)],
    admin_service: AdminServiceDep,
):
    return await admin_service.update_admin_profile(
        admin_id=admin_id,
        admin_profile_update=admin_profile_update,
    )

#########################################################################################################
#########################################################################################################
@router.put(
    "/{admin_id}/password",
    response_model=AdminResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.COMPROMISED_PASSWORD,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def reset_admin_password(
    admin_id: UUID,
    payload: AdminPasswordReset,
    db_admin: Annotated[Admin, RequireAdmin(admins_permission.reset_password)],
    admin_service: AdminServiceDep,
):
    return await admin_service.reset_admin_password(
        admin_id=admin_id,
        password=payload.password,
    )

#########################################################################################################
#########################################################################################################
@router.put(
    "/{admin_id}/permissions",
    response_model=AdminResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def replace_admin_permissions(
    admin_id: UUID,
    payload: AdminPermissionsUpdate,
    db_admin: Annotated[Admin, RequireAdmin(admins_permission.grant)],
    admin_service: AdminServiceDep,
):
    return await admin_service.replace_permissions(
        admin_id=admin_id,
        paths=[permission.value for permission in payload.permissions],
    )

#########################################################################################################
#########################################################################################################
@router.delete(
    "/{admin_id}",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.BAD_REQUEST,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def delete_admin(
    admin_id: UUID,
    db_admin: Annotated[Admin, RequireAdmin(admins_permission.delete)],
    admin_service: AdminServiceDep,
):
    await admin_service.delete_admin(admin_id=admin_id, requested_by_id=db_admin.id)
    return common_schemas.MessageResponse.of(code=SuccessCode.ADMIN_ACCOUNT_DELETED)
