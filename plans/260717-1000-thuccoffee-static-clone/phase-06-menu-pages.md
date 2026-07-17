---
phase: 6
title: "menu-pages"
status: pending
effort: "3h"
---

# Phase 6: Menu Pages

## Context Links
- Menu index + category tabs: task brief route #2
- Product detail: task brief route #3 + `research/crawl-report.md` §"Product Detail Page Fields"
- Data: `products.ts`, `categories.ts`; helpers `getProductsByCategory`, `getProductBySlug`, `getRelatedProducts`

## Overview
- **Priority:** P1
- **Status:** Pending
- Build `/menu` (category sidebar/dropdown + filtered grid) and `/menu/:slug` (product detail + related).

## Key Insights
- 10 categories in `categories.ts` order. Left sidebar tabs (desktop) / dropdown (mobile). Right = product grid filtered by active category.
- Active category = local `useState` (default first, `san-pham-moi`). No URL param required (source used client filter); optional `?cat=` sync is nice-to-have, keep simple with state.
- Product detail: breadcrumb (Home > Menu > NAME), title, short description, price, full-res image (lightbox), related 4 (`getRelatedProducts`), CTA `tel:18006230` "Order xin gọi: 1800 6230", "Trở Lại" back button (`navigate(-1)`).
- Full-res image = `product.image`; **thumbnail fallback is the norm, not an edge case** — Phase 2 confirmed only 1 of 42 products (berry-mango) has a full-res asset downloaded, so the lightbox will show `product.thumb` for 41 of 42 products by default. `product.image` is optional (Phase 3).
- Reuses `ProductCard`, `SectionTitle`, `Breadcrumb`, `Container` (Phase 4), lightbox (Phase 5).
- **Slug sanitization (red-team fix — Assumption Destroyer finding):** Phase 3 applies the same slug-cleanup pass to `products.ts` that Phase 7 applies to `blog.ts` (strip/encode non-ASCII, no raw emoji in any of the 42 product slugs) — do not assume product slugs are "clean" just because blog slugs needed sanitizing.

## Requirements
### Functional
- Selecting a category updates grid without route change; grid links to detail.
- Detail page: correct product by `:slug`; unknown slug → NotFound/redirect; related grid excludes current; back button works; lightbox opens full-res.
### Non-functional
- Responsive: sidebar collapses to dropdown < 768px; grid 4/2 col.

## Architecture
### Components
- `src/pages/MenuPage.tsx` — layout: `CategorySidebar` + product grid. `useState(activeCat)`.
- `src/components/menu/CategorySidebar.tsx` — desktop vertical tabs; active highlighted (primary).
- `src/components/menu/CategoryDropdown.tsx` — mobile `<select>`/custom dropdown; same options.
- `src/pages/ProductDetailPage.tsx` — `useParams().slug` → `getProductBySlug`; renders detail + `RelatedProducts`.
- `src/components/menu/RelatedProducts.tsx` — "Sản phẩm cùng danh mục", 4 `ProductCard`.
- **Data flow:** MenuPage: `getProductsByCategory(activeCat)` → grid. DetailPage: slug → product → related. Lightbox open index = local state.

## Related Code Files
### Create
- `src/pages/MenuPage.tsx` (replace stub), `src/pages/ProductDetailPage.tsx` (replace stub)
- `src/components/menu/CategorySidebar.tsx`, `CategoryDropdown.tsx`, `RelatedProducts.tsx`
### Reuse
- `ProductCard`, `SectionTitle`, `Breadcrumb`, `Container`, lightbox, `formatPrice` (Phase 4/5).

## Implementation Steps
1. `MenuPage` — `activeCat` state; `CategorySidebar` (md+) / `CategoryDropdown` (mobile); grid = `getProductsByCategory(activeCat).map(ProductCard)`. Empty-state message if none.
2. `CategorySidebar` — vertical list from `categories`; active item primary bg/text; click sets state.
3. `CategoryDropdown` — mobile control mirroring sidebar.
4. `ProductDetailPage` — resolve slug; if missing → `<Navigate to="/menu"/>` or NotFound. Render `Breadcrumb` (Phase 4), `<h1>` uppercase, description, `formatPrice(price)` (show "Liên hệ"/estimated note if null — but all filled in Phase 3), full-res image opening lightbox, CTA `tel:` link, `RelatedProducts`, "Trở Lại" (`useNavigate()(-1)`).
5. `RelatedProducts` — `getRelatedProducts(product,4)` grid.
6. Quick mobile sanity check (~375px, not the full sweep — Phase 10 owns that) + `tsc --noEmit`. Click sample product from each category.

## Todo List
- [ ] `MenuPage` + category state + filtered grid
- [ ] `CategorySidebar` (desktop) + `CategoryDropdown` (mobile)
- [ ] `ProductDetailPage` (breadcrumb, price, lightbox, CTA, back)
- [ ] `RelatedProducts` (4 same-category)
- [ ] Unknown-slug handling + responsive + tsc clean

## Success Criteria
- [ ] All 10 categories selectable; grid filters correctly.
- [ ] Every product detail resolves by its source slug (e.g. `/menu/berry-mango-s1473t2`).
- [ ] Related shows ≤4 same-category, excludes self.
- [ ] Full-res image opens in lightbox.
- [ ] CTA is `tel:18006230`; back button navigates back.
- [ ] Unknown slug handled gracefully (no crash).

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Slug mismatch data vs route param | Med | High | Store slug verbatim from crawl (Phase 3); test one product per category. |
| Category w/ <4 products → related short | Med | Low | Show available (≤4); acceptable, matches source behavior. |
| Most products show thumb (not full-res) in lightbox (41 of 42 — confirmed, not hypothetical) | Confirmed | Low | Fallback `product.thumb` in lightbox; acceptable for a demo clone, thumbs are reasonably sized (see Phase 2). |
| Missing price on some SKUs (count per `research/crawl-report.md`) | Med | Low | Filled with estimate Phase 3; detail always shows a price. |

## Security Considerations
- `:slug` used only for lookup (no eval/DOM injection). `tel:` link only. No user input persisted.

## Next Steps
- Phase 10 QA verifies deep-linking to product pages.
