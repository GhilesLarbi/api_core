from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

# external
class PostCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    profile_id: UUID
    is_approved: Optional[bool] = None
    draft: Optional[bool] = False
    scheduled_time: Optional[datetime] = None


    
# external
class PostUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    is_approved: Optional[bool] = None
    draft: Optional[bool] = False
    scheduled_time: Optional[datetime] = None


# external
class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)


    id: UUID
    profile_id: UUID
    is_approved: Optional[bool] = None
    scheduled_time: Optional[datetime] = None
    updated_at: datetime
    is_hidden: bool