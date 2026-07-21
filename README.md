# Thức Coffee — Static Clone

Static frontend clone of [thuccoffee.com.vn](http://www.thuccoffee.com.vn), a Vietnamese coffee chain site. React + Vite + TypeScript SPA with hardcoded content and downloaded images — no backend, no auth, no real cart or payments.

See `plans/260717-1000-thuccoffee-static-clone/plan.md` for the full implementation plan and phase breakdown.

## Stack

- Vite + React 19 + TypeScript (strict mode)
- Tailwind CSS v4 (CSS-first `@theme`)
- React Router v7 (config-based routing)
- `@fontsource/roboto` (self-hosted, Vietnamese diacritics)
- `embla-carousel-react` / `yet-another-react-lightbox`

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # oxlint
```

## Running the production container

Serves the built SPA through Nginx, the same image the deployment uses.

```bash
docker compose up -d --build   # build and start on http://localhost:3000
docker compose ps              # container status and health
docker compose logs -f         # follow logs
docker compose down            # stop and remove
```

The frontend runs on `3000`; the backend uses `8080` and Postgres `5432`. See
`docs/deployment.md` for the deployment runtime contract.
