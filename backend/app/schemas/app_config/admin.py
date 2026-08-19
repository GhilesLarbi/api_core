from typing import Optional
from pydantic import BaseModel, EmailStr

#########################################################################################################
#########################################################################################################
class AppConfigResponse(BaseModel):
    maintenance_mode: bool
    support_email: Optional[EmailStr] = None

#########################################################################################################
#########################################################################################################
class AppConfigUpdate(BaseModel):
    maintenance_mode: Optional[bool] = None
    support_email: Optional[EmailStr] = None
