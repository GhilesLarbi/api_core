from app.repositories.base_repository import BaseRepository
from app.models import Permission
from sqlalchemy import select
from typing import List

#########################################################################################################
#########################################################################################################
class PermissionRepository(BaseRepository):
    #########################################################################################################
    #########################################################################################################
    async def list_all(self) -> List[Permission]:
        """Every permission, ordered by path.

        Ordering by an ltree path is depth first, so a node always arrives after its parent. Anything
        assembling the tree can therefore do it in one pass without looking ahead."""
        stmt = select(Permission).order_by(Permission.path)
        result = await self.session.execute(stmt)
        return result.scalars().all()
