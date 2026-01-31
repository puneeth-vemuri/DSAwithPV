from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Check if we want to enforce relationship or just store ID
    # For now, let's link to User model if we want statistics later
    
    code = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    status = Column(String, default="Pending") # Accepted, Wrong Answer, Runtime Error, etc.
    output = Column(Text, nullable=True) # Result or error message
    timestamp = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem")
    user = relationship("User")
