from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.core.database import get_db
from app.models import AuditLog, Role, User
from app.schemas import AuditPublic

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=list[AuditPublic])
async def list_audit_logs(
    limit: int = Query(default=100, ge=1, le=250),
    _: User = Depends(require_roles(Role.HR, Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
    return list(rows)
