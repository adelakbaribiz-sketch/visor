# Demo Guide

## Fastest path: frontend only, no setup

```bash
cd visor/web
npm install   # or skip if node_modules is already present
npm run dev -- --port 3400
```
Open `http://localhost:3400`. Log in with any seeded demo email (password field accepts anything —
this is explained on the login screen itself):

| Email | Role |
|---|---|
| priya@northbridge.demo | ADMIN |
| marcus@northbridge.demo | ATTORNEY |
| sofia@northbridge.demo | PARALEGAL |
| daniel@clientco.demo | CLIENT |

Walk through: Dashboard → Updates (try searching "blue card" or filtering by country/priority) →
Ask Visor (click a suggestion chip) → Alerts → Settings (see the "what's real" honesty table).

This path was actually run and verified in this build's sandbox — see `docs/TESTING.md` for the
exact checks performed (build, lint, manual browser walkthrough, mobile responsive check, zero
console errors).

## Full stack: real backend + database

Requires Docker (or a local Postgres). **This exact path was not run end-to-end in the sandbox
this project was built in** — Docker's daemon was unreachable there (see `docs/LIMITATIONS.md`).
It is expected to work as written; run it yourself and treat the result as new information, not a
confirmation of something already tested.

```bash
cd visor
cp api/.env.example api/.env      # already provided; edit JWT_SECRET for anything beyond local demo use
docker compose up --build
```

Once `postgres` reports healthy and `api` has started:
```bash
cd api
npm run db:migrate   # creates the schema
npm run seed          # loads the fictional Northbridge Immigration Partners demo data
```

Then either open `http://localhost:3400` (still using frontend mock data, since the frontend is
not wired to the API by default — see `docs/ARCHITECTURE.md`), or exercise the real API directly:

```bash
# Register a new firm + admin user
curl -X POST http://localhost:4100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"organizationName":"Test Firm","name":"Test Admin","email":"admin@test.example","password":"password123"}'
# -> { "accessToken": "<jwt>" }

# Or log in as a seeded demo user (after `npm run seed`)
curl -X POST http://localhost:4100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya@northbridge.demo","password":"demo-password-123"}'

# Search (replace <token>)
curl "http://localhost:4100/api/search?q=blue%20card" -H "Authorization: Bearer <token>"

# Try creating an update as a PARALEGAL token -> expect 403
# Try the same as an ADMIN/ATTORNEY token -> expect 201
```

Swagger UI: `http://localhost:4100/api/docs`.

To attempt the one real ingestion path:
```bash
cd api
npm run ingest:federal-register
```
This calls the live U.S. Federal Register API. If your network allows it, report back what
happened (document count fetched, any errors) so this doc and `docs/LIMITATIONS.md` can be updated
from a verified result instead of an expectation.

## What you're looking at, at a glance

Every page has a small pill or note calling out mock/demo data. The `/settings` page has a full
table. `docs/LIMITATIONS.md` is the authoritative source if anything else seems to overstate.
