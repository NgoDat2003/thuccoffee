# Thức Coffee — Frontend Clone + Backend Foundation

Clone of [thuccoffee.com.vn](http://www.thuccoffee.com.vn), a Vietnamese coffee
chain site. The repository now includes an Express backend foundation and local
Postgres alongside the React frontend. The frontend still uses static data and
downloaded images; content APIs, authentication, a real cart, and payments are
outside the current scope.

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
```

At this stage the backend exposes its health endpoint; content APIs are planned
separately and the frontend continues to read `src/data/*.ts`.

## Running the production container

Serves the built SPA through Nginx, the same image the deployment uses.

```bash
docker compose up -d --build   # build and start on http://localhost:3000
docker compose ps              # container status and health
docker compose logs -f         # follow logs
docker compose down            # stop and remove
```

Compose starts the frontend on `3000` and publishes Postgres on host port
`5432`. The backend uses `8080` when started from `server/`. See
`docs/deployment.md` for the deployment runtime contract.
