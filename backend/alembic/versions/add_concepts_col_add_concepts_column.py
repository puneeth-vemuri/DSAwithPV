"""Add concepts column to problems

Revision ID: add_concepts_col
Revises: 44e4ac37579b
Create Date: 2026-01-31 12:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_concepts_col'
down_revision: Union[str, Sequence[str], None] = '44e4ac37579b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('problems', sa.Column('concepts', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('problems', 'concepts')
