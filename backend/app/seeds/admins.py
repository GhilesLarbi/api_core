import json
from pathlib import Path

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.admin.admin import Admin
from app.models.admin.admin_permission import AdminPermission
from app.models.admin.permission import Permission

DATA_FILE = Path(__file__).parent / "data" / "admins.json"

#########################################################################################################
#########################################################################################################
async def seed_admins(session: AsyncSession) -> tuple[int, int]:
    records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    existing = {
        email: admin_id
        for email, admin_id in (await session.execute(select(Admin.email, Admin.id))).all()
    }

    created = 0
    updated = 0
    for record in records:
        email = record["email"]
        values = {
            "email": email,
            "first_name": record["first_name"],
            "last_name": record["last_name"],
            "phone": record["phone"],
            "hashed_password": get_password_hash(password=record["password"]),
        }
        if email in existing:
            await session.execute(update(Admin).where(Admin.id == existing[email]).values(**values))
            updated += 1
        else:
            session.add(Admin(**values))
            created += 1

    await session.flush()
    first_admin_id = (
        await session.execute(select(Admin.id).where(Admin.email == records[0]["email"]))
    ).scalar_one()
    grantable_ids = (
        await session.execute(select(Permission.id).where(Permission.grantable.is_(True)))
    ).scalars().all()
    await session.execute(delete(AdminPermission).where(AdminPermission.admin_id == first_admin_id))
    for permission_id in grantable_ids:
        session.add(AdminPermission(admin_id=first_admin_id, permission_id=permission_id))

    return created, updated
