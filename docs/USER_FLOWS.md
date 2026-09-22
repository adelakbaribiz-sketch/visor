# User Flows

These describe the frontend (mock-data) experience, which is what's demoed by default — see
`docs/DEMO.md` for how to also exercise the real backend directly.

## 1. First visit → explore without logging in
`/` (landing) → "Explore without logging in" → `/dashboard` redirects to `/login` (the demo auth
gate still applies) → pick any seeded demo account (password is not checked, any non-empty value
is accepted — see `web/src/lib/auth.ts`) → `/dashboard`.

## 2. Log in → review the dashboard
`/login` → select or type a seeded demo email → `/dashboard`. Shows: total updates, updates in the
last 30 days, countries tracked, unread alerts, a 6-week sparkline, a by-priority breakdown, a
by-country bar chart, and the 5 most recent updates. All numbers are computed from the same fixture
array shown on `/updates` — nothing here is a separately fabricated statistic.

## 3. Find a specific rule change
`/updates` → type a keyword (e.g. "blue card") and/or pick a country/priority filter → click a
result → `/updates/[id]` shows the full summary, tags, and source link, with an explicit note that
the content is seeded/fictional sample text, not a real government notice.

## 4. Ask a question in plain language
`/chat` → click a suggested chip or type a question (e.g. "H-1B fee changes") → the assistant
bubble returns the keyword-matched updates as linked titles. The UI states directly that this is
keyword search, not an LLM call.

## 5. Review alerts
`/alerts` → see notification records (unread/read/dismissed) tied to specific updates and the user
they were generated for. No action sends an email — this list is exactly what a real delivery
system would need to consume, if one existed (see `docs/ROADMAP.md`).

## 6. Understand what's real
`/settings` → "What's real in this build" table — the same honesty breakdown as this docs folder,
surfaced directly in the product for a reviewer who never opens the repo.

## 7. (Stub) Onboarding
`/onboarding` → a 3-step wizard (firm details → countries tracked → invite team) that is a pure UI
stub: nothing is persisted, invites are not sent. Reachable directly by URL; not linked from the
main nav, since it's not part of the core demoable loop.

## Backend-only flow (not wired to the frontend today)
`POST /api/auth/register` → `POST /api/auth/login` → `POST /api/updates` (as ADMIN/ATTORNEY,
succeeds) or as PARALEGAL/CLIENT (403) → `GET /api/search?q=...` returns the just-created record
via real Postgres full-text search. See `docs/DEMO.md` for the exact commands run to verify this.
