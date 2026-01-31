# DSAwithPV - Interactive DAS Practice Platform

**DSAwithPV** is a full-stack Data Structures and Algorithms (DSA) practice platform designed to mimic real-world competitive programming environments like LeetCode or HackerRank. It features a custom-built code execution engine, admin dashboard, and hidden test case validation.

---

## 🚀 Tech Stack

### **Frontend**
*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Authentication:** [Clerk](https://clerk.com/)
*   **Code Editor:** [Monaco Editor](https://microsoft.github.io/monaco-editor/) (VS Code engine)
*   **Animations:** [GSAP](https://greensock.com/gsap/) & Framer Motion
*   **Markdown Rendering:** `react-markdown` with GFM support

### **Backend**
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
*   **Database ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) (Asyncio)
*   **Migration Tool:** [Alembic](https://alembic.sqlalchemy.org/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on Supabase)
*   **Code Execution:** [Piston API](https://github.com/engineer-man/piston) (Sandboxed execution)
*   **Drivers:** Custom Python/Java drivers for I/O parsing and validation

### **Infrastructure & Deployment**
*   **Frontend Hosting:** [Vercel](https://vercel.com/)
*   **Backend Hosting:** [Render](https://render.com/)
*   **Keep-Alive:** GitHub Actions (Cron job pinging backend every 14 mins)
*   **Version Control:** Git & GitHub

---

## 🏗️ System Architecture

1.  **Client (Next.js):** Handles UI, user authentication via Clerk, and code editing.
2.  **API Layer (FastAPI):** Exposes REST endpoints for problems, submissions, and execution.
3.  **Data Layer (Supabase Postgres):** Stores:
    *   **Users:** Linked via Clerk ID.
    *   **Problems:** Definitions, constraints, difficulty.
    *   **Test Cases:** Input/Output pairs (some hidden).
    *   **Submissions:** Code, verdict (Accepted/Wrong Answer), runtime.
4.  **Execution Engine:**
    *   When a user submits code, the Backend wraps it in a **Driver** (`drivers.py`).
    *   The driver injects test case inputs and captures outputs.
    *   This wrapped code is sent to the **Piston API**.
    *   Result (`stdout` or `stderr`) is compared against the Expected Output.

---

## 📂 File Structure

```graphql
DSAwithPV/
├── backend/                  # FastAPI Application
│   ├── alembic/              # Database Migrations
│   │   ├── versions/         # Migration scripts
│   │   └── env.py            # Migration environment config
│   ├── models/               # SQLAlchemy Models
│   │   ├── user.py           # User & Role definitions
│   │   ├── problem.py        # Problem & TestCase models
│   │   └── submission.py     # Submission history model
│   ├── routers/              # API Endpoints
│   │   ├── execution.py      # Code running logic
│   │   ├── problems.py       # CRUD for problems
│   │   └── submissions.py    # Submission history & solutions
│   ├── drivers.py            # Code wrappers for Python/Java
│   ├── database.py           # DB connection (AsyncSession)
│   ├── main.py               # App entry point
│   ├── schemas.py            # Pydantic models (Validation)
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/        # Admin Dashboard (Protected)
│   │   │   ├── problems/     # Problem Detail Page ([slug])
│   │   │   ├── sign-in/      # Clerk Auth Pages
│   │   │   ├── page.tsx      # Landing Page
│   │   │   └── globals.css   # Tailwind Global Styles
│   │   └── components/       # Reusable UI (Navbar, etc.)
│   ├── public/               # Static Assets
│   └── next.config.ts        # Next.js Config (Rewrites)
│
├── .github/workflows/        # GitHub Actions
│   └── keep_alive.yml        # Backend pinger
│
└── README.md                 # Project Documentation
```

---

## ⚙️ How It Works

### 1. Problem Creation (Admin)
*   Admins log in and access `/admin`.
*   Fill in Title, Description (Markdown), Difficulty, and **Test Cases**.
*   Test cases are stored as JSON strings (e.g., `"[1,2,3]"`).
*   **Hidden Test Cases:** Can be marked to prevent users from hardcoding answers.

### 2. Code Execution Flow
1.  User types code in Monaco Editor.
2.  Click **"Run"** or **"Submit"**.
3.  Frontend sends `code` + `language` + `problem_id` to Backend.
4.  Backend fetches test cases from DB.
5.  **Driver Injection:**
    *   Backend wraps user code with a logic harness (e.g., `if __name__ == "__main__": ...`).
    *   It parses raw string inputs into actual types (List, Int) for the user's function.
6.  **Sandboxing:** Wrapped code runs in Piston (isolated container).
7.  **Verdict:**
    *   Backend compares `Actual Output` vs `Expected Output`.
    *   Returns `Accepted`, `Wrong Answer`, or `Runtime Error`.

---

## 🛠️ Local Setup

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   PostgreSQL URL (local or cloud)

### 1. Clone Repository
```bash
git clone https://github.com/puneeth-vemuri/DSAwithPV.git
cd DSAwithPV
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname" > .env

# Run Migrations
alembic upgrade head

# Start Server (Run from PROJECT ROOT for absolute imports to work)
cd .. 
uvicorn backend.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local file
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_..." > .env.local
echo "CLERK_SECRET_KEY=sk_test_..." >> .env.local

# Start Client
npm run dev
```

Visit `http://localhost:3000` to see the app!

---

## 🚢 Deployment Logic

*   **Backend (Render):**
    *   Build Command: `pip install -r backend/requirements.txt`
    *   Start Command: `alembic -c backend/alembic.ini upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
    *   **Note:** Uses absolute imports (`backend.xxx`) to ensure stability.

*   **Frontend (Vercel):**
    *   Connects to Git.
    *   Rewrites `/api` requests to the Render Backend URL.

---

## 🏆 Credits
Developed by **Puneeth Vemuri**.
