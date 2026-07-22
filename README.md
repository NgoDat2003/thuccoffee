# Thức Coffee — Frontend Clone + Admin Auth Foundation

Clone of [thuccoffee.com.vn](http://www.thuccoffee.com.vn), a Vietnamese coffee
chain site. The repository now includes an Express backend with public read APIs and local
Postgres/MinIO infrastructure alongside the React frontend. The frontend still
uses static data and downloaded local images; authentication, admin CRUD, a
real cart, and payments are outside the current scope.

See `plans/260717-1000-thuccoffee-static-clone/plan.md` for the frontend clone
and `plans/260720-1730-backend-foundation/plan.md` for the backend foundation.

## Stack

- Vite + React 19 + TypeScript (strict mode)
- Tailwind CSS v4 (CSS-first `@theme`)
- React Router v7 (config-based routing)
- `@fontsource/roboto` (self-hosted, Vietnamese diacritics)
- `embla-carousel-react` / `yet-another-react-lightbox`
- Express 5 + TypeScript backend foundation (`server/`)
- Postgres 16 for local backend development
- MinIO object storage with a public-read `thuccoffee` bucket

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # oxlint
```

The backend has its own dependencies and scripts:

```bash
cd server
npm install
npm run dev      # backend on http://localhost:8080
npm run build
npm run lint
npm run smoke:api # requires the local backend on port 8080
```

The backend exposes health plus nine public read endpoints for categories, banners,
site settings, stores, blog posts, and products. Store detail includes its ordered
gallery, blog pagination is database-backed, and product categories are joined
without N+1 queries. The frontend intentionally continues to
read `src/data/*.ts` and bundled files from `src/assets/images/` until the next phase.

## Local admin login

Create or reset a local admin without placing credentials in source:

```powershell
cd server
$env:DATABASE_URL="postgresql://thuccoffee:thuccoffee@127.0.0.1:5432/thuccoffee"
$env:ADMIN_EMAIL="you@example.com"
$env:ADMIN_PASSWORD="choose-a-strong-password"
npm run create-admin
```

Then open `http://localhost:3000/admin/login`. Run `npm run smoke:auth` with the same `ADMIN_EMAIL` and `ADMIN_PASSWORD` while the stack is running.

## Image storage

MinIO is available as the future canonical image store, but the frontend does
not call MinIO yet. Image files intentionally exist in both places during this
transition: the repository remains the frontend source while the seed command
uploads the same relative keys to the public-read bucket.

```bash
cd server
cp .env.example .env       # first run; keep the real .env uncommitted
npm run db:seed-images
```

The seed discovers files recursively, preserves paths relative to
`src/assets/images/`, and overwrites the same object keys safely. Verify counts
dynamically instead of encoding them in scripts. Current snapshot: 498 valid
image files/target objects after 103 obsolete emoji PNG files were converted to
Unicode text in blog content and removed.

## Local Compose stack

Compose builds the production-style frontend and backend images, then starts
their local dependencies.

```bash
cp .env.example .env           # first run; replace JWT_SECRET
docker compose up -d --build   # build and start on http://localhost:3000
docker compose ps              # container status and health
docker compose logs -f         # follow logs
docker compose down            # stop and remove
```

| Service | Local endpoint | Notes |
|---|---|---|
| Frontend | `http://localhost:3000` | Nginx SPA; API and media use same-origin proxies |
| Backend | `http://localhost:8080/api/health` | Waits for Postgres and MinIO health |
| Postgres | `localhost:5432` | Persistent `postgres-data` volume |
| MinIO API | `http://localhost:9000` | Persistent `minio-data` volume |
| MinIO console | `http://localhost:9001` | Local administration only |
| `minio-init` | one-shot container | Creates `thuccoffee` and enables anonymous download |

Local defaults are for development only. Change MinIO credentials and keep the
console private in production; see `docs/deployment.md` for the full runtime and
security contract.
