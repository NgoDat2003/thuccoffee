---
phase: 2
title: "Menu category deep-links"
status: completed
effort: "3h"
priority: P1
---

# Phase 2: Menu category deep-links

## Context Links

- Gap audit P1 §4 (0/10 category deep-links work) — `clone-website-gap-audit.md`
- Working categories + exact IDs — `source-website-scout-report.md` §Menu
- Category data already present — `src/data/categories.ts:3-14`

## Overview

**Priority:** P1. **Status:** completed. **Depends on:** phase 1.

Source has 10 working category deep-links (e.g. `/menu/coffee-t1p1s494/`) that render the menu filtered to that category. Clone declares only `/menu` and `/menu/:slug` — category URLs are swallowed by `:slug` (treated as a product), lookup fails, redirect to `/menu`. Add real category routes matching the source pattern so deep-links genuinely work, and rewire the sidebar/dropdown/mega-menu links from all-pointing-`/menu` to their real category URL.

## Key Insights

- User decision (locked): replicate the **exact source pattern** `/menu/{slug}-t1p1s{id}`, NOT a clean slug-only route — the audit's own success metric is that source deep-links resolve.
- Category→id map (from scout report): `san-pham-moi-t5p1s549`, `yeu-thich-nhat-t5p1s548`, `mango-breeze-t1p1s1470`, `cold-brew-origins-t1p1s1408`, `coffee-t1p1s494`, `non-coffee-t1p1s138`, `tea-t1p1s123`, `milk-tea-t1p1s139`, `blended-t1p1s119`, `cake-t1p1s136`.
- **Disambiguation is the hazard.** Product detail paths end `-s{id}t2` (e.g. `americano-s153t2`, `products.ts:8`); category paths contain `-t{n}p{n}s{id}` with no trailing `t2` (e.g. `coffee-t1p1s494`). Both live under `/menu/:slug`, so a single param can't statically separate them — resolve at the component/loader level.
- `MenuPage` currently keeps category in `useState('san-pham-moi')` (`MenuPage.tsx:12`) — must instead derive the active category from the URL param when present, defaulting to `san-pham-moi` for bare `/menu`.

## Requirements

Functional:
- `/menu` (bare) → menu listing defaulted to `san-pham-moi` (unchanged).
- `/menu/coffee-t1p1s494` (+9 others) → menu filtered to that category, returns content (not redirect).
- `/menu/americano-s153t2` (+41 others) → product detail (unchanged).
- Sidebar, mobile dropdown, and desktop mega-menu category items link to the real category URLs.

Non-functional:
- One disambiguation rule, documented in code (DRY) — no duplicated regex scattered across files.

## Architecture

Data flow: URL slug → disambiguation helper → either category-key (→ `MenuPage` filter) or product lookup (→ `ProductDetailPage`).

**Recommended (Option B — data-driven, KISS):** build `category-paths.ts` mapping category key → full path suffix. Keep the single `menu/:slug` route pointed at a small dispatcher: if slug is an exact match against the 10 known category paths → render `MenuPage` filtered; else → `ProductDetailPage`. Exact-match against known paths avoids regex fragility and future product-slug collisions. The same map feeds the nav links (single source, DRY).

(Option A — regex `/-t\d+p\d+s\d+$/` branch — is viable but riskier: a future product slug could match. Rejected in favor of exact-map.)

Component interactions:
- `routes.tsx:26` `menu/:slug` element becomes the dispatcher.
- `CategorySidebar` / `CategoryDropdown` / mega-menu render `<Link to={categoryPath}>` from the map. Bare `/menu` keeps client-side `onSelect` switching so the default view still toggles without navigation.

## Related Code Files

Create:
- `src/data/category-paths.ts` — map category key → source path suffix (`coffee` → `coffee-t1p1s494`, etc.); export `isCategoryPath(slug)` and `categoryKeyFromPath(slug)`.

Modify:
- `src/routes.tsx:26` — `menu/:slug` → dispatcher element.
- `src/pages/MenuPage.tsx:12-13` — derive active category from URL param via map, `san-pham-moi` default; keep client switching for bare `/menu`.
- `src/pages/ProductDetailPage.tsx:18` — unchanged lookup; only reached when slug is not a category path.
- `src/components/menu/CategorySidebar.tsx:11-23` — link items to category paths.
- `src/components/menu/CategoryDropdown.tsx` — same.
- `src/components/layout/DesktopNav.tsx:20-28` — mega-menu items link to real category paths (built in phase 1).
- `src/data/index.ts:8` — re-export new helpers.

## Implementation Steps

1. Create `category-paths.ts` with the 10 key→path entries + `isCategoryPath` / `categoryKeyFromPath`. Comment that the `-t{n}p{n}s{id}` suffix mirrors source and is intentionally opaque.
2. In the `/menu/:slug` dispatcher: if `isCategoryPath(slug)` → menu filtered to `categoryKeyFromPath(slug)`; else → product detail.
3. `MenuPage`: read resolved category from URL when present, else default `san-pham-moi`. Keep in-page switching for bare `/menu`.
4. Rewire `CategorySidebar`, `CategoryDropdown`, phase-1 mega-menu to link to the category paths.
5. Verify `/menu/coffee-t1p1s494` renders 12 coffee cards; `/menu/americano-s153t2` still renders the product; `/menu` defaults to san-pham-moi.
6. `npm run build` + `npm run lint`.

## Todo List

- [x] `category-paths.ts` map + `isCategoryPath` / `categoryKeyFromPath`
- [x] Dispatcher in `/menu/:slug`
- [x] `MenuPage` derives category from URL, defaults san-pham-moi
- [x] Sidebar/dropdown/mega-menu link to real category URLs
- [x] Verify 10 category URLs + 42 product URLs + bare `/menu`
- [x] build + lint

## Success Criteria

- [x] All 10 category deep-links render filtered content (not redirect to `/menu`).
- [x] All 42 product detail slugs still resolve to product pages.
- [x] Bare `/menu` still defaults to `san-pham-moi`.
- [x] Category nav items across sidebar/dropdown/mega-menu point to the real URLs.
- [x] build + lint pass.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Category vs product slug collision breaks product pages | Med | High | Exact-match against the known 10 category paths (Option B), not a loose regex; verify both a category path and a product path resolve correctly. |
| Future product slug accidentally matches category pattern | Low | Med | Exact-map lookup means only the 10 declared paths are categories; anything else is a product. |
| `MenuPage` state vs URL desync (bare `/menu` clicks vs deep-link) | Med | Low | Keep bare-`/menu` client switching; deep-link items navigate. Document the two paths. |

## Security Considerations

None — read-only routing/filtering on static data.

## Next Steps

Independent of phases 3-6. Phase 7 verifies all 10 category routes return content.
