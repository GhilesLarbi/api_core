import json
from pathlib import Path

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.post.post import Post
from app.models.user.user import User

DATA_FILE = Path(__file__).parent / "data" / "posts.json"

#########################################################################################################
#########################################################################################################
async def seed_posts(session: AsyncSession) -> tuple[int, int]:
    records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    users = {
        email: user_id
        for email, user_id in (await session.execute(select(User.email, User.id))).all()
    }
    existing = {
        title: post_id
        for title, post_id in (await session.execute(select(Post.title, Post.id))).all()
    }

    created = 0
    updated = 0
    for record in records:
        user_id = users.get(record["author_email"])
        if not user_id:
            continue

        title = record["title"]
        values = {
            "user_id": user_id,
            "title": title,
            "content": record["content"],
        }
        if title in existing:
            await session.execute(update(Post).where(Post.id == existing[title]).values(**values))
            updated += 1
        else:
            session.add(Post(**values))
            created += 1

    return created, updated
