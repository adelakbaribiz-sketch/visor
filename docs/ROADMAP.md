# Roadmap

## Explicitly out of scope for this MVP (PROPOSED / NOT IMPLEMENTED)

These were named in the original dossier's broader vision but are deliberately excluded from this
build to keep it a provable MVP slice rather than a half-built platform:

| Feature | Status |
|---|---|
| Case management | NOT IMPLEMENTED |
| Document generation | NOT IMPLEMENTED |
| CRM integration | NOT IMPLEMENTED |
| White-label / multi-brand theming | NOT IMPLEMENTED |
| Public API product (API keys, rate limits, developer docs) | NOT IMPLEMENTED |
| Mobile app | NOT IMPLEMENTED |
| Real email delivery for alerts | NOT IMPLEMENTED (records only, see `docs/DATA_MODEL.md` Alert) |
| Real Telegram/Slack/webhook delivery | NOT IMPLEMENTED |
| Full i18n / translation | NOT IMPLEMENTED (locale routing structure not even stubbed — single-locale only) |
| SOC2 / ISO 27001 / GDPR compliance | NOT IMPLEMENTED, NOT CLAIMED |
| Billing / Stripe / subscriptions | NOT IMPLEMENTED |
| Postgres Row-Level Security | PROPOSED — see `docs/SECURITY.md` |
| LLM-powered chat summarization | PROPOSED — extension point exists (`api/src/search/llm-summarizer.ts`), not wired up |
| Additional embassy/government sources beyond the Federal Register | PROPOSED |
| Team invites (in Settings/Onboarding UI) | NOT IMPLEMENTED (UI stub only) |

## Plausible next steps, roughly ordered

1. Wire the frontend's `lib/data/client.ts` to the real API (the swap point already exists — see
   `docs/ARCHITECTURE.md`).
2. Add 1–2 more real ingestion sources (e.g. UK Home Office or IRCC, if a free/public feed exists)
   to prove the ingestion pattern generalizes beyond one source.
3. Add Postgres RLS policies and a test that actually attempts (and fails) a cross-tenant query,
   before claiming tenant isolation is enforced at the database layer.
4. Real alert delivery via a transactional email provider, starting with a single channel.
5. Replace the frontend demo auth with real API-backed sessions (HttpOnly cookie or a properly
   stored token), removing the `localStorage`-only stand-in.
6. LLM-backed chat summarization, gated behind `OPENAI_API_KEY`, with real tests against a live key
   before being described as working.
