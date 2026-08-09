from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.core.audit import add_audit
from app.core.database import get_db
from app.models import Announcement, Role, User
from app.schemas import AnnouncementCreate, AnnouncementPublic

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("", response_model=list[AnnouncementPublic])
async def list_announcements(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(
        select(Announcement)
        .order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
        .limit(50)
    )
    return list(rows)


@router.post("", response_model=AnnouncementPublic, status_code=201)
async def create_announcement(
    body: AnnouncementCreate,
    request: Request,
    actor: User = Depends(require_roles(Role.HR, Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    announcement = Announcement(author_id=actor.id, **body.model_dump())
    db.add(announcement)
    await db.flush()
    await add_audit(
        db,
        actor_user_id=actor.id,
        action="announcement.created",
        entity_type="announcement",
        entity_id=str(announcement.id),
        request=request,
    )
    await db.commit()
    await db.refresh(announcement)
    return announcement
