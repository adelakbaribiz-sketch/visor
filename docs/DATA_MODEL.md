# Data Model

Source of truth: `api/prisma/schema.prisma`. The frontend's mock types
(`web/src/lib/data/types.ts`) mirror this shape deliberately, so pointing the frontend at the real
API later doesn't require reshaping data — see `docs/ARCHITECTURE.md`.

## Entities

### Tenant
The law firm / organization workspace.
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| name | String | |
| slug | String | unique, generated from `name` on register |
| createdAt | DateTime | |

### User
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| tenantId | String | FK → Tenant, cascade delete |
| email | String | unique |
| passwordHash | String | bcrypt, 12 salt rounds |
| name | String | |
| role | enum `ADMIN \| ATTORNEY \| PARALEGAL \| CLIENT` | default `PARALEGAL` |
| createdAt | DateTime | |

### Country
Reference data, not tenant-scoped.
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| code | String | unique, ISO 3166-1 alpha-2 |
| name | String | unique |

### VisaType
Reference data, not tenant-scoped.
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| countryId | String | FK → Country |
| code | String | e.g. `H-1B` |
| label | String | e.g. `Specialty Occupation Worker` |
| | | `@@unique([countryId, code])` |

### ImmigrationUpdate
The core tracked record.
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| tenantId | String? | **nullable** — see rationale below |
| title | String | |
| summary | String | |
| sourceUrl | String | |
| sourceName | String | |
| countryId | String | FK → Country |
| visaTypeId | String? | FK → VisaType, nullable |
| priority | enum `LOW \| MEDIUM \| HIGH \| CRITICAL` | default `MEDIUM` |
| publishedAt | DateTime | when the source published it |
| ingestedAt | DateTime | default now(), when Visor stored it |
| tags | String[] | |
| externalId | String? | **unique**, natural key for idempotent upsert from the ingestion script (e.g. Federal Register `document_number`) |

`tenantId` is nullable because records from the real ingestion path (`federal-register.script.ts`)
are shared reference data pulled from a public government source — no single tenant "owns" a
federal rule change. Seed-script demo records set `tenantId` to the demo tenant so the per-tenant
dashboard/alerts views have something to show.

### Alert
Notification **record** only — see `docs/LIMITATIONS.md` for what this does not do (no email/
Telegram/push delivery).
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | |
| tenantId | String | FK → Tenant |
| updateId | String | FK → ImmigrationUpdate |
| userId | String | FK → User |
| status | enum `UNREAD \| READ \| DISMISSED` | default `UNREAD` |
| channel | String | always `"IN_APP"` today |
| createdAt | DateTime | |

## Indexes

`tenantId`, `countryId`, `priority`, and `publishedAt` are indexed on `ImmigrationUpdate` since
those are exactly the filters the `/api/updates` list endpoint and the frontend's Updates table
support. `Alert` is indexed on `tenantId` and `userId` for the same reason.

## What's intentionally not modeled

Per project scope, there is no `Case`, `Document` (uploaded file), `Invoice`/billing record, or
`AuditLog` model — see `docs/ROADMAP.md` for what's explicitly out of scope for this MVP.
