from typing import Annotated
from fastapi import APIRouter, Depends

from app.api.dependencies.auth import RequireAdmin
from app.api.dependencies.language import require_lang
from app.core.app_config import get_app_config, update_app_config
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.middlewares.logger_context import StructlogRoute
from app.core.permissions import app_config as app_config_permission
from app.models import Admin
from app.schemas.app_config import AppConfigResponse, AppConfigUpdate

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.get(
    "",
    response_model=AppConfigResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
    ),
)
async def get_app_config_endpoint(db_admin: Annotated[Admin, RequireAdmin(app_config_permission.read)]):
    return await get_app_config()

#########################################################################################################
#########################################################################################################
@router.put(
    "",
    response_model=AppConfigResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def update_app_config_endpoint(
    payload: AppConfigUpdate,
    db_admin: Annotated[Admin, RequireAdmin(app_config_permission.update)],
):
    return await update_app_config(update=payload)
