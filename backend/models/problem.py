from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import date

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, default="Medium")  # Easy, Medium, Hard
    input_format = Column(Text, nullable=True)
    output_format = Column(Text, nullable=True)
    constraints = Column(Text, nullable=True)
    editorial = Column(Text, nullable=True) # Markdown content for solution
    concepts = Column(String, nullable=True) # Comma-separated list of concepts
    date_posted = Column(Date, default=date.today)
    
    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_hidden = Column(Integer, default=True) # Boolean might be better, but explicit is fine. 0=Public, 1=Hidden

    problem = relationship("Problem", back_populates="test_cases")
