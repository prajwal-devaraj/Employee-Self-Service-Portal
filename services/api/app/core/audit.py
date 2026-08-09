from uuid import UUID

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditLog


async def add_audit(
    db: AsyncSession,
    *,
    actor_user_id: UUID | None,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    request: Request | None = None,
    metadata: dict | None = None,
) -> None:
    ip = request.client.host if request and request.client else None
    db.add(
        AuditLog(
            actor_user_id=actor_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip,
            metadata_json=metadata or {},
        )
    )
