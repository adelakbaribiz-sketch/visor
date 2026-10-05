# Upgrade report

A targeted upgrade pass over the existing Visor codebase (not a rewrite). Method: inventory, read the
relevant code, prioritize by evidence, change one group at a time, test, commit separately. The living
docs (`LIMITATIONS`, `TESTING`, `SECURITY`, `DECISIONS`, `ARCHITECTURE`, `API_SPEC`) were updated in
place; this file is the before/after story only. If it ever disagrees with `docs/LIMITATIONS.md`, that
file wins.

## Starting state (verified, not assumed)

- Clean tree on `main`, 4 commits, in sync with `origin/main`.
- Baseline: `api` lint/build clean, 9/9 tests; `web` lint/build clean, 11 routes.
- Docker daemon unreachable and no outbound network (re-checked), so Docker, live-DB, live-ingestion and
  `npm audit` remained impossible. Nothing in this report claims otherwise.

## Improvement matrix

| Area | Current state | Problem | Impact | Priority | Action | Outcome |
|---|---|---|---|---|---|---|
| Secrets | Placeholder JWT secret was the silent compose default | Forgeable tokens if deployed as-is | High | P0/P1 | Fail-fast check in production; compose requires the var | Done |
| Auth | No rate limiting | Login brute force | High | P1 | Per-IP limiter on login/register | Done (per-process only) |
| Tenancy | Update/search reads ignore nullable `tenantId` | Latent cross-tenant read/IDOR | Medium | P1 | "shared OR own" scope on 4 read paths | Done (latent; mocked tests) |
| Honesty | Settings page + a code comment said API "verified against a running Postgres" | Contradicted LIMITATIONS | Trust | P1 | Corrected | Done |
| DevOps | CI and both Dockerfiles needed a lockfile that doesn't exist | Builds fail at step one | High | P1 | `npm install` fallback | Done (unrun) |
| DevOps | Root containers, no healthcheck | Hardening | Low | P2 | `USER node`, API HEALTHCHECK | Done (unbuilt) |
| Errors | Health endpoint echoed raw DB error | Info disclosure to anonymous callers | Low | P2 | Log server-side only | Done |
| Errors | Error sanitization relied on framework default | Unasserted property | Low | P2 | Global filter + test | Done |
| Headers | None | Hardening | Low | P2 | Middleware + test | Done |
| API | Hardcoded `take: 200`; search `q` unvalidated | Unbounded growth / input | Medium | P2 | Opt-in capped pagination; `SearchQueryDto` | Done |
| UI | Card pattern copy-pasted ~18x; flat dashboard; no depth/motion tokens | Duplication, no hierarchy | Medium | P2 | `Surface`/`ElevatedSurface`, tokens, KPI elevation | Done (partial adoption) |
| Frontend tests | None | Regressions invisible | Medium | P2 | - | Not done (no runner installable offline) |
| Lockfiles / `npm audit` | None | Supply chain unknown | Medium | P1 | - | Not done (no network) |
| Swagger unauthenticated, no token revocation | Present | Production concern | Medium | P2 | - | Not done, documented |
| AI trust framing | Chat page already says "Keyword search - no LLM call" | None | - | - | Left untouched | Healthy |
| Palette, typography, data layer, module layout | Sound | - | - | - | Left untouched | Healthy |

## Change value table

| Group (commit) | Before | After | Why | Impact | Risk |
|---|---|---|---|---|---|
| Security: limiter, headers, filter, health | No limiter/headers; health leaked DB text | Limiter on auth, 4 headers, sanitized errors | Close documented gaps | Brute force harder; less disclosure | Limiter is per-process; wrong `req.ip` behind a proxy needs `trust proxy` |
| Backend: pagination, search DTO | Fixed 200 rows; raw `q` | Opt-in `page`/`pageSize` (max 100); `q` max 200 | Bound result and input size | Scales better; response shape unchanged | Low |
| UI/3D: tokens, Surface, KPI elevation | Flat identical cards | Navy-tinted elevation on KPIs only, dark set, reduced-motion rule | Hierarchy without noise | Primary numbers read first | Low; verified by computed style only |
| Frontend: adopt Surface, honesty fix | 8 duplicated panels; false claim in UI | Shared component; accurate copy | Maintainability, trust | One place to restyle | Low |
| Security+DevOps: JWT guard, compose, Docker, CI | Insecure default; builds can't succeed | Refuses weak secret in prod; installable builds | Real deployability | Removes a forged-token path | `docker compose up` now needs `JWT_SECRET`; image/CI unrun |
| Security: tenant scoping | Reads unscoped | Shared-or-own | Stop future cross-tenant leak | Latent | Raw-SQL clause unexecuted |

## 3D / spatial direction (what was and was not done)

Done: elevation and motion tokens (navy-tinted, separate dark set), `Surface` + `ElevatedSurface`,
KPI hover-lift using only `transform`/`box-shadow`, a global reduced-motion rule. Deliberately not
done: glass effects, gradients, parallax, WebGL, per-card animation, perspective transforms, 3D icons.
On the small screens checked (375px) nothing extra was needed: the lift is hover-only and the shadow is
one small layer. Not built from the brief's component list: spatial modal, floating nav, layered
timeline, upload area, AI analysis surface (no matching feature exists in the app).

## Performance

No measurement was made (no bundle analysis, no profiling, no query plans; there is no live database).
Reasoned changes only: bounded list queries, and CSS-only transitions on a handful of elements. The
existing `search` query's full-text expression has no supporting GIN index; adding one is a sensible
next step but was not done without a database to confirm with `EXPLAIN`.

## Final quality gate

| Item | Status |
|---|---|
| API lint / build / unit tests | Verified: clean, 33/33 |
| Web lint / build | Verified: clean |
| Integration / API HTTP tests, E2E | Not run (no Postgres, no Docker) |
| Frontend automated tests | None exist |
| Docker build, compose up, CI on GitHub | Not run |
| Dependency vulnerability scan | Not run (no network) |
| UI elevation in light/dark, 375px | Computed-style/DOM verified; no visual screenshot |
| Accessibility | Reduced-motion rule added and its CSS verified present; no keyboard/screen-reader/contrast audit run |
| RTL / i18n | Not applicable (single locale) |
| Observability | Server-side error logging added; no metrics/tracing |

## Remaining work (real)

1. Run `docker compose up`, seed, and exercise the API over HTTP on a machine with Docker and network.
2. Commit lockfiles; run `npm audit`; confirm CI goes green.
3. Shared-store rate limiting, token revocation, Swagger gating, `trust proxy` when behind a proxy.
4. Frontend test runner; finish `Surface` adoption on the remaining inline panels.
5. Wire the frontend to the API (the documented swap in `client.ts`).
