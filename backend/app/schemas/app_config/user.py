from typing import Optional
from pydantic import BaseModel, EmailStr

#########################################################################################################
#########################################################################################################
class AppConfigPublicResponse(BaseModel):
    maintenance_mode: bool
    support_email: Optional[EmailStr] = None
