import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class TaskStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    status = Column(
        Enum(TaskStatus),
        default=TaskStatus.NOT_STARTED,
        nullable=False
    )
    deadline = Column(DateTime, nullable=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    user = relationship("User", back_populates="tasks")