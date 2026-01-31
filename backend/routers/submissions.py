from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import httpx
import ast

from database import get_db
from models.submission import Submission
from models.problem import Problem
from models.user import User
from schemas import SubmissionCreate, SubmissionResponse
from routers.execution import PISTON_API_URL, get_piston_language_name

router = APIRouter(
    prefix="/submissions",
    tags=["submissions"],
)

@router.post("/", response_model=SubmissionResponse)
async def submit_solution(submission: SubmissionCreate, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Fetch Problem and Test Cases
        result = await db.execute(
            select(Problem).options(selectinload(Problem.test_cases)).where(Problem.id == submission.problem_id)
        )
        problem = result.scalars().first()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")

        # 2. Prepare Driver Code
        from drivers import get_python_driver, get_java_driver
        
        language = submission.language.lower()
        full_code = ""

        if language == "python":
            full_code = get_python_driver(submission.code)
        elif language == "java":
            full_code = get_java_driver(submission.code)
        else:
            raise HTTPException(status_code=400, detail="Only Python and Java are supported currently.")

        final_status = "Accepted"
        final_output = ""

        async with httpx.AsyncClient() as client:
            for tc in problem.test_cases:
                payload = {
                    "language": language,
                    "version": "*",
                    "files": [{"content": full_code}],
                    "stdin": tc.input_data,
                }

                try:
                    res = await client.post(PISTON_API_URL, json=payload)
                    res.raise_for_status()
                    data = res.json()
                    
                    run_stage = data.get("run", {})
                    compile_stage = data.get("compile", {})
                    
                    run_code = run_stage.get("code", 0)
                    compile_code = compile_stage.get("code", 0)
                    
                    # Check for failure exit codes
                    if compile_code != 0:
                        final_status = "Compilation Error"
                        final_output = compile_stage.get("stderr", "") or "Unknown compilation error"
                        break
                    
                    if run_code != 0:
                        final_status = "Runtime Error"
                        final_output = run_stage.get("stderr", "") or "Unknown runtime error"
                        break
                    
                    # If success (codes are 0), we ignore stderr (warnings)
                    stdout = run_stage.get("stdout", "").strip()
                    
                    # Compare Output
                    # Normalize newlines and whitespace
                    expected = tc.expected_output.strip()
                    if stdout != expected:
                        final_status = "Wrong Answer"
                        final_output = f"Input: {tc.input_data}\nExpected: {expected}\nGot: {stdout}"
                        break
                        
                except Exception as e:
                    final_status = "Error"
                    final_output = f"Execution Error: {str(e)}"
                    break

        # 3. Handle User Linking (Sync-on-Action)
        user_id = None
        if submission.clerk_id:
            # Check if user exists
            result_user = await db.execute(select(User).where(User.clerk_id == submission.clerk_id))
            db_user = result_user.scalars().first()
            
            if not db_user:
                # Create new user on the fly
                db_user = User(
                    clerk_id=submission.clerk_id,
                    email=submission.email or "placeholder@example.com", # Fallback to avoid unique constraint if empty
                    username=submission.username or "Anonymous"
                )
                db.add(db_user)
                try:
                    await db.commit()
                    await db.refresh(db_user)
                except Exception as user_e:
                    await db.rollback()
                    # Try to fetch again in case race condition
                    result_user = await db.execute(select(User).where(User.clerk_id == submission.clerk_id))
                    db_user = result_user.scalars().first()
            
            if db_user:
                user_id = db_user.id

        # 4. Create Submission Record
        new_submission = Submission(
            problem_id=submission.problem_id,
            user_id=user_id,
            code=submission.code,
            language=submission.language,
            status=final_status,
            output=final_output
        )
        db.add(new_submission)
        await db.commit()
        await db.refresh(new_submission)

        return new_submission
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Submission Endpoint Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/", response_model=List[SubmissionResponse])
async def get_submissions(
    problem_id: int, 
    clerk_id: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    query = select(Submission).where(Submission.problem_id == problem_id)
    
    if clerk_id:
        # Join with User table to filter by clerk_id
        query = query.join(User).where(User.clerk_id == clerk_id)
    
    # Order by newest first
    query = query.order_by(Submission.timestamp.desc())
    
    result = await db.execute(query)
    submissions = result.scalars().all()
    return submissions

@router.get("/solutions/{problem_id}")
async def get_solutions(problem_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Official Solution (Admin, Accepted)
    # We need to import UserRole properly. It's an Enum.
    # Avoiding circular imports or complex enum handling if possible, but let's try direct import.
    from models.user import UserRole

    # Query for Admin logic
    # Note: We join User to check role and also to populate username for the response
    stmt_official = (
        select(Submission, User.username)
        .join(User, Submission.user_id == User.id)
        .where(
            Submission.problem_id == problem_id, 
            Submission.status == "Accepted",
            User.role == UserRole.ADMIN
        )
        .limit(1)
    )
    result_official = await db.execute(stmt_official)
    official_row = result_official.first() # Returns (Submission, username) tuple due to select style
    
    official_data = None
    if official_row:
        sub, uname = official_row
        # Manually attach username or rely on schema if ORM handled it (but we selected specific columns/entities)
        # Pydantic from_attributes works best with ORM objects. 
        # Let's just create a dict response for simplicity or attach username to the object if it's not a frozen model.
        # Better: use a response model that handles this. SubmissionResponse has username now.
        official_data = SubmissionResponse.model_validate(sub)
        official_data.username = uname

    # 2. Fetch Community Solutions (User, Accepted, Limit 5, Earliest first)
    stmt_community = (
        select(Submission, User.username)
        .join(User, Submission.user_id == User.id)
        .where(
            Submission.problem_id == problem_id, 
            Submission.status == "Accepted",
            User.role != UserRole.ADMIN
        )
        .order_by(Submission.timestamp.asc())
        .limit(5)
    )
    result_community = await db.execute(stmt_community)
    community_rows = result_community.all()
    
    community_data = []
    for sub, uname in community_rows:
        s_data = SubmissionResponse.model_validate(sub)
        s_data.username = uname
        community_data.append(s_data)

    return {
        "official": official_data,
        "community": community_data
    }
