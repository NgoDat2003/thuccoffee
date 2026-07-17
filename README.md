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
