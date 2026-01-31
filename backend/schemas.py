from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class TestCaseBase(BaseModel):
    input_data: str
    expected_output: str
    is_hidden: bool = True

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseResponse(TestCaseBase):
    id: int
    problem_id: int

    class Config:
        from_attributes = True

class ProblemBase(BaseModel):
    title: str
    slug: str
    description: str
    difficulty: str = "Medium"
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    constraints: Optional[str] = None
    editorial: Optional[str] = None
    concepts: Optional[str] = None

class ProblemCreate(ProblemBase):
    test_cases: List[TestCaseCreate] = []

class ProblemResponse(ProblemBase):
    id: int
    date_posted: date
    # We might not want to return test cases in the list view, but ok for detail
    test_cases: List[TestCaseResponse] = []

    class Config:
        from_attributes = True

class ExecutionRequest(BaseModel):
    source_code: str
    language_id: int # Piston language ID (e.g., 71 for Python, 62 for Java)
    stdin: Optional[str] = ""

class ExecutionResponse(BaseModel):
    stdout: Optional[str] = ""
    stderr: Optional[str] = ""
    compile_output: Optional[str] = ""
    message: Optional[str] = ""
    status: Optional[str] = ""

from datetime import datetime
class SubmissionCreate(BaseModel):
    problem_id: int
    code: str
    language: str
    clerk_id: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None

class SubmissionResponse(BaseModel):
    id: int
    status: str
    output: Optional[str]
    timestamp: datetime
    language: str
    code: str
    username: Optional[str] = None
    
    class Config:
        from_attributes = True
