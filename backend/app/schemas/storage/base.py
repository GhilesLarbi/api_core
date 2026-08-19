from pydantic import BaseModel, AnyHttpUrl
from typing import Optional, Dict

#########################################################################################################
#########################################################################################################
class StoragePresignedUrlResponse(BaseModel):
    url: Optional[AnyHttpUrl] = None
    cdn_url: Optional[str] = None
    fields: Optional[Dict] = None
