import logging

from fastapi import HTTPException, Request, status
from redis.asyncio import Redis

from app.core.config import settings

logger = logging.getLogger("ess.rate_limit")
redis_client = Redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)


async def enforce_login_rate_limit(request: Request) -> None:
    """Limit brute-force login attempts by source IP.

    Production deployments should additionally rate limit at the edge/WAF.
    """
    ip = request.client.host if request.client else "unknown"
    bucket = f"ess:login:{ip}"
    try:
        attempts = await redis_client.incr(bucket)
        if attempts == 1:
            await redis_client.expire(bucket, 300)
        if attempts > 10:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many sign-in attempts. Try again shortly.",
            )
    except HTTPException:
        raise
    except Exception:
        # Availability-first fallback; the edge layer remains the primary production limiter.
        logger.warning("rate_limit_backend_unavailable", exc_info=True)
