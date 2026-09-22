# Visor

An MVP demo of an immigration change-intelligence SaaS for immigration lawyers and consultants:
track embassy/government rule changes, search them in plain language, and see alert records — all
in one place.

**Status: MVP / Demo.** This is a portfolio project built from a product dossier, not a funded or
customer-validated business. See `docs/PROJECT_CONTEXT.md` for the full disclosure of what was
invented versus real, and `docs/LIMITATIONS.md` for exactly what has and hasn't been verified to
run.

## Problem

Immigration rules change constantly, across dozens of embassy/government/news sources per
country. Firms track this manually today — slow, easy to miss, with real consequences for clients.

## Solution

Visor centralizes tracked rule changes into one searchable record per update (country, visa type,
priority, source), gives the team a keyword-search "chat" interface over that record set, and
surfaces real-time-looking alert records — with a real ingestion path proven against one live
public source (the U.S. Federal Register).

## Features

| Feature | Status |
|---|---|
| Auth (JWT, 4 roles: Admin/Attorney/Paralegal/Client) | REAL (backend), MOCK (frontend demo gate) |
| Immigration update tracking (country, visa type, priority, source) | REAL data model; SIMULATED demo records |
| One real external ingestion source (Federal Register API) | REAL code, UNVERIFIED live run in this sandbox |
| Keyword/full-text search ("Ask Visor" chat UI) | REAL |
| Alert/notification records | REAL records, NO real delivery |
| Admin dashboard (stats, charts, filters) | REAL, computed from real/seeded data |
| Docker Compose local stack | REAL config, `docker compose up` NOT run in this sandbox |

See `docs/PROJECT_CONTEXT.md` for the full gap-analysis table and `docs/LIMITATIONS.md` for the
authoritative real-vs-mock breakdown.

## Architecture

```
web/   Next.js 16 (App Router) + TypeScript + Tailwind — reads mock data by default via
       web/src/lib/data/client.ts, a thin interface designed to be swapped for real API calls.
api/   NestJS 12 + Prisma 7 + PostgreSQL — minimal, real backend: auth, one role-guarded write
       endpoint, real full-text search, alert-record listing, one real ingestion script.
```

Full detail: `docs/ARCHITECTURE.md`. Data model: `docs/DATA_MODEL.md`. API reference:
`docs/API_SPEC.md`.

## Tech stack

- **Frontend**: Next.js 16.3.5, React 19.2, TypeScript 5, Tailwind CSS 4.
- **Backend**: NestJS 12, Prisma 7.10 (with the `@prisma/adapter-pg` driver adapter), PostgreSQL
  16, `passport-jwt`, `bcryptjs`, `class-validator`.
- **Tooling**: `oxlint`, `vitest`, `eslint` (via `eslint-config-next`), Docker Compose.
- Versions were matched to the sibling `saas-platform` project in this workspace for consistency —
  see `docs/DECISIONS.md`.

## Demo instructions

Fastest path (frontend only, no backend/Docker needed):
```bash
cd web
npm install
npm run dev -- --port 3400
```
Open `http://localhost:3400` and log in with any seeded demo email (see `docs/DEMO.md` for the
list and full walkthrough, including the real-backend path).

## Installation

```bash
# Frontend
cd web && npm install

# Backend (requires PostgreSQL — see docker-compose.yml for a local one)
cd api && npm install
npx prisma generate
```

## Environment variables

See `.env.example` (root, summary), `api/.env.example`, `web/.env.example`. Nothing sensitive is
committed; `.env` files are git-ignored.

## Project structure

```
visor/
├── web/                  Next.js frontend
│   └── src/
│       ├── app/          App Router pages (dashboard, updates, chat, alerts, settings, ...)
│       ├── components/   Shared UI (Badge, StatCard, AppShell, charts/)
│       └── lib/          data/ (mock data + client interface), auth.ts (demo session)
├── api/                  NestJS backend
│   ├── prisma/           schema.prisma, seed.ts
│   └── src/
│       ├── auth/         JWT auth, RolesGuard
│       ├── updates/      ImmigrationUpdate CRUD-lite
│       ├── search/       Real Postgres full-text search
│       ├── alerts/       Alert-record listing
│       └── ingestion/    federal-register.script.ts (real, standalone)
├── docs/                 Full documentation set (see below)
└── docker-compose.yml
```

## API summary

`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/updates` (+ filters), `POST
/api/updates` (ADMIN/ATTORNEY only), `GET /api/search?q=`, `GET /api/alerts`, `GET /api/health`.
Full spec: `docs/API_SPEC.md`. Interactive docs at `/api/docs` when the server is running.

## Security

Real: bcrypt password hashing, JWT auth, a tested role guard, `class-validator` input validation,
tenant-scoped queries, restricted CORS. Not implemented: SSO, rate limiting, RLS, dependency
scanning in this sandbox. Full breakdown: `docs/SECURITY.md`.

## Roadmap / limitations / future development

- `docs/ROADMAP.md` — explicitly out-of-scope features (case management, billing, real alert
  delivery, i18n, etc.) and plausible next steps.
- `docs/LIMITATIONS.md` — the authoritative real-vs-mock-vs-not-implemented reference, including
  the sandbox constraints (no network, no working Docker daemon) that shaped what could be verified.

