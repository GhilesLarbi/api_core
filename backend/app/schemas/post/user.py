from pydantic import BaseModel, Field
from typing import List
from app.schemas.common import Name
from app.schemas.post.base import PostMedia

#########################################################################################################
#########################################################################################################
class PostCreate(BaseModel):
    title: Name
    content: str = Field(min_length=1)
    media: List[PostMedia] = Field(default=[], max_length=10)
