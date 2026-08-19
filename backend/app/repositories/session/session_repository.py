from app.repositories.base_repository import BaseRepository
from app.models import Session
from app.models.session.enums import OwnerType
from sqlalchemy import select, update, delete, func
from typing import List, Dict, Any
import uuid

#########################################################################################################
#########################################################################################################
class SessionRepository(BaseRepository):

    #########################################################################################################
    #########################################################################################################
    async def create(self, data: Dict[str, Any]) -> Session:
        db_session = Session(**data)
        self.session.add(db_session)
        return db_session

    #########################################################################################################
    #########################################################################################################
    async def get_by_id(self, session_id: uuid.UUID) -> Session | None:
        stmt = select(Session).where(Session.id == session_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def update(
        self,
        session_id: uuid.UUID,
        data: Dict[str, Any],
    ) -> None:
        stmt = update(Session).where(Session.id == session_id).values(**data)
        await self.session.execute(stmt)

    #########################################################################################################
    #########################################################################################################
    async def list_by_owner(
        self,
        owner_type: OwnerType,
        owner_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Session]:
        stmt = (
            select(Session)
            .where(Session.owner_type == owner_type, Session.owner_id == owner_id)
            .order_by(Session.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    #########################################################################################################
    #########################################################################################################
    async def count_by_owner(
        self,
        owner_type: OwnerType,
        owner_id: uuid.UUID,
    ) -> int:
        stmt = (
            select(func.count())
            .select_from(Session)
            .where(Session.owner_type == owner_type, Session.owner_id == owner_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one()

    #########################################################################################################
    #########################################################################################################
    async def revoke_by_ids(
        self,
        owner_type: OwnerType,
        owner_id: uuid.UUID,
        session_ids: List[uuid.UUID],
    ) -> int:
        stmt = delete(Session).where(
            Session.owner_type == owner_type,
            Session.owner_id == owner_id,
            Session.id.in_(session_ids),
        )
        result = await self.session.execute(stmt)
        return result.rowcount

    #########################################################################################################
    #########################################################################################################
    async def revoke_all_by_owner(
        self,
        owner_type: OwnerType,
        owner_id: uuid.UUID,
    ) -> int:
        stmt = delete(Session).where(
            Session.owner_type == owner_type,
            Session.owner_id == owner_id,
        )
        result = await self.session.execute(stmt)
        return result.rowcount
