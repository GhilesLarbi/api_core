import json
from pathlib import Path

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user.user import User

DATA_FILE = Path(__file__).parent / "data" / "users.json"

#########################################################################################################
#########################################################################################################
async def seed_users(session: AsyncSession) -> tuple[int, int]:
    records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    existing = {
        email: user_id
        for email, user_id in (await session.execute(select(User.email, User.id))).all()
    }

    created = 0
    updated = 0
    for record in records:
        email = record["email"]
        values = {
            "email": email,
            "first_name": record["first_name"],
            "last_name": record["last_name"],
            "hashed_password": get_password_hash(password=record["password"]),
            "email_verified_at": func.now(),
        }
        if email in existing:
            await session.execute(update(User).where(User.id == existing[email]).values(**values))
            updated += 1
        else:
            session.add(User(**values))
            created += 1

    return created, updated
