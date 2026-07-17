---
phase: 4
title: "shared-layout-components"
status: pending
effort: "3h"
---

# Phase 4: Shared Layout Components

## Context Links
- Header/footer/nav requirements: task brief §"Shared layout requirements"
- Social URLs: FB https://www.facebook.com/ThucCoffee247, IG https://www.instagram.com/thuccoffee24h/, YouTube "#"
- Skeletons from Phase 1 (`Layout`, `Header`, `Footer`, `Container`).

## Overview
- **Priority:** P1 (blocks Phases 5–9 — every route renders inside Layout)
- **Status:** Pending
- Build full Header (nav + mobile drawer), Footer, cookie consent banner, floating order button. Replace Phase 1 skeletons.

## Key Insights
- Header `fixed`, h-82px, white bg. `<main>` already has `pt-[82px]` (Phase 1). NO dummy-scroll hack.
- Desktop nav links: Menu (dropdown affordance), Chuyện của Thức, Về chúng tôi, Cửa hàng, Chính sách thành viên, Tuyển Dụng, Liên Hệ. Hotline "1800 6230" as `tel:18006230`.
- Menu dropdown lists the 10 categories → links to `/menu` (or `/menu?cat=` — but Menu page uses internal tab state, so dropdown items can deep-link via `/menu` + state; simplest: dropdown links to `/menu`, selection handled on page). Keep dropdown affordance visual; full category deep-link optional (planner: link all to `/menu`, page defaults to first tab).
- Search icon: **cut per red-team review (Scope Critic finding — a non-functional search that "does nothing" on submit reads as broken, not demo).** Render the icon as a static/decorative element only, no click handler, no overlay component. Saves an interactive stub with zero payoff.
- Mobile: hamburger → drawer with same nav links + social icons + hotline. **Email subscribe input dropped from Drawer/Footer per red-team review** (Scope Critic finding — a silent no-op input is worse UX than omitting it, and inconsistent with the toast-confirmed pattern used by the real `ContactForm` in Phase 9).
- Cookie banner: fixed bottom, "Chấp nhận & Đóng" dismiss → write `localStorage.thuc_cookie_ok=1`; don't render if set.
- Floating "Đặt hàng" button: fixed bottom-right, links `/delivery`.
- Do NOT implement FB Messenger chat plugin.
- **Shared UI atoms owned here, not in Phase 5/6 (red-team fix — Failure Mode + Scope Critic reviewers independently found a file-ownership race: Phase 5 created `ProductCard`/`SectionTitle`, Phase 6 created `Breadcrumb`, while Phases 6-9 all listed these as "Reuse" despite the plan's own claim that Phases 5-9 are parallel-safe with disjoint ownership. Single source of truth = Phase 4, which is already a hard blocker of 5-9.):**
  - `src/components/ui/ProductCard.tsx` — img (245px h, radius 5px), name (uppercase, primary), price. Used by Phases 5, 6.
  - `src/components/ui/SectionTitle.tsx` — uppercase heading, primary color. Used by Phases 5, 6, 7, 8, 9.
  - `src/components/ui/Breadcrumb.tsx` — generic `items:{label,to?}[]` trail. Used by Phases 6, 7, 8.
- **Global security constraint (red-team fix — Security Adversary reviewer flagged reflected-XSS risk if a later phase "improves UX" by echoing raw user input into a toast/success message):** no UI-only form anywhere in the app (search — cut above, newsletter — cut above, contact form Phase 9, login Phase 9) may render a user-typed value back into markup. Success/confirmation messages are static strings only, never interpolated with form field values. No `dangerouslySetInnerHTML` anywhere in the app.

## Requirements
### Functional
- Header renders on all routes; active link highlighted (primary color) via `NavLink isActive`.
- Mobile drawer opens/closes; body scroll locked while open; closes on route change + backdrop click.
- Cookie banner shows once; stays dismissed across reloads (localStorage).
- Floating button navigates to `/delivery`.
### Non-functional
- Keyboard accessible (Esc closes drawer/search overlay); focus not trapped permanently. Responsive < 768px switches to hamburger.

## Architecture
### Components (`src/components/layout/`)
- `Layout.tsx` — Header + `<main pt-[82px]><Outlet/></main>` + Footer + CookieBanner + FloatingOrderButton.
- `Header.tsx` — logo (link `/`), `DesktopNav`, hotline, decorative search icon (no handler), hamburger (mobile).
- `DesktopNav.tsx` — `NavLink` list + Menu dropdown (hover/click, lists categories).
- `MobileDrawer.tsx` — off-canvas nav; controlled by Header state; nav links + socials + hotline (no subscribe input).
- `Footer.tsx` — "THỨC COFFEE - OPEN 24/7 / Hotline: 1800 6230", social icons (real URLs), nav links, "© 2018. All Right Reserved. Thức Coffee" (no subscribe input).
- `CookieBanner.tsx` — localStorage-gated bottom bar.
- `FloatingOrderButton.tsx` — fixed bottom-right link to `/delivery`.
- **State:** all UI state local (`useState`) per component instance. Layout is rendered once (single Router root) → drawer/banner state is app-lifetime singleton, no isolation concern.
- **Data flow:** nav link list = a small local `NAV_LINKS` const; categories from `src/data/categories.ts`; social URLs const in Footer/Drawer.

## Related Code Files
### Create
- `src/components/layout/DesktopNav.tsx`, `MobileDrawer.tsx`, `CookieBanner.tsx`, `FloatingOrderButton.tsx`
- `src/components/layout/nav-links.ts` — shared `NAV_LINKS` + social URL consts.
- `src/components/ui/Icon.tsx` (optional) — inline SVG icons (hamburger, search [decorative], FB/IG/YT, phone, close).
- `src/components/ui/ProductCard.tsx`, `SectionTitle.tsx`, `Breadcrumb.tsx` — shared atoms, moved here from Phases 5/6 (see Key Insights).
### Modify
- `src/components/layout/Layout.tsx` — add CookieBanner + FloatingOrderButton.
- `src/components/layout/Header.tsx` — full build (replace skeleton).
- `src/components/layout/Footer.tsx` — full build (replace skeleton).

## Implementation Steps
1. `nav-links.ts` — export `NAV_LINKS` (label, to) + `SOCIAL_LINKS`.
2. `Header.tsx` — fixed bar: logo left (`getImageUrl` logo), `DesktopNav` right (hidden < md), hotline, decorative search icon (no handler), hamburger (shown < md). Wire `drawerOpen` state only.
3. `DesktopNav.tsx` — `NavLink`s; active class `text-primary font-bold`. Menu item = button/hover panel listing categories → each links `/menu`.
4. `MobileDrawer.tsx` — slide-in panel + backdrop; nav links, hotline, social icons (no subscribe input). Lock body scroll when open; close on `NavLink` click, backdrop, Esc.
5. `Footer.tsx` — heading, socials (real URLs, YouTube "#"), nav links repeated, copyright line verbatim (no subscribe input).
6. `CookieBanner.tsx` — `useState(()=>!localStorage.getItem('thuc_cookie_ok'))`; accept → set flag + hide.
7. `FloatingOrderButton.tsx` — fixed bottom-right, `Link to="/delivery"`, "Đặt hàng".
8. `ProductCard.tsx` — link wrap, `getImageUrl(product.thumb)`, name uppercase `text-primary`, price via `formatPrice` (add util in `src/lib/format.ts`).
9. `SectionTitle.tsx` — uppercase, primary, centered w/ optional subtitle.
10. `Breadcrumb.tsx` — `items:{label,to?}[]` trail, last item non-link.
11. `Layout.tsx` — compose Header/Footer/CookieBanner/FloatingOrderButton; verify on every route via click-through.
12. Responsive check at 375 / 768 / 1280; `tsc --noEmit`.

## Todo List
- [ ] `nav-links.ts` (links + socials)
- [ ] Full `Header` + `DesktopNav` + Menu dropdown (search icon decorative only)
- [ ] `MobileDrawer` (scroll-lock, Esc, route-change close, no subscribe input)
- [ ] Full `Footer` (real socials, copyright verbatim, no subscribe input)
- [ ] `CookieBanner` (localStorage-gated)
- [ ] `FloatingOrderButton` → /delivery
- [ ] `ProductCard`, `SectionTitle`, `Breadcrumb` (shared atoms, `formatPrice` util)
- [ ] Compose in `Layout`; responsive + tsc clean

## Success Criteria
- [ ] Header/Footer visible on all 14 routes + 404.
- [ ] Active nav link highlighted per current route.
- [ ] Mobile drawer opens/closes, locks scroll, closes on navigation.
- [ ] Cookie banner dismissed permanently after accept (survives reload).
- [ ] Floating button routes to `/delivery`.
- [ ] Social icons link to real FB/IG URLs.
- [ ] No FB Messenger plugin present.
- [ ] `ProductCard`, `SectionTitle`, `Breadcrumb` exist and are importable before Phase 5 starts.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Drawer body-scroll-lock leaks (stays locked) | Med | Med | Cleanup in `useEffect` return; also unlock on unmount/route change. |
| Fixed header overlaps content on some route | Low | Med | `pt-[82px]` on main verified Phase 1; anchor-scroll offset if in-page anchors added. |
| localStorage unavailable (privacy mode) | Low | Low | try/catch; banner just re-shows — acceptable degradation. |

## Security Considerations
- `tel:` link only. No form submission anywhere in this phase (search is decorative, subscribe cut). No XSS surface (no user-rendered HTML). External social links use `rel="noopener noreferrer" target="_blank"`.
- Global constraint for the whole app (enforced starting here, applies to Phase 9's contact/login forms too): no user-typed value is ever echoed into rendered markup; no `dangerouslySetInnerHTML`.

## Next Steps
- Phases 5–9 render page content inside this Layout, and consume `ProductCard`/`SectionTitle`/`Breadcrumb` from here — no phase after this one creates them.
