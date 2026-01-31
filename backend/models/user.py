from sqlalchemy import Column, Integer, String, Enum
import enum
from database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
