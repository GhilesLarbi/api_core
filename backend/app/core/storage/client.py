import uuid
from uuid import UUID

from app.core.connections import s3_session, get_s3
from app.core.settings import settings
from app.core.secrets import secrets
from app.core.storage.types import AllowedContentType, FileType
from app.core.exceptions.exceptions import AppError
from app.core.exceptions.enums import ErrorCode
from app.utils.files import detect_content_type
from app.models.session.enums import OwnerType

#########################################################################################################
#########################################################################################################
class StorageClient:

    #########################################################################################################
    #########################################################################################################
    @staticmethod
    async def generate_temp_upload_url(file_type: FileType) -> tuple[dict, str]:
        key = f"{uuid.uuid4().hex}.{file_type.extension}"
        async with s3_session.client("s3", endpoint_url=str(settings.SEAWEEDFS_CDN_HOST).rstrip("/")) as s3:
            presigned = await s3.generate_presigned_post(
                Bucket=settings.TEMP_BUCKET,
                Key=key,
                Fields={
                    "Content-Type": file_type.content_type,
                    "Content-Disposition": "inline",
                },
                Conditions=[
                    {"Content-Type": file_type.content_type},
                    {"Content-Disposition": "inline"},
                    ["content-length-range", settings.MIN_UPLOAD_SIZE, settings.MAX_UPLOAD_SIZE],
                ],
                ExpiresIn=settings.PRESIGN_EXPIRES_IN,
            )
        cdn_url = f"{str(settings.SEAWEEDFS_CDN_HOST).rstrip('/')}/{settings.TEMP_BUCKET}/{key}"
        return presigned, cdn_url

    #########################################################################################################
    #########################################################################################################
    @staticmethod
    def _is_temp_url(url: str) -> bool:
        return f"/{settings.TEMP_BUCKET}/" in url

    #########################################################################################################
    #########################################################################################################
    @staticmethod
    async def copy_to_permanent_storage(
        url: str,
        owner_type: OwnerType,
        owner_id: UUID,
    ) -> str:
        if not url or not StorageClient._is_temp_url(url=url):
            return url

        temp_key = url.split(f"/{settings.TEMP_BUCKET}/", 1)[1].split("?")[0]
        dest_bucket = owner_type.value.lower()
        s3 = get_s3()
        obj = await s3.get_object(
            Bucket=settings.TEMP_BUCKET,
            Key=temp_key,
            Range=f"bytes=0-{settings.FILE_SNIFF_SIZE - 1}",
        )
        async with obj["Body"] as body:
            head_bytes = await body.read()
        content_type = detect_content_type(data=head_bytes)
        file_type = AllowedContentType.by_content_type(content_type=content_type)
        if not file_type:
            raise AppError(error_code=ErrorCode.UNSUPPORTED_FILE_TYPE)

        extension = f".{file_type.extension}"
        dest_key = f"{owner_id}/{uuid.uuid4().hex}{extension}"
        await s3.copy_object(
            Bucket=dest_bucket,
            Key=dest_key,
            CopySource={"Bucket": settings.TEMP_BUCKET, "Key": temp_key},
        )
        return f"{str(settings.SEAWEEDFS_CDN_HOST).rstrip('/')}/{dest_bucket}/{dest_key}"
