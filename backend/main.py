from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import problems, execution, submissions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://dsawithpv.vercel.app",
        "https://dsawithpv.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router)
app.include_router(execution.router)
app.include_router(submissions.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to DSAwithPV Backend"}
