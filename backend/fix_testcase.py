import asyncio
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from backend.database import SessionLocal
from backend.models.problem import Problem

async def fix():
    async with SessionLocal() as session:
        # Find the Two Sum problem
        result = await session.execute(
            select(Problem).options(selectinload(Problem.test_cases)).where(Problem.slug == "two-sum")
        )
        problem = result.scalars().first()
        
        if problem and problem.test_cases:
            for tc in problem.test_cases:
                print(f"Checking TC ID {tc.id}: {tc.input_data!r}")
                
                # Check if it looks like CP format (starts with a single number, then space sep args)
                lines = tc.input_data.strip().split('\n')
                if len(lines) >= 3:
                     # Heuristic: 
                     # Line 1: Count (ignore)
                     # Line 2: Array elements (space separated)
                     # Line 3: Target
                     try:
                         # array_elements = lines[1].split()
                         # target = lines[2]
                         # Check if line 1 is just an integer (count)
                         int(lines[0]) 
                         
                         narr = [int(x) for x in lines[1].split()]
                         target = int(lines[2])
                         
                         new_input = f"{narr}\n{target}"
                         tc.input_data = new_input
                         session.add(tc)
                         print(f"  -> Fixed to: {new_input!r}")
                     except ValueError:
                         print("  -> Could not auto-fix (ValueError)")
                elif len(lines) == 1:
                     # Maybe just `3 2 4` ?
                     pass
                
                # Fix Outputs as well
                if " " in tc.expected_output and "[" not in tc.expected_output:
                     try:
                         # Try converting "0 1" -> "[0, 1]"
                         out_parts = [int(x) for x in tc.expected_output.split()]
                         new_out = str(out_parts)
                         tc.expected_output = new_out
                         session.add(tc)
                         print(f"  -> Fixed Output to: {new_out!r}")
                     except ValueError:
                         pass

            await session.commit()
            print("Finished fixing test cases.")
        else:
            print("Problem 'two-sum' not found or has no test cases.")

if __name__ == "__main__":
    try:
        asyncio.run(fix())
    except Exception as e:
        print(f"Error: {e}")
