# CLAUDE.md

Stack, scripts, and container commands are in @README.md.
Deployment runtime contract: @docs/deployment.md
Local environments and CI: @docs/local-environment-and-ci.md
Intentional differences from the source site: @docs/deviations-from-original.md

## What this project is

Static clone of a live Vietnamese coffee-chain site. Content is hardcoded, there
is no backend, no auth, no real cart, and no payments. Features that look
interactive on the original are presentational here — check
`docs/deviations-from-original.md` before assuming a gap is a bug.

## Conventions that are not obvious from the code

**Images go through `getImageUrl()`** (`src/lib/image-url.ts`). It resolves a
bare filename against a `import.meta.glob` map of `src/assets/images/**`. Do not
write `import img from '...'` or hardcode `/assets/...` paths — a missing file
falls back to a placeholder and warns in dev, and hashed build names differ from
source names.

**Page metadata goes through `usePageMeta()`** (`src/lib/use-page-meta.ts`), not
manual `document.title` writes. Every route-level page calls it.

**Tailwind v4 is CSS-first.** Design tokens live in the `@theme` block in
`src/styles/main.css` (`--color-primary`, `--container-max`, …), not in a
`tailwind.config.js` — that file does not exist. Add tokens there and use them
as normal utilities (`text-primary`, `bg-page`).

**Routing is config-based** in `src/routes.tsx` (React Router v7), not file-based.
New pages need an entry there. Vietnamese URL slugs (`/chuyen-cua-thuc`,
`/cua-hang`) mirror the original site and must not be renamed.

**Content lives in `src/data/*.ts`** as typed modules, not JSON or a CMS. Types
are in `src/data/types.ts`.

## Layout

- `src/components/<area>/` — PascalCase `.tsx`, grouped by feature (`blog`, `home`, `layout`, `menu`, `store`, `ui`)
- `src/pages/` — one component per route
- `src/lib/` — shared helpers, kebab-case filenames
- `deploy/nginx.conf` — production Nginx config baked into the image

## Nginx behavior worth knowing

`deploy/nginx.conf` deliberately distinguishes three cases: hashed `/assets/`
files get immutable caching, `index.html` is never cached, and static-looking
paths that do not exist return `404` rather than falling back to `index.html`.
Only unmatched non-asset routes fall back for client-side routing. Preserve that
split when editing — collapsing it into a single `try_files` breaks 404s for
missing assets.

## Before committing

Run `npm run lint` and `npm run build`. CI runs both plus a container check on
every push to `main`; see `.github/workflows/ci.yml`.

Vietnamese text is user-facing copy — preserve diacritics exactly and do not
"fix" it to English.
