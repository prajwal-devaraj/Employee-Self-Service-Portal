from datetime import date

import pytest
from pydantic import ValidationError

from app.models import LeaveType
from app.schemas import LeaveCreate


def test_leave_requires_valid_date_range() -> None:
    with pytest.raises(ValidationError):
        LeaveCreate(
            leave_type=LeaveType.VACATION,
            start_date=date(2026, 9, 10),
            end_date=date(2026, 9, 9),
            reason="Trip",
        )
