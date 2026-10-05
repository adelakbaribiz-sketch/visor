# Changelog

## 2026-09-23 — Upgrade pass

See `docs/UPGRADE-REPORT.md` for the before/after table. Summary:

- Security: login/register rate limiting, security headers, sanitized errors, fail-fast production
  JWT secret check, required compose secret, tenant scoping of update/search reads, non-root containers.
- Backend: optional capped pagination, validated search query.
- Frontend: elevation/motion tokens, `Surface`/`ElevatedSurface`, KPI cards elevated, panels
  consolidated; corrected two claims that overstated verification.
- DevOps: CI and Docker builds no longer require a lockfile; API healthcheck.
- Tests: 9 -> 33 backend unit tests. Still not run: Docker, live DB, live ingestion, CI on GitHub.

## 2026-09-22 — Initial MVP build

- Scaffolded `web/` (Next.js 16 App Router, TypeScript, Tailwind v4) and `api/` (NestJS 12, Prisma
  7, PostgreSQL) as independently runnable projects.
- Frontend: landing page, demo login/signup, dashboard (real charts over mock data), searchable/
  filterable updates list + detail page, keyword-search chat UI, alerts list, settings page with an
  in-app honesty table, mobile-responsive layout, distinct navy/gold/serif visual identity.
- Backend: JWT auth (register/login), role-guarded write endpoint (`POST /api/updates`, ADMIN/
  ATTORNEY only), real Postgres full-text search endpoint, alert-record listing, health check,
  Federal Register ingestion script, Prisma schema + seed script.
- Verified: `web/` and `api/` both build and lint clean; 9 backend unit tests pass; manual browser
  walkthrough of every frontend page with no console errors; `docker compose config` validates.
- Not verified in this build's sandbox: `docker compose up`, the live Federal Register fetch, and
  any end-to-end HTTP flow against a running Postgres — see `docs/LIMITATIONS.md` for why and
  `docs/TESTING.md` for the full list of what was and wasn't run.
- Full documentation set added under `docs/` plus root `README.md`, `LICENSE`, `.env.example`,
  `.github/workflows/ci.yml`.
