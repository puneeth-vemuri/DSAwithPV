import asyncio
from sqlalchemy.future import select
from backend.database import SessionLocal
from backend.models.user import User

async def list_users():
    async with SessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        print(f"{'ID':<5} {'Username':<20} {'Email':<30} {'Role':<10}")
        print("-" * 65)
        for user in users:
            print(f"{user.id:<5} {str(user.username):<20} {user.email:<30} {user.role}")

if __name__ == "__main__":
    asyncio.run(list_users())
