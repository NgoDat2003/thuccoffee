---
phase: 1
title: "Shared shell rebuild"
status: completed
effort: "8h"
priority: P0
---

# Phase 1: Shared shell rebuild

## Context Links

- Gap audit P0 §1-3 + "Style/component fidelity" — `plans/260717-1000-thuccoffee-static-clone/reports/clone-website-gap-audit.md`
- Exact CSS values — `source-website-scout-report.md` §"Visual System" (global tokens, shared layout, template geometry)
- Raw `.footer-ctn` / `.header-ctn` / `.gb-*` rules — `research/site-style.css`

## Overview

**Priority:** P0 (blocker — touches every route). **Status:** completed.

Rebuild the shared shell to match source: footer, desktop header, mobile/tablet header, hero, global design tokens, and the shared atoms (SectionTitle, ProductCard, FloatingOrderButton, Breadcrumb, CookieBanner). This is the first phase because global tokens, header height, and breadcrumb removal change layout on every page — doing it first means phases 2-6 build on the correct baseline.

## Key Insights

- Header height is per-breakpoint: **50px mobile / 82px desktop** — `main` top-padding and hero height both derive from it. Currently `main` hardcodes `pt-[82px]` (`Layout.tsx:11`).
- Nav breakpoint moves from `lg` (1024px) to **768px** for source parity. The prior plan deliberately chose 1024px to avoid nav crowding — so the mega-menu MUST be re-sized to fit 768px or crowding returns (see Risk).
- Source **hides** breadcrumb on product/story/store detail — remove it from those 3 detail pages, don't restyle it.
- Container 1170px + 15px gutter is already correct (`--container-max` in `main.css:11`) — keep.

## Requirements

Functional:
- Footer: 3-col 25/50/25 desktop grid; 35×35 bordered circle social icons (border `#cdcdcd`, hover bg `#0c5278` white); `footer-sep` divider = `icon-coffee.png` centered on a `#ccc` line; nav split into 3 equal columns (links weight 500 / 16px, hover underline); email-subscribe input in right column; add "Đăng Nhập" link; mobile hides top part, keeps only divider + centered copyright (16px, `#292929`).
- Desktop header: logo ~70px (currently `h-12`=48px); nav 16px uppercase, 35px gaps, 3px blue active underline; Menu dropdown = full-width 1170px 4-column mega-menu; separate hotline row above the nav/search row.
- Mobile/tablet header: 50px blue (`#0c5278`) bar, white hamburger + search icons, hidden logo; nav switches to desktop at **768px**; drawer = full-width, starts below the 50px bar, includes Trang chủ + Đăng Nhập + mobile logo + email contact + search control.
- Hero: full-bleed (remove 1170px wrapper + top padding); desktop height = `100vh - 82px`.
- SectionTitle: left-aligned, 24px/500 uppercase blue, subtitle italic 18px.
- ProductCard: image 245px desktop / 180px mobile, ~120px translucent-white info panel, correct name color/hover, price 20px/500 blue, truncation.
- FloatingOrderButton: `icon-delivery.png` in 60×60 circle, bottom 130px right, ring/pulse animation.
- Cookie banner: add "Xem chính sách sử dụng cookie" link → `/chinh-sach`, match alignment.

Non-functional:
- No route may visually regress from the token change — verified in phase 7.
- Keep bundle lean (YAGNI): no animation library for the pulse — CSS keyframes only.

## Architecture

Data flow: design tokens live in `src/styles/main.css` `@theme` and are consumed by every component via Tailwind classes. Header height is the single source that `Layout` main-padding and hero-height read from — express as Tailwind arbitrary values (`pt-[50px] md:pt-[82px]`), not a JS constant (KISS — no runtime measurement).

Component interactions:
- `Layout.tsx` renders Header → main(Outlet) → Footer → CookieBanner → FloatingOrderButton. Only `main` padding + child wrappers change here.
- `Header.tsx` splits into hotline-row + nav/search-row (desktop) and a 50px bar (mobile) that toggles `MobileDrawer`.
- `DesktopNav.tsx` Menu item renders the mega-menu; its category links become real URLs in **phase 2** (this phase only fixes geometry — link `to` stays `/menu` here, phase 2 rewires).

## Related Code Files

Modify:
- `src/styles/main.css:6-12` — add `--color-text:#292929`, page bg `#f5f5f5`, base 16px/24px/400; add `#f5f5f5` body bg + `#292929` text in a base layer.
- `src/components/layout/Layout.tsx:11` — `main` padding `pt-[50px] md:pt-[82px]`.
- `src/components/layout/Header.tsx:13-44` — height per breakpoint, 70px logo, hotline row, 768px switch, mobile blue bar.
- `src/components/layout/DesktopNav.tsx:6-44` — 16px/35px-gap nav, 3px underline, 1170px 4-col mega-menu, switch `lg:` → `md:` (768px).
- `src/components/layout/MobileDrawer.tsx:37-75` — full-width drawer below 50px bar; add Trang chủ, Đăng Nhập, mobile logo, email, search; switch `lg:hidden` → `md:hidden`.
- `src/components/layout/Footer.tsx:6-48` — full 3-col rebuild.
- `src/components/layout/nav-links.ts` — no structural change needed (labels reused by mega-menu); confirm.
- `src/components/layout/CookieBanner.tsx:26-40` — add policy link + alignment.
- `src/components/layout/FloatingOrderButton.tsx:3-12` — icon-in-circle + pulse.
- `src/components/ui/SectionTitle.tsx:6-13` — left-align variant.
- `src/components/ui/ProductCard.tsx:11-27` — sizing + panel + price.
- `src/pages/ProductDetailPage.tsx:31-33`, `src/pages/StoreDetailPage.tsx:24-26`, `src/pages/BlogDetailPage.tsx:27-33` — remove `<Breadcrumb>` usage.

