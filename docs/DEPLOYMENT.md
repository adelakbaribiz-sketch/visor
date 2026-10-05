# Deployment

## Current status: local only, not deployed

No hosted/live deployment of this project exists anywhere. Nothing in this documentation claims
otherwise. The only environment this has run in is local development inside the sandbox described
in `docs/TESTING.md` and `docs/LIMITATIONS.md`.

## Local deployment (Docker Compose)

`docker-compose.yml` at the repo root defines three services: `postgres` (16-alpine, port 5433 on
the host to avoid colliding with the sibling `saas-platform` project's Postgres on 5432), `api`
(port 4100), `web` (port 3400, mapped from the container's 3000). `docker compose config` was
validated in this build (see `docs/TESTING.md`); `docker compose up` was not run here due to a
sandbox Docker daemon issue — see `docs/LIMITATIONS.md`.

`JWT_SECRET` is now **required** (no default). In production mode the API also refuses to start with
the placeholder value or a secret under 32 characters:

```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```

The Dockerfiles run as the non-root `node` user and the API image has a `HEALTHCHECK` on
`/api/health`; neither has been built in this environment. Neither project has a committed
lockfile, so builds and CI use `npm install` until one is added.

## Hypothetical hosted deployment (not set up, not attempted)

If this were taken further:
- **web/**: any Next.js-compatible host (Vercel, or the included Dockerfile's standalone build
  behind any container platform).
- **api/**: any container platform that can run the `api/Dockerfile` image against a managed
  Postgres (e.g. Render, Fly.io, ECS + RDS).
- Secrets (`JWT_SECRET`, `DATABASE_URL`, optionally `OPENAI_API_KEY`) would need to be set via the
  hosting platform's secret manager, never committed.
- CORS (`CORS_ORIGIN`) would need updating to the real deployed frontend origin.

None of this has been configured, tested, or costed out. It is listed only as the obvious next
step, not as work already done.
