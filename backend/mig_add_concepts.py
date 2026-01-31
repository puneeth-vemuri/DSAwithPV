import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Load env variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    exit(1)

async def add_column():
    print(f"Connecting to database...")
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        try:
            # Check if column exists first to avoid error? 
            # Or just try to add it. simpler to try-catch.
            print("Attempting to add 'concepts' column...")
            await conn.execute(text("ALTER TABLE problems ADD COLUMN IF NOT EXISTS concepts TEXT"))
            print("Successfully executed ALTER TABLE.")
        except Exception as e:
            print(f"Error executing migration: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_column())
