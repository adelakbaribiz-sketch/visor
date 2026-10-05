# Limitations

This is the single authoritative "what's actually real" reference for this repository. If any
other doc or UI copy seems to say something stronger than this file, this file wins.

## Sandbox limitations (environment, not product design)

**Re-verified during the upgrade pass (2026-09-23):** the Docker CLI is installed but
`docker info` still fails with `failed to connect to the docker API at
npipe:////./pipe/dockerDesktopLinuxEngine`, and `curl https://www.federalregister.gov/api/v1/agencies.json`
still returns no response (HTTP 000). Everything below remains true; nothing in the upgrade pass
changed it.

- **No outbound network access** was available while building this project. Verified with `curl`
  against `federalregister.gov`, `google.com`, and `registry.npmjs.org` — all timed out. This means:
  - The real ingestion script (`api/src/ingestion/federal-register.script.ts`) has never actually
    been executed against the live Federal Register API. It is complete, real code, reviewed for
    correctness, not a stub — but "written correctly" and "verified to work" are different claims,
    and only the first is made here.
  - `npm install` could not be run for either `web/` or `api/`; their `node_modules` were instead
    copied from the sibling `saas-platform` project's already-installed dependencies (same pinned
    versions in `package.json`). No `package-lock.json` is committed for either project as a
    result — generate one with a real `npm install` when you have network access.
  - `next/font/google` could not be used (no font files could be fetched at build time); the
    frontend uses system font stacks instead — see `docs/ARCHITECTURE.md`.
  - No `npm audit` / dependency vulnerability scan was run.
- **Docker Desktop's daemon could not be reached** in this sandbox, despite Docker Desktop being
  installed and an explicit launch attempt. `docker compose config` validated the compose file
  successfully; `docker compose up` was never run, so the full containerized stack has not been
  verified to actually start.
- **Docker image builds were never run**, so the Dockerfile changes made in the upgrade pass
  (non-root `USER node`, API `HEALTHCHECK`, lockfile-optional install) are unbuilt. The CI workflow
  has likewise not run on GitHub Actions yet.
- **No lockfiles.** Neither `api/` nor `web/` has a `package-lock.json`. The upgrade pass found that
  CI and both Dockerfiles used `npm ci` (which requires one) and would have failed at step one; they
  now fall back to `npm install` when no lockfile exists. Commit real lockfiles from a networked
  machine, after which `npm ci` is used automatically.
- **No pixel-level visual QA.** In the upgrade pass the browser pane's screenshots timed out, so the
  new elevation styles were verified through computed CSS and DOM inspection (light and dark
  emulation, 375px width, no console errors, no horizontal overflow), not by eye. Treat the 3D
  styling as "computed-style verified", not "looked at".
- **No local PostgreSQL** was available as a fallback to Docker, so no real HTTP request was ever
  made against the running API in this sandbox. The backend's business logic is covered by unit
  tests with a mocked database (see `docs/TESTING.md`), which is real but narrower than an
  end-to-end run.

If you have network/Docker access, the next things to actually run (in order) are:
`docker compose up`, then `npm run seed` (or `npm run ingest:federal-register`) inside `api/`, then
exercise the endpoints in `docs/API_SPEC.md` with curl or the Swagger UI at `/api/docs`.

## Product limitations (by design, per MVP scope)

- **No real alert delivery.** `Alert` rows are created and listed; no email, Telegram, SMS, or
  webhook is ever sent. See `docs/DATA_MODEL.md` and `docs/ROADMAP.md`.
- **No LLM integration.** "Ask Visor" is keyword/full-text search only. An extension point exists
  (`api/src/search/llm-summarizer.ts`) but throws if called and is never invoked by the app.
- **Frontend demo auth is not secure.** `web/src/lib/auth.ts` accepts any password for a seeded
  demo email and stores session state in `localStorage`. It exists only to gate the mock-data
  frontend for demo purposes. The real, tested auth is the API's JWT system — but the frontend is
  not wired to it (see `docs/ARCHITECTURE.md` "Extension point").
- **Only one real external source** (US Federal Register). All other "sources" shown in the mock
  frontend and the seed script are labeled fictional samples.
- **Single locale, no i18n.** No locale routing exists, stubbed or otherwise.
- **No file uploads, no case management, no billing** — see `docs/ROADMAP.md` for the full
  out-of-scope list.
- **Postgres RLS is not implemented.** Tenant isolation is enforced only at the Prisma query layer
  (and, for the raw-SQL search query, a hand-written `WHERE` clause that has only been checked by
  inspecting the SQL template, never against a live database).
- **Rate limiting is per-process and in-memory.** It protects a single API instance; behind several
  replicas the effective limit multiplies. A shared store (Redis) is needed for a real deployment.
- **Only the dashboard, settings, login, signup, onboarding and update-detail pages use the shared
  `Surface` component.** A few inline card variants remain (list wrappers with `overflow-hidden`, the
  chat panel, muted callouts). The elevated "3D" treatment is applied only to the dashboard KPI cards.
- **No automated frontend tests.** Adding a runner needs a package install the sandbox could not do.

## What genuinely is real

- The Next.js frontend: real code, builds cleanly, lints cleanly, manually walked through in a
  browser with no console errors, responsive at mobile width.
- The NestJS API: real code, builds cleanly, lints cleanly, 33 passing unit tests (mocked
  database) covering authentication, the role guard, rate limiting, security headers, the error
  filter, pagination, JWT-secret checks, and tenant scoping of update/search queries.
- The Prisma schema and seed script: real, syntactically valid, `prisma generate` succeeded offline.
- The Docker Compose configuration: real, validated by `docker compose config`.
- The Federal Register ingestion script: real, complete code; execution unverified (see above).
