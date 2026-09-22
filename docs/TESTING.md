# Testing

This documents exactly what was run in this build environment, with results, and what was not
attempted and why. No line below claims a result that wasn't actually observed.

## Environment constraints discovered first

- **No outbound network access.** `curl https://www.federalregister.gov/api/v1/documents.json` and
  `curl https://www.google.com` both timed out (exit 28) after 15–18s. `npm --offline install
  lodash` was the only install path that could be tested; the npm registry itself
  (`registry.npmjs.org`) was also unreachable.
- **Docker Desktop is installed but its daemon could not be reached.** `docker ps` failed with
  `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`. Docker
  Desktop was launched (`Start-Process 'Docker Desktop.exe'`) and polled for ~90 seconds; the
  daemon never came up in this sandbox. `docker compose config` (which only parses/validates,
  doesn't need the daemon) **did** succeed — see below.
- No local PostgreSQL install (`psql`, `pg_isready` not found) as a Docker fallback.

Because of the above, `node_modules` for both `web/` and `api/` were copied from the sibling,
already-installed `saas-platform` project (same pinned dependency versions) rather than freshly
`npm install`ed — see `docs/DECISIONS.md`.

## web/ (Next.js frontend)

| Command | Result |
|---|---|
| `npm run build` | **PASSED.** Next.js 16.3.5 (Turbopack). Compiled successfully, TypeScript check passed, all 10 routes generated (9 static, `/updates/[id]` dynamic). |
| `npm run lint` | **PASSED** (0 errors) after one real fix: `react-hooks/set-state-in-effect` flagged `AppShell.tsx`'s auth-gate effect; fixed with a scoped, justified `eslint-disable-next-line` (see code comment) rather than suppressing the whole rule. |
| Manual functional walkthrough (Claude Browser tool, `npm run dev` on port 3400) | **PASSED.** Verified: landing page renders; `/login` → dashboard flow works; dashboard KPIs/charts render real computed values from the fixtures; `/updates` search+filter narrows results correctly (tested "blue card" → 1 matching result); update detail page renders with source link and fictional-content disclosure; `/chat` keyword search returns correct ranked results for a suggested query ("H-1B fee changes" → 3 results including the H-1B fee update); `/alerts` renders status badges correctly; `/settings` renders the team table and the honesty table. |
| Console errors | **NONE** observed via `read_console_messages` during the walkthrough. |
| Responsive check | **PASSED** at 375×812 (mobile preset) — sidebar collapses to a bottom tab bar, dashboard cards stack to one column, charts remain legible. |

## api/ (NestJS backend)

| Command | Result |
|---|---|
| `npx prisma generate` | **PASSED** — generated the Prisma Client offline (engine binaries were already present in the copied `node_modules`). |
| `npm run build` (`nest build`) | **PASSED**, no errors. |
| `npm run lint` (`oxlint --type-aware`) | **PASSED**, 0 errors. |
| `npm test` (`vitest run`) | **PASSED — 9/9 tests.** `auth.service.spec.ts` (5 tests: register rejects duplicate email, register issues a correctly-shaped token, login rejects unknown email, login rejects wrong password, login issues a token for a correct password — all against a mocked `PrismaService`, no live DB needed). `roles.guard.spec.ts` (4 tests: no-metadata pass-through, matching role allowed, non-matching role rejected with `ForbiddenException`, unauthenticated request rejected). |
| `docker compose config` (from the project root) | **PASSED** — valid, fully resolved compose configuration printed for `postgres`, `api`, `web`. |
| `docker compose up` | **NOT RUN.** Docker daemon unreachable in this sandbox (see above). Not claimed as tested. |
| End-to-end HTTP flow against a live Postgres (`register → login → POST /api/updates as ADMIN → 403 as PARALEGAL → GET /api/search`) | **NOT RUN** in this sandbox, for the same reason. The code paths involved (`AuthService`, `RolesGuard`) are covered by the unit tests above; the full HTTP-level integration was not exercised end-to-end here. This is the single biggest verification gap in this build — see `docs/LIMITATIONS.md`. |
| `npm run ingest:federal-register` | **NOT RUN** — requires both the live Federal Register API (unreachable, see above) and a running Postgres (unreachable, see above). The script itself was written, and reviewed for correctness, but its actual execution is unverified. |

## What "PASSED" means here

Every row marked PASSED was actually executed in this session and its real output inspected (build
logs, lint output, test summary, or a live browser screenshot/DOM read) — not inferred or assumed.
Every row marked NOT RUN says so explicitly, with the blocking reason, rather than being silently
omitted.
