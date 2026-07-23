# Thức Coffee — Frontend Clone + Admin CMS

Clone of [thuccoffee.com.vn](http://www.thuccoffee.com.vn), a Vietnamese coffee
chain site. The repository contains a React frontend, an Express backend with
public read APIs and a full admin CMS (JWT auth, CRUD for products, categories,
blog, stores, banners, site settings, image upload to MinIO, rich-text blog
editor), plus local Postgres/MinIO infrastructure. A real cart and payments are
outside the current scope.

**Important:** the public-facing pages still render from static data in
`src/data/*.ts` — content edited in the admin is saved to the database but does
**not** appear on the public pages yet. Images are the exception: all pages load
them from MinIO through the `/media` proxy. Wiring the public pages to the read
API is the next phase. Do not report this gap as a bug during testing.

Plan history lives in `plans/`; each folder documents one completed work cycle.

## Stack

- Vite + React 19 + TypeScript (strict mode)
- Tailwind CSS v4 (CSS-first `@theme`)
- React Router v7 (config-based routing)
- TanStack Query for admin data fetching; Tiptap for the blog editor
- Express 5 + TypeScript backend (`server/`) with Drizzle ORM
- Postgres 16, MinIO object storage (public-read `thuccoffee` bucket)

## Quick start (Docker Compose)

Runs the production-style frontend and backend images plus their dependencies.

```bash
cp .env.example .env           # first run; REPLACE JWT_SECRET with a fresh value
docker compose up -d --build   # build and start on http://localhost:3000
docker compose ps              # container status and health
```

| Service | Local endpoint | Notes |
|---|---|---|
| Frontend | `http://localhost:3000` | Nginx SPA; API and media use same-origin proxies |
| Backend | `http://localhost:8080/api/health` | Waits for Postgres and MinIO health |
| Postgres | `localhost:5432` | Persistent `postgres-data` volume |
| MinIO API | `http://localhost:9000` | Persistent `minio-data` volume |
| MinIO console | `http://localhost:9001` | Local administration only |
| `minio-init` | one-shot container | Creates `thuccoffee` and enables anonymous download |

First-time database setup (once, in order):

```bash
cd server
npm install
npm run db:migrate        # create schema
npm run db:seed           # load content from src/data/*.ts — see warning below
npm run db:seed-images    # upload images from src/assets/images/ to MinIO
```

> **⚠️ Seed overwrites admin edits.** `npm run db:seed` upserts and
> delete-recreates rows, so re-running it **destroys any content edited through
> the admin**. Run it exactly once when standing up an environment. Treat it as
> a reset tool, never as a routine command. (Splitting bootstrap-once from
> dev-reset is tracked technical debt — see `docs/backend-architecture.md`.)

## Admin login

Credentials are never stored in source. Create or reset an admin account
against your own database:

```powershell
cd server
$env:DATABASE_URL="postgresql://thuccoffee:thuccoffee@127.0.0.1:5432/thuccoffee"
$env:ADMIN_EMAIL="you@example.com"
$env:ADMIN_PASSWORD="choose-a-strong-password"   # 12+ characters
npm run create-admin
```

Then open `http://localhost:3000/admin/login`. Re-running the script resets the
password for that email. Accounts live in the `users` table (argon2id hashes) —
each environment creates its own; there is no default account.

## Development (without Docker)

```bash
npm install
npm run dev            # frontend dev server
npm run build          # production build
npm run lint           # oxlint
npm run test:admin-ui  # vitest — admin table + blog editor corpus (267 posts)
npm run test:admin-e2e # Playwright — requires the Compose stack running
```

The backend has its own dependencies and scripts:

```bash
cd server
npm install
npm run dev      # backend on http://localhost:8080
npm run build
npm run lint
```

## Smoke suites (regression net)

Eight suites in `server/scripts/smoke-*.ts` exercise auth, public API, admin
CRUD, uploads, and image integrity against a running stack. Admin suites need
`ADMIN_EMAIL`/`ADMIN_PASSWORD` of an existing account:

```bash
cd server
npm run smoke:auth
npm run smoke:api
npm run smoke:admin-products
npm run smoke:admin-blog              # includes 267-post sanitizer byte-identity gate
npm run smoke:admin-stores
npm run smoke:admin-banners-settings
npm run smoke:upload
npm run smoke:images
```

Run them before concluding anything about backend or admin behavior.

## Image storage

MinIO is the canonical image store; the database stores object keys only
(`storage_key`, `blog-asset:<key>` markers in blog HTML). Image files also
remain in `src/assets/images/` as the seed source during this transition.
`npm run db:seed-images` preserves paths relative to `src/assets/images/` and
overwrites the same object keys safely.

## Production notes

Local defaults are for development only. Before exposing any environment:
replace `JWT_SECRET`, change MinIO credentials, and keep the MinIO console
private. See `docs/deployment.md` for the full runtime and security contract.
