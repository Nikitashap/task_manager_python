from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.task import TaskStatus


class TaskBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.NOT_STARTED
    deadline: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[TaskStatus] = None


class TaskResponse(TaskBase):
    id: int

    model_config = {
        "from_attributes": True
    }
