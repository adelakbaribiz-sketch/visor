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
- **Tenant scoping**: every tenant-owned query filters by `tenantId` taken from the verified JWT
  payload (`@CurrentUser()`), never from a client-supplied parameter — see `alerts.service.ts` for
  the clearest example.
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
- No rate limiting or brute-force protection on `/api/auth/login`.
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

Findings: **PASSED** (secrets hygiene, role-guard correctness, input validation coverage, no
`dangerouslySetInnerHTML`, no string-concatenated SQL). No FIXED items were needed. REMAINING items
are the "not implemented" list above, which is tracked, not hidden.
