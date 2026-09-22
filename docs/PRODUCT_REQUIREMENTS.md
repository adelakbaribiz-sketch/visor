# Product Requirements

## Problem

Immigration rules change frequently and are scattered across dozens of embassy, government, and
news sources per country. Immigration lawyers and consultants currently track this manually —
checking sites, subscribing to newsletters, relying on word of mouth — which is slow and easy to
miss, with real consequences (missed deadlines, wrong advice, client harm).

## Target users (from the dossier, refined here)

| Persona | Role in Visor | Primary need |
|---|---|---|
| Admin | Firm owner / practice lead | Workspace-wide visibility, manage team |
| Attorney | Licensed immigration attorney | Fast answers to "what changed for X visa type," ability to log a change manually |
| Paralegal | Case support staff | Browse/search updates, track alerts, cannot create records |
| Client | End client (read-only) | See updates relevant to their own case type, no admin actions |

These four roles are modeled as a real `UserRole` enum and enforced at the API layer on one
endpoint (`POST /api/updates`) — see `docs/API_SPEC.md`.

## MVP scope (this build)

In scope, real and demoable:
1. Auth (JWT) with the four roles above.
2. A normalized `ImmigrationUpdate` record: title, summary, source URL, country, visa type,
   priority, published date.
3. One real ingestion path (US Federal Register API) plus a labeled seed fallback.
4. A real keyword/full-text search exposed as a chat-style UI ("Ask Visor").
5. Alert/notification records (no real delivery).
6. An admin dashboard: list/search/filter updates, view alerts, real usage stats from the DB.
7. Docker Compose for local Postgres + API + web.

Explicitly out of scope for this MVP — see `docs/ROADMAP.md` for the full list: case management,
document generation, CRM integration, white-label, a public API product, a mobile app, real email/
Telegram delivery, full i18n, compliance certifications (SOC2/ISO/GDPR), billing/Stripe.

## Success criteria for this MVP slice

- A visitor can explore the full product surface (dashboard, updates, chat, alerts, settings) with
  zero setup, using mock data, and understand what Visor does within two minutes.
- A developer can stand up the real backend locally (Postgres + API), register, log in, and get a
  real search result back from a real database query.
- Every screen and every doc is honest about which of the above is true in a given environment —
  see `docs/DEMO.md`.
