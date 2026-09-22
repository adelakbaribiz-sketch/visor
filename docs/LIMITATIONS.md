# Limitations

This is the single authoritative "what's actually real" reference for this repository. If any
other doc or UI copy seems to say something stronger than this file, this file wins.

## Sandbox limitations (environment, not product design)

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
- **Postgres RLS is not implemented.** Tenant isolation is enforced only at the Prisma query layer.

## What genuinely is real

- The Next.js frontend: real code, builds cleanly, lints cleanly, manually walked through in a
  browser with no console errors, responsive at mobile width.
- The NestJS API: real code, builds cleanly, lints cleanly, 9 passing unit tests covering
  authentication and the role-guard logic.
- The Prisma schema and seed script: real, syntactically valid, `prisma generate` succeeded offline.
- The Docker Compose configuration: real, validated by `docker compose config`.
- The Federal Register ingestion script: real, complete code; execution unverified (see above).
