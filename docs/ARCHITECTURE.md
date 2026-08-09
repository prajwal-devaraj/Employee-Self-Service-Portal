# Architecture

## Principles
- Modular monolith first: easier to operate than premature microservices while preserving domain boundaries.
- Defense in depth: authentication, authorization, validation, secure cookies, auditability and least privilege.
- Async I/O: FastAPI + SQLAlchemy async for scalable database-bound workloads.
- Stateless API tier: user session state is represented by signed access tokens and refresh-session records.
- Evolvable domains: employee, leave, attendance, payroll, announcement and audit modules can be extracted later.

## Authentication
The API sets a short-lived access token and a refresh token in HttpOnly cookies. Refresh tokens include a session id (`sid`) backed by the database. Logout revokes the refresh session.

## Authorization
RBAC is enforced in backend dependencies. Frontend hiding of actions is only UX; it is not a security boundary.

## Data model
`users` owns identity and authorization. `employees` owns HR-facing profile data. Domain tables reference employees or users with UUID primary keys.

## Observability
Requests get a correlation id, structured logs and timing headers. Production should export logs/traces to OpenTelemetry-compatible infrastructure.

## Scalability path
1. Managed PostgreSQL with read replicas/PITR.
2. Redis caching and distributed rate limiting.
3. Background worker for notifications and PDF payslip generation.
4. Object storage for documents.
5. OIDC/SAML identity provider.
6. Extract high-throughput domains only when metrics justify it.
