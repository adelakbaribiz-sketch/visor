# Security

## What is real

- **Password storage**: bcrypt with 12 salt rounds (`api/src/auth/auth.service.ts`). Passwords are
  never stored or logged in plaintext.
- **Auth tokens**: JWT, signed server-side with `JWT_SECRET`, containing `{ sub, tenantId, role }`.
  Verified on every protected route via `JwtAuthGuard` → `JwtStrategy`
  (`api/src/auth/jwt.strategy.ts`), using `passport-jwt`'s bearer-token extraction — not a
  hand-rolled verification.
- **Role enforcement**: `RolesGuard` (`api/src/auth/roles.guard.ts`) is a real `CanActivate` guard
  reading `@Roles(...)` metadata via `Reflector`, applied to `POST /api/updates`. Covered by 4
  passing unit tests (`api/src/auth/roles.guard.spec.ts`) exercising: no-metadata pass-through,
  matching role allowed, non-matching role rejected (403), and unauthenticated rejected. See
  `docs/TESTING.md`.
- **Input validation**: every request body is validated with `class-validator` DTOs
  (`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` set globally
  in `api/src/main.ts`), so unexpected fields are rejected rather than silently accepted.
- **Update/search tenant scoping**: because `ImmigrationUpdate.tenantId` is nullable, `findAll`,
  `findOne`, `stats` and search apply "shared (NULL) OR caller's tenant", with the tenant taken from the
  JWT; a foreign id returns 404. Latent hardening (no code writes tenant-owned updates yet), covered by
  mocked-client regression tests; the raw-SQL clause is only checked by inspecting the SQL template.
- **Tenant scoping**: every tenant-owned query filters by `tenantId` taken from the verified JWT
  payload (`@CurrentUser()`), never from a client-supplied parameter — see `alerts.service.ts` for
  the clearest example.
- **Rate limiting** (`api/src/common/rate-limit.guard.ts`): `POST /auth/login` 10 requests/IP/minute,
  `POST /auth/register` 5/IP/minute, returning 429. Unit-tested. In-memory and per-process — not
  shared across replicas (see "NOT real" below).
- **Security headers** (`security-headers.middleware.ts`): `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and HSTS on TLS requests. Hand
  written (no `helmet`; no registry access). Unit-tested.
- **Sanitized errors** (`all-exceptions.filter.ts`): unhandled errors return a generic 500; message and
  stack are logged server-side only. The unauthenticated `/api/health` endpoint no longer echoes raw
  database error text. Unit-tested.
- **JWT secret fail-fast** (`auth/jwt-secret.ts`): in `NODE_ENV=production` the API refuses to start
  with the placeholder `dev-secret-change-me` or a secret under 32 characters. `docker-compose.yml`
  no longer defaults the secret. Unit-tested; compose behavior checked with `docker compose config`.
- **Bounded input**: the search `q` param is validated (max 200 chars); list endpoints accept capped
  pagination (`pageSize` max 100).
- **Containers** run as the non-root `node` user (image builds not run — see LIMITATIONS).
- **CORS**: restricted to `CORS_ORIGIN` (default `http://localhost:3400`), not wildcard.
- **Secrets**: `.env` files are git-ignored in both `api/` and (if one is ever created) `web/`;
  `.env.example` files contain only placeholder values. No real secret is committed anywhere in
  this repository.

## What is explicitly NOT real / NOT implemented

- **Frontend demo auth** (`web/src/lib/auth.ts`) is a `localStorage`-only session with **no
  password check** — any non-empty password is accepted for a seeded demo email. It exists purely
  to gate the mock-data UI shell for a demo and is labeled as such in the code, the login page UI,
  and the in-app Settings page. It must never be mistaken for the real auth system.
- No SSO/SAML/OAuth.
- Rate limiting exists for login/register only, is per-process (in-memory), and is not distributed-safe;
  no account lockout, no CAPTCHA, no limiter on other routes.
- Tokens are stateless 24h JWTs with no refresh/revocation mechanism.
- Swagger UI at `/api/docs` is served without authentication; gate or disable it in production.
- No CSRF protection (the API is a pure bearer-token JSON API with no cookie-based session, which
  removes most CSRF exposure, but this was not independently verified with a test).
- No Postgres Row-Level Security policies — tenant isolation is enforced only at the application
  query layer (see `docs/ARCHITECTURE.md` "Multi-tenancy"). A bug in a future query could leak
  cross-tenant data; this is a known limitation of the chosen simplest-real-option model, not
  something this build claims to have hardened against.
- No dependency vulnerability scan was run in this sandbox (no `npm audit` network access — see
  `docs/LIMITATIONS.md`). Dependency versions were copied from the sibling `saas-platform` project
  rather than freshly resolved, so they inherit whatever advisories apply to those pinned versions.
- No penetration testing, no SOC2/ISO27001/GDPR compliance claim — this is a demo project.
- No file upload handling exists (no attack surface for that), consistent with `docs/ROADMAP.md`.

## Security pass performed for this build

Manual review covered: secrets not committed (confirmed — `.env` files exist locally but are
git-ignored, `.env.example` files have placeholders only), the role-guard logic (unit-tested), DTO
validation coverage on every write endpoint, and CORS configuration. No XSS-relevant surface exists
in the frontend beyond React's default escaping (no `dangerouslySetInnerHTML` anywhere in
`web/src/`, confirmed by inspection); no raw SQL string concatenation exists in the backend (the
one raw-SQL usage, `search.service.ts`, uses Prisma's tagged-template `$queryRaw`, which
parameterizes interpolated values rather than concatenating strings).

### Upgrade pass (2026-09-23)

Re-reviewed auth, authorization, tenant scoping, input validation, error handling, headers, secrets,
and container/CI config by reading the code. Findings and outcome:

| Finding | Severity | Outcome |
|---|---|---|
| Placeholder JWT secret was the silent docker-compose default | High (forgeable tokens if deployed as-is) | FIXED (fail-fast check + required compose var) |
| No rate limiting on login/register | High | FIXED (per-process; see limits above) |
| Update/search reads not scoped to tenant despite nullable `tenantId` | Medium (latent) | FIXED, mocked-client tests |
| `/api/health` returned raw DB error text to anonymous callers | Low | FIXED |
| No security headers | Low | FIXED |
| Settings page and a controller comment claimed the API was "verified against a running Postgres" — never true | Honesty | FIXED (corrected copy) |
| Search `q` unbounded | Low | FIXED (max 200) |
| Containers ran as root | Low | FIXED in Dockerfiles (unbuilt) |
| Swagger UI unauthenticated; no token revocation; no lockfiles; no `npm audit` | Medium/Low | NOT fixed, listed above |

SQL injection re-checked: the only raw SQL uses Prisma's parameterizing tagged template. XSS: still no
`dangerouslySetInnerHTML`. No dependency vulnerability scan was possible (no network).

### Original build pass

Findings: **PASSED** (secrets hygiene, role-guard correctness, input validation coverage, no
`dangerouslySetInnerHTML`, no string-concatenated SQL). No FIXED items were needed. REMAINING items
are the "not implemented" list above, which is tracked, not hidden.
