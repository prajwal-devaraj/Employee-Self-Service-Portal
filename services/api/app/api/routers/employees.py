from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.core.audit import add_audit
from app.core.database import get_db
from app.models import Employee, Role, User
from app.schemas import EmployeeAdminUpdate, EmployeePublic, EmployeeUpdate

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=list[EmployeePublic])
async def list_employees(
    q: str | None = Query(default=None, max_length=100),
    department: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Employee]:
    stmt = select(Employee).order_by(Employee.first_name, Employee.last_name)
    if q:
        term = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Employee.first_name).like(term),
                func.lower(Employee.last_name).like(term),
                func.lower(Employee.job_title).like(term),
                func.lower(Employee.employee_number).like(term),
            )
        )
    if department:
        stmt = stmt.where(Employee.department == department)
    rows = await db.scalars(stmt.limit(limit).offset(offset))
    return list(rows)


@router.get("/me", response_model=EmployeePublic)
async def my_profile(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    employee = await db.scalar(select(Employee).where(Employee.user_id == user.id))
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return employee


@router.patch("/me", response_model=EmployeePublic)
async def update_my_profile(
    body: EmployeeUpdate,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    employee = await db.scalar(select(Employee).where(Employee.user_id == user.id))
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(employee, key, value)
    await add_audit(
        db,
        actor_user_id=user.id,
        action="employee.self_update",
        entity_type="employee",
        entity_id=str(employee.id),
        request=request,
        metadata={"fields": list(body.model_dump(exclude_unset=True).keys())},
    )
    await db.commit()
    await db.refresh(employee)
    return employee


@router.get("/{employee_id}", response_model=EmployeePublic)
async def get_employee(
    employee_id: UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    employee = await db.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.patch("/{employee_id}", response_model=EmployeePublic)
async def admin_update_employee(
    employee_id: UUID,
    body: EmployeeAdminUpdate,
    request: Request,
    actor: User = Depends(require_roles(Role.HR, Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    employee = await db.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    changes = body.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(employee, key, value)
    await add_audit(
        db,
        actor_user_id=actor.id,
        action="employee.admin_update",
        entity_type="employee",
        entity_id=str(employee.id),
        request=request,
        metadata={"fields": list(changes.keys())},
    )
    await db.commit()
    await db.refresh(employee)
    return employee
