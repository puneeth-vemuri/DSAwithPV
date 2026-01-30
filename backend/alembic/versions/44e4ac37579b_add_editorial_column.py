"""Add editorial column

Revision ID: 44e4ac37579b
Revises: ac1e4322b457
Create Date: 2026-01-30 20:09:30.556672

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '44e4ac37579b'
down_revision: Union[str, Sequence[str], None] = 'ac1e4322b457'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('problems', sa.Column('editorial', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('problems', 'editorial')
