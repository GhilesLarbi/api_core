from typing import Optional
from pydantic import BaseModel, EmailStr

#########################################################################################################
#########################################################################################################
class AppConfigData(BaseModel):
    maintenance_mode: bool = False
    support_email: Optional[EmailStr] = None
