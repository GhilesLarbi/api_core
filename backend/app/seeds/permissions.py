from typing import Dict, Iterator

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_utils import Ltree

from app.core.permissions import walk_permissions
from app.models.admin.permission import Permission

#########################################################################################################
#########################################################################################################
def declared_permissions() -> Iterator[Dict]:
    for node in walk_permissions():
        yield {
            "path": Ltree(node.path()),
            "label": node.label,
            "description": node.description,
            "grantable": node.grantable(),
        }

#########################################################################################################
#########################################################################################################
async def seed_permissions(session: AsyncSession) -> tuple[int, int, int]:
    declared = {str(values["path"]): values for values in declared_permissions()}
    existing = {
        str(path): permission_id
        for path, permission_id in (await session.execute(select(Permission.path, Permission.id))).all()
    }

    created = 0
    updated = 0
    for path, values in declared.items():
        if path in existing:
            await session.execute(update(Permission).where(Permission.id == existing[path]).values(**values))
            updated += 1
        else:
            session.add(Permission(**values))
            created += 1

    stale = [permission_id for path, permission_id in existing.items() if path not in declared]
    if stale:
        await session.execute(delete(Permission).where(Permission.id.in_(stale)))

    return created, updated, len(stale)
