---
phase: 1
title: "project-scaffolding"
status: pending
effort: "3h"
---

# Phase 1: Project Scaffolding

## Context Links
- Crawl report: `research/crawl-report.md`
- Design tokens: from `research/site-style.css` (already extracted, see plan.md)

## Overview
- **Priority:** P1 (blocks everything)
- **Status:** Pending
- Scaffold Vite + React + TS app, install all deps, wire Tailwind v4 CSS-first, set up config-based
  Router v6 with shared Layout skeleton, establish folder structure and base theme tokens.

## Key Insights
- Empty repo, git initialized, only `.gitignore` committed. `npm create vite` scaffolds into cwd (`.`).
- Tailwind v4 uses `@tailwindcss/vite` plugin + CSS `@theme` block — NO `tailwind.config.js`.
- Router config-based (14 routes only) → single `routes.tsx` array + `<RouterProvider>`, clearer than file-based.
- Fonts self-hosted via `@fontsource/roboto` (weights 400/500/700) — NOT Google Fonts CDN.
- All page components created as empty stubs here so routing compiles; content filled in later phases.

## Requirements
### Functional
- App boots (`npm run dev`), all 14 routes navigable, shared Layout renders Header/Footer skeleton + `<Outlet/>`.
- Tailwind utilities work; custom theme tokens (`--color-primary` etc.) resolve.
- `<Container>` component centers content at 1170px max-width, 15px padding.
### Non-functional
- TypeScript strict mode compiles with no errors (`tsc --noEmit`).
- Sticky header via `fixed` + `pt-[82px]` on `<main>` — NO `.dummy-scroll-height` hack.

## Architecture
- **Entry:** `main.tsx` → `<RouterProvider router={router}/>` → `App` shell.
- **Router:** `routes.tsx` exports route objects; root route element = `<Layout/>` with nested children.
- **Layout:** `<Layout/>` = `<Header/>` + `<main className="pt-[82px]"><Outlet/></main>` + `<Footer/>`.
- **Styling:** `src/styles/main.css` imports Tailwind + `@fontsource/roboto` + `@theme` tokens.
- **Data flow:** none yet (stubs only).

## Folder Structure (established here)
```
src/
├── main.tsx                       # entry + RouterProvider
├── App.tsx                        # (optional shell; Layout does the work)
├── routes.tsx                     # config-based route array
├── styles/
│   └── main.css                   # Tailwind import + @theme tokens + fontsource imports
├── components/
│   ├── layout/                    # Header, Footer, Layout, MobileDrawer, CookieBanner, FloatingOrderButton (Phase 4)
│   └── ui/                        # Container, ProductCard, SectionTitle, Button etc. (built as needed)
├── pages/                         # one component per route (stubs here)
│   ├── HomePage.tsx
│   ├── MenuPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── BlogIndexPage.tsx
│   ├── BlogDetailPage.tsx
│   ├── AboutPage.tsx
│   ├── StoreListPage.tsx
│   ├── StoreDetailPage.tsx
│   ├── MembershipPage.tsx
│   ├── CareersPage.tsx
│   ├── ContactPage.tsx
│   ├── CookiePolicyPage.tsx
│   ├── DeliveryPage.tsx
│   ├── LoginPage.tsx
│   └── NotFoundPage.tsx
├── data/                          # (Phase 3)
├── lib/                           # helpers e.g. image-path resolver (Phase 3)
└── assets/
    └── images/{products,blog,stores,site}/   # (Phase 2)
```

## Related Code Files
### Create
- `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` (via `npm create vite`, then edit)
- `src/main.tsx`, `src/routes.tsx`, `src/styles/main.css`
- `src/components/layout/Layout.tsx`, `Header.tsx` (skeleton), `Footer.tsx` (skeleton)
- `src/components/ui/Container.tsx`
- `src/pages/*.tsx` (15 stub components incl. NotFoundPage)
### Modify
- `index.html` → `lang="vi"`, title "Thức Coffee", meta description (Vietnamese).
- `.gitignore` → confirm `node_modules`, `dist` ignored.

