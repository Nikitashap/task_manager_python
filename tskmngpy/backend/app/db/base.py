from sqlalchemy.orm import declarative_base

Base = declarative_base()

# импорт моделей, чтобы Alembic их видел
# from app.models.user import User  # noqa
# from app.models.task import Task  # noqa
