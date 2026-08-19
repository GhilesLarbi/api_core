# SaaS Template

FastAPI + PostgreSQL + Redis + SeaweedFS backend, two Vite SPAs (user site, admin dashboard), React
Email templates. Everything runs through one compose file.

## Setup

```bash
cp .env.example .env                 # ENVIRONMENT + host ports
cp backend/.env.example backend/.env # secrets
docker compose up -d
```

`.env` holds `ENVIRONMENT` (`LOCAL`, `STAGING`, `PRODUCTION`) and the host side of every published
port. `backend/.env` holds secrets only. Nothing else in the repo carries a `.env`; per-environment
values are derived in `backend/app/core/settings.py` and `web/settings.ts`.

## Database

```bash
docker compose exec api alembic upgrade head
docker compose exec api python -m app.seeds
```

Seeds are idempotent: permissions from `backend/app/core/permissions.py`, then the JSON files in
`backend/app/seeds/data/`. Sign in with `admin@example.com` (admin) or `testuser@example.com` (user);
passwords live in those JSON files.

After changing a model:

```bash
docker compose exec api alembic revision --autogenerate -m "what changed"
docker compose exec api alembic upgrade head
```

Run `alembic revision --autogenerate` a second time and confirm it emits `pass` only, then delete the
probe revision.

## Services

| service | url |
| --- | --- |
| api | http://localhost:8000 |
| api docs | http://localhost:8000/docs |
| user site | http://localhost:3000 |
| admin dashboard | http://localhost:3002 |

`worker` and `scheduler` run taskiq off the same image. `LOCAL` serves the web apps with the Vite dev
server; any other `ENVIRONMENT` builds and serves the bundle.

```bash
docker compose logs -f api
docker compose restart api
docker compose down          # add -v to drop the database
```

## Web

Commands run from `web/` (pnpm workspace, `@shared/*`):

```bash
pnpm install
pnpm dev                          # both apps
pnpm --filter @shared/admin dev   # one app
pnpm typecheck
pnpm build
pnpm lint
```

After changing any `package.json`, run `pnpm install` on the host, then
`docker compose up -d web-admin web-user`. Do not rebuild the image for a dependency change.

## Emails

From `emails/`:

```bash
pnpm dev             # preview
pnpm export:backend  # render to backend/app/templates/emails/
```

Prop defaults are the Jinja tokens the backend fills. Never edit the exported HTML.

## Deployment

`.github/workflows/deploy.yml` rsyncs the repo to a VPS, builds, starts compose and migrates. Set the
branches in its `on.push.branches` list and the `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_HOST_KEY`
secrets.

## Agent instructions

`AGENTS.md` routes to the per-area files under `.agents/`.
