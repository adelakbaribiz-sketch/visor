# Project Context

## Origin

This project was created from a **dossier describing a proposed product**, not from an existing
codebase or a validated business. The dossier described "Visor": an international B2B SaaS for
immigration lawyers/consultants that (1) crawls embassy/government/news sources for immigration
rule changes, (2) stores them centrally, (3) answers questions via a chatbot, (4) sends real-time
change alerts, and (5) provides an admin analytics dashboard. The dossier was explicit that this
was idea/research stage only — no code existed, nothing had been built, tested, or deployed, and
it listed a long set of open questions (brand name, architecture, backend language, MVP scope,
deployment target, which embassies/sources, pricing model, and more).

This repository is the result of taking that dossier and building a **tightly scoped, honestly
labeled MVP slice** that proves the core loop (ingest → store → search/chat → display →
alert-record) actually runs, rather than attempting the full 13-feature platform described in the
dossier. Every place this build had to invent something the dossier didn't specify is disclosed in
the gap-analysis table below.

## Precedent followed

This workspace has an established house style for this kind of project, set by the sibling
`saas-platform` project (see `../saas-platform/docs/PROJECT_CONTEXT.md`), which was built from a
similarly underspecified dossier ("Veridex"). This project follows the same conventions:

- NestJS + Prisma + PostgreSQL API, Next.js (App Router) + TypeScript frontend, Docker Compose for
  local dev — the same stack, same dependency versions where practical (see `docs/DECISIONS.md`
  for the one place a workaround was needed).
- A gap-analysis table disclosing every invented detail (below).
- REAL vs. SIMULATED/DEMO DATA vs. NOT IMPLEMENTED separated explicitly, everywhere — in code
  comments, in the running UI (badges/labels), and in this documentation.
- No claim that anything "works" or is "tested" unless it was actually run and verified in this
  environment — see `docs/TESTING.md` for exactly what was run and what wasn't.

Visor and Veridex are unrelated fictional products; nothing here reuses Veridex's content, only
the process.

## Classification

**C. SAAS** (B2B, multi-tenant, web application) — immigration-legal-tech vertical.

## Scope decision: frontend-first, minimum necessary backend

Partway through this build, the effort allocation was deliberately rebalanced toward: (1)
frontend, (2) product flow, (3) UX, (4) demo functionality, (5) data layer, (6) API, (7) auth, (8)
advanced backend. Concretely:

- The Next.js frontend is fully explorable **standalone**, with realistic mock data served from a
  local data module (`web/src/lib/data/`), and does not require Postgres, Docker, or the API to be
  running to demo the core screens.
- A real NestJS + Prisma + PostgreSQL backend exists and was built, but is deliberately **minimal**:
  one auth flow, one role-guarded write endpoint, one real full-text search endpoint, and one real
  external-source ingestion script — not a full microservice set, not multi-tenant row-level
  security, not a queue system.
- The frontend's data access is architected behind a thin interface
  (`web/src/lib/data/client.ts`) specifically so the real API can be swapped in later without
  rewriting UI — see `docs/ARCHITECTURE.md`, "Extension point: swapping in the real API".

## Invented demo concept: "Northbridge Immigration Partners"

To demo the product with realistic-looking data, this project adopts one invented example tenant:

> **Northbridge Immigration Partners** — a fictional boutique immigration law firm using Visor to
> track rule changes across the countries it files in (US, UK, Canada, Germany, Australia,
> France) and to give its attorneys, paralegals, and a client portal user a shared view of what
> changed and why it matters.

This is used consistently across the frontend mock fixtures (`web/src/lib/data/fixtures.ts`) and
the backend seed script (`api/prisma/seed.ts`) so a demo walkthrough is coherent whether you're
looking at the mock-data frontend or a frontend pointed at the real, seeded database.

**"Northbridge Immigration Partners" is fictional.** No real law firm, client, government notice,
or business result exists in this repository. Every screen that shows data not backed by a live
external source is labeled as seeded/demo data in the UI and in this documentation.

## Gap analysis (what the dossier did not provide, and how each gap was closed)

| Gap | Resolution | Status |
|---|---|---|
| Product/brand name | Used the dossier's own working name, "Visor" | ASSUMPTION |
| Backend language/framework | NestJS + TypeScript + Prisma (dossier listed this as acceptable; matches workspace precedent) | DESIGNED |
| Frontend framework | Next.js App Router + TypeScript + Tailwind (matches workspace precedent) | DESIGNED |
| Multi-tenancy model | Single shared Postgres DB, `tenantId` column + application-level row scoping. No Postgres RLS policies (not verified, so not claimed) | DESIGNED |
| MVP feature scope | Narrowed from the dossier's 5 pillars to: auth, data model, one real ingestion source, real keyword/FTS search ("chatbot"), admin dashboard, alert records. Case management, billing, white-label, mobile app, real email/Telegram delivery, i18n, compliance certifications explicitly excluded — see `docs/ROADMAP.md` | ASSUMPTION |
| Which embassies/government sources to crawl | One real source implemented: the U.S. Federal Register public JSON API (free, no key required, regularly publishes immigration rules). All other "sources" in the seed/mock data are fictional samples, clearly labeled | DESIGNED / PARTIAL |
| Demo tenant, users, sample records | Invented "Northbridge Immigration Partners" firm, 4 demo users (one per role), ~20 fictional sample `ImmigrationUpdate` records | ASSUMPTION |
| Pricing / business model | Not fabricated. Frontend shows `planLabel: "Demo workspace"`; no pricing tiers or numbers are invented anywhere | NOT APPLICABLE |
| Chatbot implementation | Real keyword/full-text search (Postgres `to_tsvector`/`ts_rank`, with an `ILIKE` fallback) exposed as a chat-style UI. No LLM is called — see `docs/ARCHITECTURE.md` "Chatbot" | REAL |
| LLM-powered summarization | Documented, unused extension point behind `OPENAI_API_KEY` (`api/src/search/llm-summarizer.ts`). Never called by the app; would need a real API key and real testing before being claimed as working | NOT IMPLEMENTED (documented only) |
| Real-time change alerts | Alert/notification **records** are created and listed; no email/Telegram/push delivery exists | PARTIAL (records REAL, delivery NOT IMPLEMENTED) |
| Live crawling verification | Ingestion script (`api/src/ingestion/federal-register.script.ts`) is real, complete fetch→parse→store code. It has **not** been run against the live Federal Register API from this sandbox, because this sandbox has no outbound network access (verified — see `docs/LIMITATIONS.md`) | REAL CODE, UNVERIFIED LIVE RUN |
| Security implementation | Real for what exists: bcrypt password hashing, JWT auth, a real, tested role guard (`RolesGuard`) enforced on one write endpoint, `class-validator` input validation. Anything beyond that (SSO, rate limiting, pen testing, RLS) is `PROPOSED` — see `docs/SECURITY.md` | PARTIAL / REAL |
| Automated tests | Real unit tests for `AuthService` and `RolesGuard` (9 passing tests). No e2e/integration tests against a live Postgres were run in this sandbox — see `docs/TESTING.md` | PARTIAL |
| Deployment | Docker Compose provided; `docker compose config` validated successfully. Whether `docker compose up` was actually run in this sandbox, and its result, is stated plainly in `docs/DEMO.md` and `docs/DEPLOYMENT.md` — no claim beyond what was actually observed | SEE DEMO.md |

See `docs/LIMITATIONS.md`, `docs/DEMO.md`, and `docs/TESTING.md` for the authoritative, up-to-date
statement of what is real versus mocked versus not implemented.
