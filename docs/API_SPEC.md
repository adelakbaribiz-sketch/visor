# API Spec

Base path: `/api` (set via `app.setGlobalPrefix('api')` in `api/src/main.ts`). Interactive Swagger
docs are served at `/api/docs` when the server is running (`api/src/main.ts`). This file is a
static summary of the same routes for quick reference; if the two ever disagree, the running
Swagger UI (generated from the actual decorators) is authoritative.

All routes except `POST /api/auth/register` and `POST /api/auth/login` require
`Authorization: Bearer <token>`.

## Auth (`api/src/auth`)

### `POST /api/auth/register`
Creates a new Tenant and an ADMIN User in one call.
```json
// request
{ "organizationName": "Northbridge Immigration Partners", "name": "Priya Nathan", "email": "priya@northbridge.example", "password": "at-least-8-characters" }
// response
{ "accessToken": "<jwt>" }
```

### `POST /api/auth/login`
```json
// request
{ "email": "priya@northbridge.example", "password": "at-least-8-characters" }
// response
{ "accessToken": "<jwt>" }
```
JWT payload: `{ sub: userId, tenantId, role }`, signed with `JWT_SECRET`, expiring after
`JWT_EXPIRES_IN_SECONDS` (default 86400).

## Updates (`api/src/updates`)

### `GET /api/updates?countryId=&visaTypeId=&priority=&page=&pageSize=`
Any authenticated role. Returns `ImmigrationUpdate` rows (with `country`/`visaType` included),
newest `publishedAt` first, as a plain array (unchanged response shape). `page`/`pageSize` are
optional (added in the upgrade pass, see `docs/UPGRADE-REPORT.md`); with neither supplied, behaves
exactly as before (up to 200 rows). `pageSize` is capped at 100 regardless of what's requested.

### `GET /api/updates/stats`
Any authenticated role. Returns `{ total, byPriority, byCountry }` — real aggregate counts via
Prisma `groupBy`, not fabricated numbers.

### `GET /api/updates/countries`
Any authenticated role. Lists all `Country` rows.

### `GET /api/updates/visa-types?countryId=`
Any authenticated role. Lists `VisaType` rows, optionally filtered by country.

### `GET /api/updates/:id`
Any authenticated role. 404 if not found.

### `POST /api/updates` — **role-guarded**
Requires role `ADMIN` or `ATTORNEY`. A `PARALEGAL` or `CLIENT` token gets `403 Forbidden` from
`RolesGuard` (`api/src/auth/roles.guard.ts`) — this is the one protected resource with real,
tested role enforcement required by project scope. See `docs/TESTING.md` for how this was
verified.
```json
{
  "title": "USCIS raises H-1B registration fee for FY2028 cap season",
  "summary": "...",
  "sourceUrl": "https://www.federalregister.gov/documents/example",
  "sourceName": "Federal Register",
  "countryId": "<country id>",
  "visaTypeId": "<visa type id, optional>",
  "priority": "HIGH",
  "publishedAt": "2026-09-20T00:00:00.000Z",
  "tags": ["fee-change"]
}
```

## Search (`api/src/search`)

### `GET /api/search?q=<text>`
Any authenticated role. Backs the "Ask Visor" chat UI. `q` is validated (max 200 characters) via
`SearchQueryDto` rather than read as a raw, unbounded query param.
```json
{
  "query": "H-1B fee",
  "resultCount": 1,
  "results": [
    { "id": "...", "title": "...", "summary": "...", "countryName": "United States", "priority": "HIGH", "publishedAt": "...", "rank": 0.42 }
  ]
}
```
Implementation: real Postgres `to_tsvector`/`websearch_to_tsquery`/`ts_rank`, `ILIKE` fallback. No
LLM call — see `docs/ARCHITECTURE.md` "Chatbot".

## Alerts (`api/src/alerts`)

### `GET /api/alerts?page=&pageSize=`
Any authenticated role. Returns `Alert` records for the caller's tenant, including the related
`update` and `user`, newest first, as a plain array. Same optional `page`/`pageSize` pagination as
`GET /api/updates` (default: up to 200, unchanged from before). Record only — no delivery (see
`docs/LIMITATIONS.md`).

## Health

### `GET /api/health`
No auth required. Runs `SELECT 1` against the database and reports `{ status: "ok" | "degraded", database: "connected" | "unreachable" }`.
