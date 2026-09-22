# Architecture

## System overview

```
                          ┌─────────────────────────────┐
                          │   web/  (Next.js App Router) │
                          │                               │
   Browser  ────────────▶ │  Pages read via               │
                          │  lib/data/client.ts  ─────┐   │
                          │  (thin data interface)     │   │
                          └─────────────────────────────┼──┘
                                                          │
                        DEFAULT (this build)              │  SWAP-IN (documented,
                        reads local fixtures               │  not wired up by default)
                        web/src/lib/data/fixtures.ts        │
                                                          ▼
                                              ┌───────────────────────┐
                                              │  api/ (NestJS)         │
                                              │  /api/auth             │
                                              │  /api/updates          │
                                              │  /api/search            │
                                              │  /api/alerts             │
                                              └──────────┬─────────────┘
                                                          │ Prisma
                                                          ▼
                                              ┌───────────────────────┐
                                              │ PostgreSQL             │
                                              └──────────┬─────────────┘
                                                          ▲
                                              ┌───────────────────────┐
                                              │ api/src/ingestion/      │
                                              │ federal-register.script │
                                              │ (real fetch, run manually)│
                                              └───────────────────────┘
```

The frontend and backend are **two independently runnable projects** that happen to share a data
shape, not a monorepo. `web/` never imports from `api/`.

## Design system

Visor's visual identity is deliberately distinct from the sibling `saas-platform` project's
default look, per this workspace's convention of not reusing a template across unrelated demo
projects.

- **Palette**: deep navy (`--navy-900` `#10253f`) + parchment background, with a restrained warm
  gold (`--gold-500` `#c89b3c`) used only for priority/attention signals (unread badges, the
  "demo data" pill), never as decoration.
- **Typography**: a serif display face (`ui-serif` / system Georgia stack) for headings, paired
  with the system sans stack for body/UI text. Chosen for a "counsel/editorial" register
  appropriate to a legal-tech, trust-sensitive B2B product.
- **No external font loading.** `next/font/google` was intentionally avoided — this sandbox has no
  outbound network access to fetch remote font files at build time (verified; see
  `docs/LIMITATIONS.md`), and system font stacks render identically without that dependency.
- **No component library / shadcn.** All UI is hand-built Tailwind utility markup plus a handful
  of shared components (`web/src/components/`). This keeps the dependency surface small and
  avoids the generic "AI-template" look that a default shadcn setup produces.
- Charts (`web/src/components/charts/BarChart.tsx`, `Sparkline.tsx`) are hand-written inline SVG,
  not a charting library — there's only two chart types needed, and it avoids an unnecessary
  dependency.

Full rationale is also inlined as a comment at the top of `web/src/app/globals.css`.

## Frontend data layer

Every page/component reads data through `web/src/lib/data/client.ts`, never directly from
`fixtures.ts`. Today every function in that file reads from an in-memory fixture array
(`web/src/lib/data/fixtures.ts`) and returns a `Promise` (so the call sites already look like real
async data fetching).

### Extension point: swapping in the real API

To point the frontend at the real NestJS API instead of mock data:

1. Set `NEXT_PUBLIC_API_URL` (see `web/.env.example`) to the API's base URL.
2. In `web/src/lib/data/client.ts`, replace each function body with a `fetch()` call to the
   matching endpoint (see `docs/API_SPEC.md` for the exact routes/shapes — they were designed to
   match these function signatures and return types).
3. No page or component changes are required — they only ever call the functions exported from
   `client.ts`.

This swap has **not** been made in this build (per the frontend-first scope decision — see
`docs/PROJECT_CONTEXT.md`). The mock data path is what's demoed by default; the real API is
proven to work independently (see `docs/TESTING.md`), just not wired to this frontend.

### Demo-only auth

`web/src/lib/auth.ts` is a client-side-only, `localStorage`-backed session used purely to gate the
dashboard UI shell behind a login screen for the demo. It is explicitly documented in that file
and in the in-app Settings page as **not a real security boundary**. The real, verified JWT auth
lives entirely in `api/src/auth` and is exercised independently (see `docs/TESTING.md`,
`docs/SECURITY.md`).

## Backend

Minimal NestJS modules, each with a single responsibility:

| Module | Responsibility |
|---|---|
| `auth` | Register/login, bcrypt password hashing, JWT issuance, `JwtAuthGuard`, `RolesGuard` |
| `updates` | CRUD-lite over `ImmigrationUpdate` — list/filter/get (any authenticated role), create (ADMIN/ATTORNEY only, enforced by `RolesGuard`) |
| `search` | Real Postgres full-text search (`to_tsvector`/`ts_rank`, ILIKE fallback) backing the chat UI |
| `alerts` | List notification records for the current tenant |
| `health` | `/api/health` — checks the DB connection with `SELECT 1` |
| `ingestion` (script, not a module) | Standalone script; not part of the HTTP API — see below |

See `docs/API_SPEC.md` for the full route list and `docs/DATA_MODEL.md` for the Prisma schema.

### Chatbot

"Ask Visor" is a **keyword / full-text search**, not an LLM integration. `GET /api/search?q=...`
runs a real `to_tsvector('english', ...)` @@ `websearch_to_tsquery` query ranked by `ts_rank`,
falling back to `ILIKE` if the tsquery has no matchable terms. The frontend's `/chat` page renders
the ranked results as a chat bubble.

An **optional, not-enabled-by-default** extension point exists at
`api/src/search/llm-summarizer.ts` for wiring in an LLM to turn the ranked results into a
natural-language answer, gated behind `OPENAI_API_KEY`. It throws if called — it is dead code kept
only to document the intended future shape. No request is ever sent to any LLM provider by this
codebase today.

### Ingestion: the one real external source

`api/src/ingestion/federal-register.script.ts` is a standalone script (run via
`npm run ingest:federal-register`, not exposed as an HTTP endpoint) that:

1. Fetches from `https://www.federalregister.gov/api/v1/documents.json` (free, public, no API key)
   filtered to `term=immigration` and document types Rule/Proposed Rule/Notice.
2. Parses each result into the `ImmigrationUpdate` shape.
3. Upserts by `document_number` (stored as `externalId`, a unique column), so re-running it is
   idempotent.

This script is real, complete code — not a stub — but it has **not been executed against the live
API from this development sandbox**, because the sandbox has no outbound network access (see
`docs/LIMITATIONS.md` for the verification of that constraint). Running it yourself against a real
network is expected to work as written; that expectation is not the same as a verified result, and
this documentation does not conflate the two.

## Multi-tenancy

Single shared Postgres database. Every tenant-owned row (`User`, `Alert`) carries a `tenantId`
column, and every query scopes by it (e.g. `alerts.service.ts` always filters
`where: { tenantId }`, sourced from the authenticated JWT's `tenantId` claim, never a client-
supplied value). `ImmigrationUpdate.tenantId` is nullable because records ingested from a public
source (like the Federal Register script) are shared reference data, not owned by one tenant.

This is the simplest real option that still demonstrates tenant isolation. Postgres Row-Level
Security (RLS) policies were considered and explicitly **not** implemented, because they were not
written and verified in this sandbox — claiming RLS without testing it would violate this
project's no-fake-completion rule. See `docs/DECISIONS.md`.
