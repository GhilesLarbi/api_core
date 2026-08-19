from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.schemas.post.enums import PostMediaType

#########################################################################################################
#########################################################################################################
class PostMedia(BaseModel):
    url: str
    type: PostMediaType

#########################################################################################################
#########################################################################################################
class PostAuthor(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None

#########################################################################################################
#########################################################################################################
class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    content: str
    media: List[PostMedia] = []
    created_at: datetime
    author: PostAuthor
    is_saved: bool = False
