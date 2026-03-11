from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict, ValidationInfo, field_validator
from typing import List, Optional
from datetime import datetime

from app.schemas import profile_schemas




##################################################
##################################################
class UserCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: str | None
    
    @field_validator('email')
    def lowercase_email(cls, v: str, info: ValidationInfo) -> str:
        return v.lower()


##################################################
##################################################
class UserUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    old_password: Optional[str] = None
    new_password: Optional[str]  = None


    @field_validator('email')
    def lowercase_email(cls, v: str, info: ValidationInfo) -> str:
        if v:
            return v.lower()
        return v
    
    


##################################################
##################################################
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID

    created_at: Optional[datetime] = None
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    profiles: Optional[List[profile_schemas.ProfileResponse]] = []



##################################################
##################################################
class UserTokenResponse(BaseModel):
    access_token: Optional[str] = None
    user: Optional[UserResponse] = None