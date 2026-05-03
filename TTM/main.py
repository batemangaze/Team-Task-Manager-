from fastapi import APIRouter,FastAPI
from fastapi.middleware.cors import CORSMiddleware
from TTM.users import router as user_router
from TTM.tasks import router as task_router
from TTM.teams import router as team_router
from TTM.database import Base,engine

app=FastAPI(title="Team Task Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://team-task-manager-backend-4gl2.onrender.com"
        "https://team-task-manager-one-pi.vercel.app/"
        "https://team-task-manager-git-main-batemangazes-projects.vercel.app/"
        "https://team-task-manager-flvsd5t45-batemangazes-projects.vercel.app/"
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(user_router)
app.include_router(task_router)
app.include_router(team_router)

