from typing import TYPE_CHECKING, Optional
from sqlalchemy.ext.asyncio import AsyncSession

if TYPE_CHECKING:
    from app.services.service_provider import ServiceProvider

class BaseService:
    def __init__(self, provider: "ServiceProvider"):
        self.provider = provider

    @property
    def session(self) -> Optional[AsyncSession]:
        return self.provider.session