from fastapi import APIRouter, HTTPException
import httpx
from backend.schemas import ExecutionRequest, ExecutionResponse

router = APIRouter(
    prefix="/execute",
    tags=["execution"],
)

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

@router.post("/", response_model=ExecutionResponse)
async def execute_code(request: ExecutionRequest):
    """
    Executes raw code using the Piston API.
    Useful for manual debugging if the user writes their own print statements.
    """
    payload = {
        "language": get_piston_language_name(request.language_id),
        "version": "*",
        "files": [{"content": request.source_code}],
        "stdin": request.stdin or "",
    }
    return await run_piston(payload)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import Depends
from database import get_db
from models.problem import Problem
from models.submission import Submission

@router.post("/run_test", response_model=ExecutionResponse)
async def run_test_case(request: ExecutionRequest, problem_id: int, db: AsyncSession = Depends(get_db)):
    """
    Wraps user code with a driver and runs it against the FIRST test case of the problem.
    """
    # 1. Fetch Problem
    result = await db.execute(
        select(Problem).options(selectinload(Problem.test_cases)).where(Problem.id == problem_id)
    )
    problem = result.scalars().first()
    if not problem or not problem.test_cases:
        raise HTTPException(status_code=404, detail="Problem or test cases not found")
    
    test_case = problem.test_cases[0]
    
    # 2. Prepare Driver
    from drivers import get_python_driver, get_java_driver
    
    language_name = get_piston_language_name(request.language_id)
    full_code = ""

    if language_name == "python":
        full_code = get_python_driver(request.source_code)
    elif language_name == "java":
        full_code = get_java_driver(request.source_code)
    else:
        raise HTTPException(status_code=400, detail="Automated verification is currently supported for Python and Java only.")

    payload = {
        "language": language_name,
        "version": "*",
        "files": [{"content": full_code}],
        "stdin": test_case.input_data,
    }
    return await run_piston(payload)


async def run_piston(payload: dict) -> ExecutionResponse:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(PISTON_API_URL, json=payload)
            response.raise_for_status()
            result = response.json()
            
            run_stage = result.get("run", {})
            compile_stage = result.get("compile", {})
            
            # Determine success based on exit codes
            # Piston returns code=0 for success
            compile_code = compile_stage.get("code", 0)
            run_code = run_stage.get("code", 0)
            
            is_success = (compile_code == 0) and (run_code == 0)
            
            # Prioritize run stderr. 
            # If compile failed, use compile stderr.
            # If compile succeeded but had warnings (stderr not empty), ignore it unless we want to show warnings.
            # For now, let's only show compile stderr if compile FAILED.
            
            final_stderr = ""
            if compile_code != 0:
                final_stderr = compile_stage.get("stderr", "")
            elif run_code != 0:
                final_stderr = run_stage.get("stderr", "")
            
            # If both are 0, we ignore compile warnings in stderr for now to avoid "Note: ..." causing frontend errors
            
            return ExecutionResponse(
                stdout=run_stage.get("stdout", ""),
                stderr=final_stderr,
                compile_output=compile_stage.get("stdout", ""),
                message=result.get("message", ""),
                status="Success" if is_success else "Error"
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Execution Engine Error: {str(e)}")


def get_piston_language_name(id: int) -> str:
    # Map our internal or monaco IDs to Piston names
    # For now, let's assume the frontend sends:
    # 71 -> python
    # 62 -> java
    # 54 -> c++
    # But better to just handle names if possible, but Piston uses names mostly.
    # Let's verify standard Piston names.
    mapping = {
        71: "python",
        62: "java"
    }
    return mapping.get(id, "python") # Default to python
