from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Announcement, Attendance, Employee, LeaveRequest, LeaveStatus, Payslip, User
from app.schemas import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def summary(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    employee = await db.scalar(select(Employee).where(Employee.user_id == user.id))
    employee_count = int(await db.scalar(select(func.count(Employee.id))) or 0)
    announcement_count = int(await db.scalar(select(func.count(Announcement.id))) or 0)

    if not employee:
        return DashboardSummary(
            employee_count=employee_count,
            pending_leave_count=0,
            leave_balance_days=0,
            checked_in_today=False,
            announcement_count=announcement_count,
            latest_net_pay=None,
        )

    pending = int(
        await db.scalar(
            select(func.count(LeaveRequest.id)).where(
                LeaveRequest.employee_id == employee.id,
                LeaveRequest.status == LeaveStatus.PENDING,
            )
        )
        or 0
    )
    checked_in = (
        await db.scalar(
            select(Attendance.id).where(
                Attendance.employee_id == employee.id,
                Attendance.work_date == date.today(),
            )
        )
        is not None
    )
    year_start = date(date.today().year, 1, 1)
    year_end = date(date.today().year, 12, 31)
    approved_rows = await db.scalars(
        select(LeaveRequest).where(
            LeaveRequest.employee_id == employee.id,
            LeaveRequest.status == LeaveStatus.APPROVED,
            LeaveRequest.start_date <= year_end,
            LeaveRequest.end_date >= year_start,
        )
    )
    used_days = 0
    for leave in approved_rows:
        current = max(leave.start_date, year_start)
        last = min(leave.end_date, year_end)
        while current <= last:
            if current.weekday() < 5:
                used_days += 1
            current = date.fromordinal(current.toordinal() + 1)
    leave_balance = max(0, 20 - used_days)

    latest_pay = await db.scalar(
        select(Payslip.net_pay)
        .where(Payslip.employee_id == employee.id)
        .order_by(Payslip.period.desc())
        .limit(1)
    )

    return DashboardSummary(
        employee_count=employee_count,
        pending_leave_count=pending,
        leave_balance_days=leave_balance,
        checked_in_today=checked_in,
        announcement_count=announcement_count,
        latest_net_pay=Decimal(latest_pay) if latest_pay is not None else None,
    )
