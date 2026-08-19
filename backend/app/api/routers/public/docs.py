from fastapi import APIRouter
from scalar_fastapi import get_scalar_api_reference
from app.core.settings import settings

router = APIRouter()

#########################################################################################################
#########################################################################################################
@router.get(
    "/docs", 
    include_in_schema=False
)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        title=settings.PROJECT_NAME,
        #scalar_favicon_url=None,
        telemetry=False,
        persist_auth=True,
        overrides={"showOperationId": True},
    )
