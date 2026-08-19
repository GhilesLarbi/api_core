import asyncio

from app.core.connections import AsyncSessionLocal
from app.seeds.permissions import seed_permissions
from app.seeds.admins import seed_admins
from app.seeds.users import seed_users
from app.seeds.posts import seed_posts

#########################################################################################################
#########################################################################################################
async def main() -> None:
    async with AsyncSessionLocal() as session:
        permissions_created, permissions_updated, permissions_deleted = await seed_permissions(session=session)
        admins_created, admins_updated = await seed_admins(session=session)
        users_created, users_updated = await seed_users(session=session)
        posts_created, posts_updated = await seed_posts(session=session)
        await session.commit()
        print(f"permissions: {permissions_created} created, {permissions_updated} updated, {permissions_deleted} deleted")
        print(f"admins: {admins_created} created, {admins_updated} updated")
        print(f"users: {users_created} created, {users_updated} updated")
        print(f"posts: {posts_created} created, {posts_updated} updated")

#########################################################################################################
#########################################################################################################
if __name__ == "__main__":
    asyncio.run(main())
