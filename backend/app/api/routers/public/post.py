from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.api.dependencies.auth import OptionalAuthenticatedUser
from app.api.dependencies.factories import PostServiceDep
from app.api.dependencies.language import require_lang
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.middlewares.logger_context import StructlogRoute
from app.schemas.common import Paginated
from app.schemas.post import PostResponse

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])


#########################################################################################################
#########################################################################################################
@router.get(
    "",
    response_model=Paginated[PostResponse],
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_PARAMETERS,
    ),
    openapi_extra={"security": [{}]},
)
async def list_posts(
    db_user: OptionalAuthenticatedUser,
    post_service: PostServiceDep,
    q: Optional[str] = None,
    ids: Optional[List[UUID]] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
):
    items, total = await post_service.list_public(
        q=q,
        ids=ids,
        page=page,
        limit=limit,
        user=db_user,
    )
    return Paginated(items=items, total=total, page=page, limit=limit)


#########################################################################################################
#########################################################################################################
@router.get(
    "/{post_id}",
    response_model=PostResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.INVALID_PARAMETERS,
    ),
    openapi_extra={"security": [{}]},
)
async def get_post(
    post_id: UUID,
    db_user: OptionalAuthenticatedUser,
    post_service: PostServiceDep,
):
    return await post_service.get_public(post_id=post_id, user=db_user)
