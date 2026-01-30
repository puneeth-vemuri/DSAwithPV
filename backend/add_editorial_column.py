import asyncio
from sqlalchemy import text
from backend.database import SessionLocal

async def add_editorial_column():
    async with SessionLocal() as session:
        try:
            await session.execute(text("ALTER TABLE problems ADD COLUMN editorial TEXT"))
            await session.commit()
            print("Successfully added 'editorial' column to 'problems' table.")
        except Exception as e:
            print(f"Error (might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(add_editorial_column())
