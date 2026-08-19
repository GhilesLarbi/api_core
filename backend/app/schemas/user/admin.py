from pydantic import BaseModel, EmailStr, ConfigDict, HttpUrl, ValidationInfo, field_validator
from typing import Optional
from app.schemas.common import Name, Password

#########################################################################################################
#########################################################################################################
class UserAdminCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    password: Password

    first_name: Optional[Name] = None
    last_name: Optional[Name] = None
    avatar_url: Optional[HttpUrl] = None

    @field_validator('email')
    def lowercase_email(cls, v: str, info: ValidationInfo) -> str:
        return v.lower()

#########################################################################################################
#########################################################################################################
class UserAdminUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: Optional[EmailStr] = None
    first_name: Optional[Name] = None
    last_name: Optional[Name] = None
    avatar_url: Optional[HttpUrl] = None

    @field_validator('email')
    def lowercase_email(cls, v: Optional[str], info: ValidationInfo) -> Optional[str]:
        return v.lower() if v else v
