from datetime import UTC, date, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.audit import add_audit
from app.core.database import get_db
from app.models import Attendance, Employee, User
from app.schemas import AttendanceCheckIn, AttendancePublic, Message

router = APIRouter(prefix="/attendance", tags=["attendance"])


async def _employee(db: AsyncSession, user_id: UUID) -> Employee:
    employee = await db.scalar(select(Employee).where(Employee.user_id == user_id))
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return employee


@router.get("/mine", response_model=list[AttendancePublic])
async def mine(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    employee = await _employee(db, user.id)
    rows = await db.scalars(
        select(Attendance)
        .where(Attendance.employee_id == employee.id)
        .order_by(Attendance.work_date.desc())
        .limit(60)
    )
    return list(rows)


@router.post("/check-in", response_model=AttendancePublic, status_code=201)
async def check_in(
    body: AttendanceCheckIn,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    employee = await _employee(db, user.id)
    today = date.today()
    existing = await db.scalar(
        select(Attendance).where(
            Attendance.employee_id == employee.id,
            Attendance.work_date == today,
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already checked in today")
    record = Attendance(
        employee_id=employee.id,
        work_date=today,
        check_in=datetime.now(UTC),
        work_location=body.work_location,
        note=body.note,
    )
    db.add(record)
    await db.flush()
    await add_audit(
        db,
        actor_user_id=user.id,
        action="attendance.check_in",
        entity_type="attendance",
        entity_id=str(record.id),
        request=request,
    )
    await db.commit()
    await db.refresh(record)
    return record


@router.post("/check-out", response_model=AttendancePublic)
async def check_out(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    employee = await _employee(db, user.id)
    record = await db.scalar(
        select(Attendance).where(
            Attendance.employee_id == employee.id,
            Attendance.work_date == date.today(),
        )
    )
    if not record:
        raise HTTPException(status_code=409, detail="Check in first")
    if record.check_out:
        raise HTTPException(status_code=409, detail="Already checked out")
    record.check_out = datetime.now(UTC)
    await add_audit(
        db,
        actor_user_id=user.id,
        action="attendance.check_out",
        entity_type="attendance",
        entity_id=str(record.id),
        request=request,
    )
    await db.commit()
    await db.refresh(record)
    return record
