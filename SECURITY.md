# Security Policy

## Reporting
Do not open public issues for exploitable security defects. Report privately to the repository owner.

## Baseline controls
- Argon2id password hashing
- Short-lived access JWTs and rotating refresh sessions
- HttpOnly / SameSite cookies
- Server-side RBAC
- Pydantic validation
- SQLAlchemy parameterized queries
- CORS allow-list
- Security response headers
- Audit logs for sensitive actions
- No secrets committed to source control

For production, add enterprise SSO/MFA, managed secret storage, WAF/rate limiting, dependency/SAST/DAST scanning, centralized logs and SIEM integration.
