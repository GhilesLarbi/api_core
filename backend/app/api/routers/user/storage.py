from fastapi import APIRouter, Depends, Response

from app.api.dependencies.auth import AuthenticatedUser
from app.api.dependencies.language import require_lang
from app.schemas.storage import StoragePresignedUrlResponse
from app.core.storage.client import StorageClient
from app.core.storage.types import AllowedContentType, AllowedContentTypeEnum
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.middlewares.logger_context import StructlogRoute

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.post(
    "/presign-url",
    response_model=StoragePresignedUrlResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
    ),
)
async def create_upload_presigned_url(
    db_user: AuthenticatedUser,
    response: Response,
    content_type: AllowedContentTypeEnum,
):
    file_type = AllowedContentType.by_content_type(content_type=content_type)
    presigned, cdn_url = await StorageClient.generate_temp_upload_url(file_type=file_type)
    fields_args = " ".join(f'-F "{name}={value}"' for name, value in presigned["fields"].items())
    response.headers["x-curl-cmd"] = f'curl -X POST {presigned["url"]} {fields_args} -F "file=@$HOME/Pictures/pic.png"'
    return StoragePresignedUrlResponse(
        url=presigned["url"],
        cdn_url=cdn_url,
        fields=presigned["fields"],
    )
