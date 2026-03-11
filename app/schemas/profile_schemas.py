from uuid import UUID
from pydantic import BaseModel, ConfigDict, AnyHttpUrl
from typing import Optional
from datetime import datetime




# external
class ProfileCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    

# extearnal
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[AnyHttpUrl] = None



# external
class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    avatar_url: Optional[str] = None
    name: Optional[str] = None
    created_at: datetime