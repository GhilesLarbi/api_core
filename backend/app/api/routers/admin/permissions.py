from typing import List
from fastapi import APIRouter, Depends

from app.api.dependencies.auth import AuthenticatedAdmin
from app.api.dependencies.factories import PermissionServiceDep
from app.api.dependencies.language import require_lang
from app.schemas.permission import PermissionResponse
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.middlewares.logger_context import StructlogRoute

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.get(
    "",
    response_model=List[PermissionResponse],
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
    ),
)
async def list_permissions(
    db_admin: AuthenticatedAdmin,
    permission_service: PermissionServiceDep,
):
    return await permission_service.get_tree()
