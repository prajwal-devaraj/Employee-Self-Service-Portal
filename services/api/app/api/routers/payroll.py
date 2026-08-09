from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Employee, Payslip, User
from app.schemas import PayslipPublic

router = APIRouter(prefix="/payroll", tags=["payroll"])


@router.get("/payslips", response_model=list[PayslipPublic])
async def payslips(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    employee = await db.scalar(select(Employee).where(Employee.user_id == user.id))
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    rows = await db.scalars(
        select(Payslip)
        .where(Payslip.employee_id == employee.id)
        .order_by(Payslip.period.desc())
    )
    return list(rows)
