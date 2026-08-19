from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.api.dependencies.auth import AuthenticatedUser
from app.api.dependencies.factories import PostServiceDep
from app.api.dependencies.language import require_lang
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.messages.enums import SuccessCode
from app.core.middlewares.logger_context import StructlogRoute
from app.schemas import common as common_schemas
from app.schemas.common import Paginated
from app.schemas.post import PostCreate, PostResponse

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.post(
    "",
    response_model=PostResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def create_post(
    post_create: PostCreate,
    db_user: AuthenticatedUser,
    post_service: PostServiceDep,
):
    return await post_service.create_post(user_id=db_user.id, post_create=post_create)

#########################################################################################################
#########################################################################################################
@router.get(
    "/saved",
    response_model=Paginated[PostResponse],
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def list_saved_posts(
    db_user: AuthenticatedUser,
    post_service: PostServiceDep,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
):
    items, total = await post_service.list_saved(
        user_id=db_user.id,
        page=page,
        limit=limit,
    )
    return Paginated(items=items, total=total, page=page, limit=limit)

#########################################################################################################
#########################################################################################################
@router.post(
    "/{post_id}/save",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def save_post(
    post_id: UUID,
    db_user: AuthenticatedUser,
    post_service: PostServiceDep,
):
    await post_service.save_post(user_id=db_user.id, post_id=post_id)
    return common_schemas.MessageResponse.of(code=SuccessCode.POST_SAVED)

#########################################################################################################
#########################################################################################################
@router.delete(
    "/{post_id}/save",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def unsave_post(
    post_id: UUID,
    db_user: AuthenticatedUser,
    post_service: PostServiceDep,
):
    await post_service.unsave_post(user_id=db_user.id, post_id=post_id)
    return common_schemas.MessageResponse.of(code=SuccessCode.POST_UNSAVED)