## Documentation index

`docs/PROJECT_CONTEXT.md` · `docs/PRODUCT_REQUIREMENTS.md` · `docs/ARCHITECTURE.md` ·
`docs/USER_FLOWS.md` · `docs/API_SPEC.md` · `docs/DATA_MODEL.md` · `docs/SECURITY.md` ·
`docs/ROADMAP.md` · `docs/DECISIONS.md` · `docs/DEMO.md` · `docs/DEPLOYMENT.md` ·
`docs/TESTING.md` · `docs/LIMITATIONS.md` · `docs/CHANGELOG.md`

---

## Business & Product Overview

**Problem**: immigration rule changes are scattered across many sources per country; firms track
them manually today.

**Target customer**: small-to-mid-size immigration law firms and independent immigration
consultants handling multiple countries/visa types.

**Solution**: a centralized, searchable log of tracked rule changes with role-based team access and
alert records.

**Workflow**: a change is ingested (crawled or seeded) → stored as a normalized `ImmigrationUpdate`
→ appears in the dashboard/updates list and is searchable via "Ask Visor" → generates an alert
record for relevant team members.

**Differentiation**: purpose-built for the immigration vertical (country + visa-type structured
data, not generic document search), with a real, verifiable ingestion pattern rather than a
promised-but-unbuilt crawler.

**Monetization possibility** (not implemented, not claimed as validated): per-seat SaaS pricing,
tiered by number of countries/visa types tracked — no pricing numbers are fabricated anywhere in
this repository.

**Scalability**: the ingestion pattern (fetch → normalize → idempotent upsert by external ID)
generalizes to additional sources; the multi-tenant data model generalizes to additional firms
without schema changes.

**Current stage**: **MVP / Demo** — see the Honest Status breakdown below and `docs/LIMITATIONS.md`.

## Portfolio Case Study

**What I built**: a scoped MVP slice of a B2B immigration-legal-tech SaaS — a polished, fully
mock-data-navigable Next.js frontend, plus a minimal but real NestJS/Prisma/PostgreSQL backend
proving the ingest → store → search → display → alert-record loop end to end.

**Problem**: turn an underspecified product dossier (idea-stage only, many open questions, no
existing code) into something concretely demoable without overbuilding or faking completeness.

**Approach**: frontend-first — build the full product surface against realistic mock data so it's
demoable with zero setup, architect the mock-data layer behind a swappable interface, then build
just enough real backend (auth, one role-guarded endpoint, one real search implementation, one real
external ingestion script) to prove the concept holds up against a real database and a real public
data source.

**Architecture**: see the diagram and detail in `docs/ARCHITECTURE.md`.

**Key features**: role-based auth with a genuinely enforced (unit-tested) authorization rule; real
Postgres full-text search wired into a chat-style UI instead of an untested/unavailable LLM call;
an idempotent ingestion script against a real public government API; a dashboard with real
computed statistics, not fabricated numbers.

**Technical highlights**: driver-adapter Prisma client (`@prisma/adapter-pg`) matching the
workspace's established backend pattern; typed Next.js 16 route helpers (`PageProps`/
`LayoutProps`) verified against the installed version's own bundled docs rather than assumed from
training data (this Next.js version has breaking changes from what a model would expect by
default); a hand-built, dependency-light design system instead of a generic component-library look.

**Challenges**: the build sandbox had no outbound network access and no working Docker daemon,
which ruled out `npm install`, live API testing, Google Fonts, and full-stack Docker verification.
Handled by: copying dependencies from an already-installed sibling project (disclosed), using
system fonts instead of remote ones, and being explicit in every doc about exactly what could and
couldn't be verified as a result, rather than either skipping the backend or falsely claiming it
was tested end-to-end.

**Design decisions**: see `docs/DECISIONS.md` for the one-line reasoning behind each notable
choice.

**Current status**: **MVP / Demo.**

**Limitations**: see `docs/LIMITATIONS.md` (authoritative).

**Future roadmap**: see `docs/ROADMAP.md`.

## Honest Status Breakdown

| Area | Status |
|---|---|
| Frontend UI (all pages, mock data, charts, responsive) | REAL — built, builds clean, lints clean, manually verified in-browser |
| Frontend demo auth | MOCKED — `localStorage`, no real password check, clearly labeled |
| Backend auth (JWT, bcrypt) | REAL — unit tested |
| Backend role enforcement | REAL — unit tested (`RolesGuard`, 4 tests) |
| Backend full-text search | REAL — builds/lints clean; not exercised against a live DB in this sandbox |
| Federal Register ingestion | REAL CODE — execution against the live API not verified in this sandbox |
| Alert records | REAL (storage/listing) — delivery NOT IMPLEMENTED |
| LLM chat summarization | PROPOSED / NOT ENABLED — documented extension point only |
| Docker Compose | REAL config (validated); `docker compose up` NOT run in this sandbox |
| Billing, case management, CRM, mobile app, i18n, compliance certs | NOT IMPLEMENTED (ROADMAP only) |

---

For the standing engineering-process expectations this project follows (full process, no fake
completion, investigate before changing), see the workspace-level
`feedback_engineering_process.md` referenced from project memory. No fabricated customers,
revenue, test results, or certifications appear anywhere in this repository.
