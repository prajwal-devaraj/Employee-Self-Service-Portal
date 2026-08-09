# Deployment guide

## Recommended production topology
- CDN/WAF -> Next.js web service
- API gateway/WAF -> FastAPI service
- Managed PostgreSQL 18 with encryption, backups and PITR
- Redis 8.2 LTS in a private network
- Centralized secrets manager
- Central logging/tracing/SIEM

## Required production environment changes
- Generate a cryptographically random `SECRET_KEY`.
- Set `APP_ENV=production`.
- Set `COOKIE_SECURE=true`.
- Set only the real HTTPS frontend in `CORS_ORIGINS`.
- Replace demo seed credentials and disable automatic seeding.
- Use private database/Redis endpoints.
- Add OIDC/SAML SSO and MFA.
- Put downloadable employee documents in private object storage with expiring signed URLs.

## Database migration
Run `alembic upgrade head` as a one-off release job before new API replicas receive traffic.

## Kubernetes / cloud
The application containers are stateless and can be deployed to Kubernetes, ECS/Fargate, Cloud Run, Azure Container Apps or similar platforms. Prefer managed PostgreSQL and managed Redis over running stateful databases in the application cluster.

## Security gates
Add SAST, dependency scanning, container scanning, DAST against staging and infrastructure-as-code scanning before a regulated production launch.
