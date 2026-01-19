"""create users and tasks tables"""

revision = "b9c8b371847f"
down_revision = None
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(128), nullable=False),
        sa.Column("created_at",sa.DateTime)
    )

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(100), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("deadline", sa.DateTime),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
    )


def downgrade():
    op.drop_table("tasks")
    op.drop_table("users")