Create: none (all edits to existing files).
Delete: none (`Breadcrumb.tsx` stays — still used elsewhere if any; verify with grep before deleting, likely keep).

Assets to confirm-local (audit says already downloaded): `icon-coffee.png`, `icon-delivery.png`. Grep `src/assets/images` first; if missing, add to a download list.

## Implementation Steps

1. Add global tokens to `main.css`: `--color-text`, base body `background:#f5f5f5; color:#292929; font:400 16px/24px Roboto`. Change section padding convention from `py-10` (40px) to `py-[30px]` — update the shared section wrappers, not every page individually where possible.
2. `Layout.tsx`: set `main` to `pt-[50px] md:pt-[82px]`.
3. `Header.tsx`: build 50px mobile blue bar (hamburger + search white, logo hidden) and desktop 82px white bar with two rows (hotline row, then nav+search row), 70px logo. Switch all `lg:` responsive prefixes to `md:` (768px).
4. `DesktopNav.tsx`: 16px uppercase nav, 35px gaps, 3px blue underline on active; rebuild Menu dropdown as full-width (1170px) 4-column mega-menu that fits at 768px (compact column widths).
5. `MobileDrawer.tsx`: full-width panel below 50px bar; add Trang chủ + Đăng Nhập links, mobile logo, email contact, search control; switch `lg:hidden` → `md:hidden`.
6. `Footer.tsx`: 3-col 25/50/25 grid; circle social icons; coffee divider; 3-column nav; email subscribe; add Đăng Nhập; mobile collapse to divider + centered copyright.
7. Hero: remove Container wrapper + top padding from the home banner section; desktop height `100vh - 82px` (edit `BannerSlider` / `HomePage` where hero is wrapped — verify wrapper location).
8. `SectionTitle.tsx`: left-align, italic 18px subtitle.
9. `ProductCard.tsx`: image `h-[180px] md:h-[245px]`, ~120px info panel, price 20px/500.
10. `FloatingOrderButton.tsx`: `icon-delivery.png` in 60×60 circle, `bottom-[130px] right-6`, CSS pulse ring.
11. Remove `<Breadcrumb>` from ProductDetail / StoreDetail / BlogDetail pages.
12. `CookieBanner.tsx`: add "Xem chính sách sử dụng cookie" → `/chinh-sach`.
13. `npm run build` + `npm run lint` — must pass.

## Todo List

- [x] Global tokens (`#f5f5f5` bg, `#292929` text, 16/24/400, 30px sections)
- [x] Layout main padding per breakpoint
- [x] Desktop header (70px logo, hotline row, 16/35 nav, 3px underline)
- [x] Mega-menu (1170px, 4-col, fits 768px)
- [x] Mobile header (50px blue bar) + full-width drawer w/ new links
- [x] 768px nav switch across Header/DesktopNav/MobileDrawer
- [x] Footer 3-col 25/50/25 + circle icons + coffee divider + subscribe + Đăng Nhập + mobile collapse
- [x] Full-bleed hero, `100vh - 82px`
- [x] SectionTitle left-align; ProductCard sizing/price; FloatingOrderButton icon+circle+pulse
- [x] Remove breadcrumb from 3 detail pages; cookie policy link
- [x] build + lint pass

## Success Criteria

- [x] Footer renders 3 columns at desktop, collapses to divider+copyright at 375px; social icons are 35×35 circles with hover-fill.
- [x] Header is 50px blue bar at 375px, 82px white 2-row at ≥768px; logo ~70px; active nav has 3px blue underline.
- [x] Nav switches at 768px (verify 900px width shows desktop nav, not drawer); mega-menu does not overflow at 768px.
- [x] `main` top gap = 50px mobile / 82px desktop (no content under fixed header).
- [x] Hero is full-bleed edge-to-edge, `100vh - 82px` tall on desktop.
- [x] Breadcrumb absent on product/story/store detail; present nowhere it shouldn't be.
- [x] Body bg `#f5f5f5`, text `#292929`; sections 30px vertical padding.
- [x] `npm run build` + `npm run lint` pass.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **768px nav crowding** (prior plan chose 1024px to avoid it) | High | High | Re-size mega-menu with compact 4-col widths that fit 1140px usable; test at exactly 768px; if crowding persists, shrink nav font/gaps within source tolerance before falling back. Flag explicitly in phase 7. |
| Global token change regresses an unrelated page | Med | High | Phase 7 screenshots all 4 breakpoints × every route family. |
| Removing breadcrumb breaks a page that imported it | Low | Med | Grep `Breadcrumb` usages before removing; keep the component file. |
| Hero full-bleed leaks the Container's negative-margin into siblings | Med | Med | Scope full-bleed to hero wrapper only; verify next section starts at gutter. |

## Security Considerations

None — presentational only. Email-subscribe input is a static shell (no POST) matching source's client-only behavior; do not wire a real endpoint (YAGNI).

## Next Steps

Blocks phases 2-6 (they assume corrected shell). Phase 2 rewires the mega-menu category links built here to real category URLs.
