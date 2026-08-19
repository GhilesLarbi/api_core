from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query

from typing import Annotated
from app.api.dependencies.auth import RequireAdmin
from app.core.permissions import posts as posts_permission
from app.models import Admin
from app.api.dependencies.factories import PostServiceDep
from app.api.dependencies.language import require_lang
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.messages.enums import SuccessCode
from app.core.middlewares.logger_context import StructlogRoute
from app.schemas import common as common_schemas
from app.schemas.common import Paginated
from app.schemas.post import (
    PostAdminResponse,
    PostAdminUpdate,
    PostSortBy,
    PostSortDirection,
)

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.get(
    "",
    response_model=Paginated[PostAdminResponse],
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def list_posts(
    db_admin: Annotated[Admin, RequireAdmin(posts_permission.read)],
    post_service: PostServiceDep,
    q: Optional[str] = None,
    is_hidden: Optional[bool] = None,
    sort_by: PostSortBy = Query(default=PostSortBy.CREATED_AT),
    sort_direction: PostSortDirection = Query(default=PostSortDirection.DESC),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
):
    items, total = await post_service.admin_list_posts(
        q=q,
        is_hidden=is_hidden,
        sort_by=sort_by,
        sort_direction=sort_direction,
        page=page,
        limit=limit,
    )
    return Paginated(items=items, total=total, page=page, limit=limit)

#########################################################################################################
#########################################################################################################
@router.put(
    "/{post_id}",
    response_model=PostAdminResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def update_post(
    post_id: UUID,
    post_update: PostAdminUpdate,
    db_admin: Annotated[Admin, RequireAdmin(posts_permission.update)],
    post_service: PostServiceDep,
):
    return await post_service.admin_update_post(
        post_id=post_id,
        post_update=post_update,
    )

#########################################################################################################
#########################################################################################################
@router.delete(
    "/{post_id}",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def delete_post(
    post_id: UUID,
    db_admin: Annotated[Admin, RequireAdmin(posts_permission.delete)],
    post_service: PostServiceDep,
):
    await post_service.admin_delete_post(post_id=post_id)
    return common_schemas.MessageResponse.of(code=SuccessCode.POST_DELETED)
