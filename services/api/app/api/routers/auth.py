from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.audit import add_audit
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import enforce_login_rate_limit
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.models import RefreshSession, User
from app.schemas import LoginRequest, MeResponse, Message

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie(
        "access_token",
        access,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    response.set_cookie(
        "refresh_token",
        refresh,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/api/v1/auth",
    )


@router.post("/login", response_model=MeResponse)
async def login(
    body: LoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    await enforce_login_rate_limit(request)
    stmt = select(User).options(selectinload(User.employee)).where(User.email == body.email.lower())
    user = await db.scalar(stmt)

    if not user or not user.is_active or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    session = RefreshSession(
        user_id=user.id,
        expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(session)
    await db.flush()

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id, session.id)
    _set_auth_cookies(response, access, refresh)
    await add_audit(
        db,
        actor_user_id=user.id,
        action="auth.login",
        entity_type="user",
        entity_id=str(user.id),
        request=request,
    )
    await db.commit()
    return MeResponse(user=user, employee=user.employee)


@router.post("/refresh", response_model=Message)
async def refresh(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(default=None),
) -> Message:
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh session missing")
    payload = decode_token(refresh_token, "refresh")
    try:
        user_id = UUID(payload["sub"])
        session_id = UUID(payload["sid"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh session") from exc

    session = await db.scalar(
        select(RefreshSession).where(
            RefreshSession.id == session_id,
            RefreshSession.user_id == user_id,
        )
    )
    now = datetime.now(UTC)
    if not session or session.revoked_at or session.expires_at <= now:
        raise HTTPException(status_code=401, detail="Refresh session expired")

    # Rotation: revoke old refresh session and create a new one.
    session.revoked_at = now
    new_session = RefreshSession(
        user_id=user_id,
        expires_at=now + timedelta(days=settings.refresh_token_expire_days),
        user_agent=session.user_agent,
        ip_address=session.ip_address,
    )
    db.add(new_session)
    await db.flush()
    _set_auth_cookies(
        response,
        create_access_token(user_id),
        create_refresh_token(user_id, new_session.id),
    )
    await db.commit()
    return Message(message="Session refreshed")


@router.post("/logout", response_model=Message)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(default=None),
) -> Message:
    if refresh_token:
        try:
            payload = decode_token(refresh_token, "refresh")
            session_id = UUID(payload["sid"])
            session = await db.get(RefreshSession, session_id)
            if session and not session.revoked_at:
                session.revoked_at = datetime.now(UTC)
                await db.commit()
        except (HTTPException, KeyError, TypeError, ValueError):
            pass

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/v1/auth")
    return Message(message="Signed out")


@router.get("/me", response_model=MeResponse)
async def me(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    user = await db.scalar(
        select(User).options(selectinload(User.employee)).where(User.id == user.id)
    )
    assert user is not None
    return MeResponse(user=user, employee=user.employee)
