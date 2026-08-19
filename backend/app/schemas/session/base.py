from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

#########################################################################################################
#########################################################################################################
class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    expires_at: datetime
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

#########################################################################################################
#########################################################################################################
class SessionListResponse(BaseModel):
    items: List[SessionResponse] = []
    total: int
    page: int
    size: int
    pages: int

#########################################################################################################
#########################################################################################################
class SessionsLogoutRequest(BaseModel):
    session_ids: List[UUID]

#########################################################################################################
#########################################################################################################
class SessionsLogoutResponse(BaseModel):
    revoked: int