## Implementation Steps
1. `npm create vite@latest . -- --template react-ts` (scaffold into current dir; keep `.git`/`.gitignore`).
2. `npm install`.
3. Install deps: `npm i react-router-dom @fontsource/roboto yet-another-react-lightbox embla-carousel-react` — **pin exact versions in `package.json` after install (red-team fix — Security Adversary + Assumption Destroyer findings: unpinned installs are a supply-chain risk and an unverified API-shape assumption for libs not used until Phase 5)**; run `npm audit` and resolve any high/critical findings before proceeding.
4. Install Tailwind v4: `npm i -D tailwindcss @tailwindcss/vite` — pin exact version too.
5. `vite.config.ts`: add `@tailwindcss/vite` plugin (+ `react()` plugin).
6. **Spike-verify before building on top (red-team fix — Assumption Destroyer finding: the plan stated the Tailwind v4 + Vite combo as settled fact while its own risk table admitted it was unverified):** apply one token (`--color-primary`), render `<div className="bg-primary h-4 w-4"/>`, open devtools and confirm the computed background-color is `#0c5278`. Do not proceed to step 7+ until this one visual check passes — catching a plugin-ordering/`@theme` resolution failure now is cheap; catching it after 9 more phases build on top of it is not.
7. `src/styles/main.css`:
   - `@import "tailwindcss";`
   - `@import "@fontsource/roboto/400.css";` (also 500, 700)
   - `@theme { --color-primary:#0c5278; --color-secondary:#40260a; --color-accent:#79a3b1;
     --font-sans: Roboto, system-ui, sans-serif; --container-max: 1170px; }`
   - base: `html{ font-family:var(--font-sans); }`
8. Import `main.css` in `main.tsx`. Set `<html lang="vi">` in `index.html`.
9. `src/components/ui/Container.tsx`: `<div className="mx-auto w-full max-w-[1170px] px-[15px]">{children}</div>`.
10. `Layout.tsx`: fixed Header (h-[82px], white bg), `<main className="pt-[82px]"><Outlet/></main>`, Footer.
   Header/Footer are minimal skeletons here (logo text + placeholder nav) — full build in Phase 4.
11. Create 15 page stub components: each returns `<Container><h1>{PageName}</h1></Container>`.
12. `routes.tsx`: define array — root `path:"/"` element `<Layout/>`, children map all 14 routes + `*` → NotFoundPage.
    Routes: `/`, `/menu`, `/menu/:slug`, `/chuyen-cua-thuc`, `/chuyen-cua-thuc/:slug`, `/gioi-thieu`,
    `/cua-hang`, `/cua-hang/:slug`, `/chuong-trinh-thanh-vien`, `/tuyen-dung`, `/lien-he`,
    `/chinh-sach`, `/delivery`, `/account/login`.
13. `main.tsx`: `createBrowserRouter(routes)` + `<RouterProvider>`.
14. Run `npm run dev`, click through all routes; run `npx tsc --noEmit`.

## Todo List
- [ ] Scaffold Vite React-TS into repo root
- [ ] Install runtime + dev deps, pin exact versions, `npm audit` clean
- [ ] Wire `@tailwindcss/vite` in vite.config
- [ ] Spike-verify one `@theme` color token resolves before building further
- [ ] Author `main.css` with `@theme` tokens + fontsource imports
- [ ] Build `Container` + `Layout` (skeleton Header/Footer)
- [ ] Create 15 page stubs
- [ ] Define config-based routes + 404 catch-all
- [ ] Verify dev server + `tsc --noEmit` clean

## Success Criteria
- [ ] `npm run dev` serves app; every route renders its stub inside Layout.
- [ ] Custom Tailwind color/token utilities resolve (e.g. `text-primary`) — verified via computed-style check, not just "no build error".
- [ ] Roboto renders (network tab shows self-hosted font, no fonts.googleapis.com request).
- [ ] `npx tsc --noEmit` exits 0.
- [ ] Unknown path renders NotFoundPage.
- [ ] `npm audit` shows no unresolved high/critical findings; dependency versions pinned in `package.json`.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tailwind v4 API drift (plugin/@theme) | Med | Med | Spike-verify step (above) catches this before 9 more phases build on top; if `@theme` fails, verify tailwindcss v4.x installed. |
| `npm create vite` refuses non-empty dir | Low | Low | Dir has only `.git`/`.gitignore`; use `.` target, confirm overwrite prompt. |
| Router v6 `createBrowserRouter` import path | Low | Low | Use `react-router-dom` (not `react-router`). |
| Unpinned dependency pulls a breaking/compromised version | Low | Med | Pin exact versions after install; `npm audit` gate (red-team fix — Security Adversary finding). |

## Security Considerations
- No auth/secrets. Static SPA. Ensure no `.env` or credentials committed.
- Third-party runtime deps (`embla-carousel-react`, `yet-another-react-lightbox`, `@fontsource/roboto`) are pinned to exact versions and pass `npm audit` before use in later phases.

## Next Steps
- Phase 2 (image download) — needs the `src/assets/images/` folders created here.
