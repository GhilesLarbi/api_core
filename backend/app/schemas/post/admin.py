from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.common import Name
from app.schemas.post.base import PostAuthor, PostMedia, PostResponse

#########################################################################################################
#########################################################################################################
class PostAdminAuthor(PostAuthor):
    email: EmailStr

#########################################################################################################
#########################################################################################################
class PostAdminResponse(PostResponse):
    author: PostAdminAuthor
    is_hidden: bool
    updated_at: datetime

#########################################################################################################
#########################################################################################################
class PostAdminUpdate(BaseModel):
    title: Optional[Name] = None
    content: Optional[str] = None
    is_hidden: Optional[bool] = None
    media: Optional[List[PostMedia]] = Field(default=None, max_length=10)
