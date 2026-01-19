from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse
)
from app.crud.task import (
    get_tasks_by_user,
    get_task_by_id,
    create_task,
    update_task,
    delete_task
)
from app.models.user import User

router = APIRouter(prefix="/api/tasks", tags=["tasks"])



@router.get("/", response_model=list[TaskResponse])
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_tasks_by_user(db, current_user.id)


@router.post("/", response_model=TaskResponse)
def create_new_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_task(
        db,
        title=task_in.title,
        description=task_in.description,
        deadline=task_in.deadline,
        user_id=current_user.id
    )


@router.put("/{task_id}", response_model=TaskResponse)
def update_existing_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return update_task(
        db,
        task,
        description=task_in.description,
        status=task_in.status
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    delete_task(db, task)
