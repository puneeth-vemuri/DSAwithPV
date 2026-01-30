from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from backend.database import get_db
from backend.models.problem import Problem, TestCase
from backend.schemas import ProblemCreate, ProblemResponse

router = APIRouter(
    prefix="/problems",
    tags=["problems"],
)

@router.post("/", response_model=ProblemResponse)
async def create_problem(problem: ProblemCreate, db: AsyncSession = Depends(get_db)):
    # Check if slug exists
    result = await db.execute(select(Problem).where(Problem.slug == problem.slug))
    existing_problem = result.scalars().first()
    if existing_problem:
        raise HTTPException(status_code=400, detail="Problem with this slug already exists")

    # Create Problem
    db_problem = Problem(
        title=problem.title,
        slug=problem.slug,
        description=problem.description,
        difficulty=problem.difficulty,
        input_format=problem.input_format,
        output_format=problem.output_format,
        constraints=problem.constraints,
        editorial=problem.editorial,
    )
    db.add(db_problem)
    await db.commit()
    await db.refresh(db_problem)

    # Create Test Cases
    for tc in problem.test_cases:
        db_tc = TestCase(
            problem_id=db_problem.id,
            input_data=tc.input_data,
            expected_output=tc.expected_output,
            is_hidden=tc.is_hidden
        )
        db.add(db_tc)
    
    await db.commit()
    # Reload problem with test cases
    result = await db.execute(
        select(Problem).options(selectinload(Problem.test_cases)).where(Problem.id == db_problem.id)
    )
    final_problem = result.scalars().first()
    return final_problem

@router.get("/", response_model=List[ProblemResponse])
async def get_problems(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Problem).options(selectinload(Problem.test_cases)).offset(skip).limit(limit)
    )
    problems = result.scalars().all()
    return problems

@router.get("/{slug}", response_model=ProblemResponse)
async def get_problem(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Problem).options(selectinload(Problem.test_cases)).where(Problem.slug == slug)
    )
    problem = result.scalars().first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@router.put("/{problem_id}", response_model=ProblemResponse)
async def update_problem(problem_id: int, problem_data: ProblemCreate, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Existing Problem
    result = await db.execute(select(Problem).options(selectinload(Problem.test_cases)).where(Problem.id == problem_id))
    db_problem = result.scalars().first()
    
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    # 2. Update Basic Fields
    db_problem.title = problem_data.title
    db_problem.slug = problem_data.slug
    db_problem.description = problem_data.description
    db_problem.difficulty = problem_data.difficulty
    db_problem.input_format = problem_data.input_format
    db_problem.output_format = problem_data.output_format
    db_problem.constraints = problem_data.constraints
    db_problem.editorial = problem_data.editorial
    
    # 3. Update Test Cases (Strategy: Delete All & Re-create)
    # This is simpler than diffing.
    for tc in db_problem.test_cases:
        await db.delete(tc)
    
    for tc in problem_data.test_cases:
        new_tc = TestCase(
            problem_id=db_problem.id,
            input_data=tc.input_data,
            expected_output=tc.expected_output,
            is_hidden=tc.is_hidden
        )
        db.add(new_tc)
        
    await db.commit()
    
    # 4. Refresh & Return
    result = await db.execute(
        select(Problem).options(selectinload(Problem.test_cases)).where(Problem.id == problem_id)
    )
    final_problem = result.scalars().first()
    return final_problem
