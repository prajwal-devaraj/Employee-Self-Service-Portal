from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.core.audit import add_audit
from app.core.database import get_db
from app.models import Employee, LeaveRequest, LeaveStatus, Role, User
from app.schemas import LeaveCreate, LeavePublic, LeaveReview, Message

router = APIRouter(prefix="/leave", tags=["leave"])


async def _employee_for_user(db: AsyncSession, user_id: UUID) -> Employee:
    employee = await db.scalar(select(Employee).where(Employee.user_id == user_id))
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return employee


@router.get("/mine", response_model=list[LeavePublic])
async def mine(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    employee = await _employee_for_user(db, user.id)
    rows = await db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.employee_id == employee.id)
        .order_by(LeaveRequest.created_at.desc())
    )
    return list(rows)


@router.post("", response_model=LeavePublic, status_code=201)
async def create_leave(
    body: LeaveCreate,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    employee = await _employee_for_user(db, user.id)
    overlapping = await db.scalar(
        select(LeaveRequest).where(
            LeaveRequest.employee_id == employee.id,
            LeaveRequest.status.in_([LeaveStatus.PENDING, LeaveStatus.APPROVED]),
            LeaveRequest.start_date <= body.end_date,
            LeaveRequest.end_date >= body.start_date,
        )
    )
    if overlapping:
        raise HTTPException(status_code=409, detail="Leave dates overlap an existing request")

    leave = LeaveRequest(employee_id=employee.id, **body.model_dump())
    db.add(leave)
    await db.flush()
    await add_audit(
        db,
        actor_user_id=user.id,
        action="leave.created",
        entity_type="leave_request",
        entity_id=str(leave.id),
        request=request,
    )
    await db.commit()
    await db.refresh(leave)
    return leave


@router.post("/{leave_id}/cancel", response_model=Message)
async def cancel_leave(
    leave_id: UUID,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    employee = await _employee_for_user(db, user.id)
    leave = await db.get(LeaveRequest, leave_id)
    if not leave or leave.employee_id != employee.id:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status not in {LeaveStatus.PENDING, LeaveStatus.APPROVED}:
        raise HTTPException(status_code=409, detail="Leave request cannot be cancelled")
    leave.status = LeaveStatus.CANCELLED
    await add_audit(
        db,
        actor_user_id=user.id,
        action="leave.cancelled",
        entity_type="leave_request",
        entity_id=str(leave.id),
        request=request,
    )
    await db.commit()
    return Message(message="Leave request cancelled")


@router.get("/pending", response_model=list[LeavePublic])
async def pending(
    _: User = Depends(require_roles(Role.MANAGER, Role.HR, Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.status == LeaveStatus.PENDING)
        .order_by(LeaveRequest.created_at)
    )
    return list(rows)


@router.patch("/{leave_id}/review", response_model=LeavePublic)
async def review(
    leave_id: UUID,
    body: LeaveReview,
    request: Request,
    reviewer: User = Depends(require_roles(Role.MANAGER, Role.HR, Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    leave = await db.get(LeaveRequest, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != LeaveStatus.PENDING:
        raise HTTPException(status_code=409, detail="Leave request is not pending")
    leave.status = body.status
    leave.reviewer_id = reviewer.id
    leave.reviewer_note = body.reviewer_note
    await add_audit(
        db,
        actor_user_id=reviewer.id,
        action=f"leave.{body.status.value}",
        entity_type="leave_request",
        entity_id=str(leave.id),
        request=request,
    )
    await db.commit()
    await db.refresh(leave)
    return leave
