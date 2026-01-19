from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus


def get_tasks_by_user(db: Session, user_id: int) -> list[Task]:
    return (
        db.query(Task)
        .filter(Task.user_id == user_id)
        .order_by(Task.deadline)
        .all()
    )


def get_task_by_id(
    db: Session,
    task_id: int,
    user_id: int
) -> Task | None:
    return (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == user_id
        )
        .first()
    )


def create_task(
    db: Session,
    *,
    title: str,
    description: str | None,
    deadline,
    user_id: int
) -> Task:
    task = Task(
        title=title,
        description=description,
        deadline=deadline,
        status=TaskStatus.NOT_STARTED,
        user_id=user_id
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


def update_task(
    db: Session,
    task: Task,
    *,
    description: str | None = None,
    status: TaskStatus | None = None
) -> Task:
    if description is not None:
        task.description = description

    if status is not None:
        task.status = status

    db.commit()
    db.refresh(task)

    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()
