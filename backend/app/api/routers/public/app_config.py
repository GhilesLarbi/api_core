from fastapi import APIRouter, Depends

from app.api.dependencies.language import require_lang
from app.core.app_config import get_app_config
from app.core.middlewares.logger_context import StructlogRoute
from app.schemas.app_config import AppConfigPublicResponse

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])


#########################################################################################################
#########################################################################################################
@router.get(
    "",
    response_model=AppConfigPublicResponse,
    response_model_exclude_none=True,
    openapi_extra={"security": [{}]},
)
async def get_public_app_config():
    return await get_app_config()
