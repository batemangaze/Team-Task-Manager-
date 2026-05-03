from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Task, TaskCreate, TaskResponse, TaskUpdate,CurrentUser, Membership,TaskStatusUpdate
from jwt_handler import get_current_user

router = APIRouter()



@router.get("/tasks", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.assigned_to == current_user.user_id).all()
    return tasks


@router.post("/tasks", response_model=TaskResponse)
def add_task(
    new_task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    if not new_task.title or not new_task.description:
        raise HTTPException(status_code=400, detail="Title and description required")

    creator_membership = db.query(Membership).filter(
        Membership.user_id == current_user.user_id,
        Membership.team_id == new_task.team_id
    ).first()

    if creator_membership is None:
        raise HTTPException(status_code=403, detail="You are not part of this team")

    assigned_membership = db.query(Membership).filter(
        Membership.user_id == new_task.assigned_to,
        Membership.team_id == new_task.team_id
    ).first()

    if assigned_membership is None:
        raise HTTPException(status_code=400, detail="Assigned user not in team")

    task = Task(
        title=new_task.title,
        description=new_task.description,
        team_id=new_task.team_id,
        assigned_to=new_task.assigned_to,
        status=False
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    updated_task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.task_id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.assigned_to != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorised")

    task.title = updated_task.title
    task.description = updated_task.description

    db.commit()
    db.refresh(task)

    return task

@router.put("/tasks/{task_id}/status",response_model=TaskResponse)
def update_status(task_id:int,stat:TaskStatusUpdate,db:Session=Depends(get_db),current_user:CurrentUser=Depends(get_current_user)):

    task=db.query(Task).filter(Task.task_id==task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.assigned_to != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorised")
    
    task.status=stat.status

    db.commit()
    db.refresh(task)

    return task
    



@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.task_id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.assigned_to != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorised")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}