---
phase: 3
title: data-layer
status: completed
effort: 3h
---

# Phase 3: Data Layer

## Context Links
- Product catalog (42): `research/crawl-report.md` §"Product Catalog"
- Blog (5): `research/crawl-report.md` §"Blog Posts"
- Stores (7): `research/crawl-report.md` §"Store List" (abbreviated addresses) — **full street addresses, phone numbers, store→image mapping, and the contact email (`info.thuccoffee247@gmail.com`) are sourced from `research/homepage.html`** (raw crawled homepage HTML, committed post-review after a code-reviewer finding that this provenance was only in an uncommitted scratchpad — grep for `contact-link email`, `left-item`, `class="address"` in that file to trace).
- Categories (10): `research/crawl-report.md` §"Routes Summary" (menu tabs)

## Overview
- **Priority:** P1 (blocks Phases 5–9)
- **Status:** Pending
- Encode all site content as typed TS modules + an image-path resolver helper. No fetching, no runtime IO.

## Key Insights
- **Blocks Phases 5–9** — every page imports from `src/data`.
- Product slug = full source slug w/ id suffix (e.g. `berry-mango-s1473t2`) → route param `:slug`. Keep verbatim so URLs match source pattern.
- Category is a **tag array** per product (products live in 1–3 categories). Category filter = `products.filter(p => p.categories.includes(cat))`.
- Featured products (home "Top thức uống") = products tagged `yeu-thich-nhat` (take first 8).
- **Some products lack source price** (per `research/crawl-report.md`, currently 9 of 42) → estimate per category range (coffee 35–55k, tea 45–65k, milk-tea ~55k, blended ~55k, cake 39k). Single top-of-file comment notes some prices estimated (no per-item comment, no plan refs). Treat the exact count as whatever the committed `research/crawl-report.md` shows, not a hardcoded assumption (red-team fix — Failure Mode Analyst finding: don't bake "9" into a success criterion as a magic number).
- Blog: title, slug, cover, summary. **No article body in source** → detail page reuses summary (Phase 7 adds one terse code comment).
- Image paths stored as strings resolved via helper (not per-image `import`). Use `import.meta.glob('/src/assets/images/**/*', { eager:true, query:'?url', import:'default' })` map — rejected the alternative of per-image `import` statements in data files: with 92 images referenced by string from hardcoded data objects, manually importing and mapping each one is more code, not less.
- **Store array order (red-team fix — Assumption Destroyer finding):** `stores.ts` entries must be in source page order (same order as `research/crawl-report.md` §"Store List"), matching `categories.ts`'s existing explicit-order treatment — so Phase 5's "default = first" store selection is a deliberate choice, not an artifact of transcription order.

## Requirements
### Functional
- `products.ts` exports 42 typed `Product[]`; `blog.ts` 5 posts; `stores.ts` 7 stores; `categories.ts` 10 ordered categories; `pages.ts` static-page copy.
- `getImageUrl(filename, sub)` helper returns a bundler-resolved URL for any downloaded asset.
- Lookup helpers: `getProductBySlug`, `getRelatedProducts(product, limit=4)`, `getStoreBySlug`, `getBlogBySlug`, `getProductsByCategory`.
### Non-functional
- Strict types; `tsc --noEmit` clean. No runtime errors on missing image (helper returns placeholder + warns).

## Architecture
### Types (`src/data/types.ts`)
```ts
interface Product { name; slug; price: number|null; priceEstimated?: boolean;
  categories: string[]; thumb: string; image?: string; description?: string; }
  // `image` (full-res) is optional — Phase 2 confirmed only 1 of 42 products (berry-mango)
  // has a full-res asset; Phase 6's lightbox must fall back to `thumb` when absent.
interface BlogPost { title; slug; cover; summary; }         // body = summary (source limitation)
interface Store { name; slug; address; phone; image; hours: string; }  // hours "Mở cửa 24/7"
interface Category { key; label; }                          // e.g. {key:'coffee', label:'Coffee'}
```
- **Data flow:** page component → `import { products }` → filter/lookup → render. `thumb`/`image` fields hold filenames; components call `getImageUrl`.
- **Image resolver (`src/lib/image-url.ts`):** builds a filename→URL map via `import.meta.glob` (eager, `?url`) across `src/assets/images/**`. `getImageUrl(filename)` returns mapped URL or `site/` placeholder + `console.warn`. **`console.warn` must be dev-only (red-team fix — Security Adversary finding: conflicts with Phase 10's "no console warnings" success criterion)** — guard with `if (import.meta.env.DEV) console.warn(...)` so a missing-asset warning never ships to the production console.

## Related Code Files
### Create
- `src/data/types.ts` — shared interfaces.
- `src/data/products.ts` — 42 products (name, slug, price, categories, thumb, image; estimated prices flagged).
- `src/data/categories.ts` — 10 categories in sidebar order: san-pham-moi, yeu-thich-nhat, mango-breeze, cold-brew-origins, coffee, non-coffee, tea, milk-tea, blended, cake.
- `src/data/blog.ts` — 5 posts.
- `src/data/stores.ts` — 7 stores (address/phone from crawl; phone default hotline if absent, hours "Mở cửa 24/7").
- `src/data/pages.ts` — static copy: about, membership+FAQ(6), careers(sample jobs), delivery, cookie-policy, contact info. (Original Vietnamese-spirit copy; no fabricated stats/dates.) **Contact block (red-team fix — Security Adversary finding: inventing a specific street address/phone for a real operating company risks impersonation/misinformation):** reuse ONLY the real hotline already sourced from crawl (`1800 6230`) and a generic "TP.HCM, Việt Nam" location — do not invent a specific street address or a second phone number not present in the crawled data.
- `src/data/index.ts` — re-exports + lookup helpers.
- `src/lib/image-url.ts` — `getImageUrl` resolver.

## Implementation Steps
1. `types.ts` — define interfaces above.
2. `products.ts` — transcribe 42 rows. `price` as number (e.g. `59000`) or estimate for the 9 N/A SKUs (mark `priceEstimated:true`). `thumb` = catalog filename; `image` = same minus `thumbs-` prefix. Add top-of-file comment: some prices estimated (source omitted them).
3. `categories.ts` — 10 entries, sidebar order, VN/EN labels matching source tabs (uppercase where source used them, e.g. "SẢN PHẨM MỚI").
4. `blog.ts` — 5 posts (title, slug, cover, summary).
5. `stores.ts` — 7 stores; assign a store photo filename each (from `stores/`), fallback logo if none.
6. `pages.ts` — author membership FAQ (6 Q&A: registration, point redemption, tier conditions, birthday benefit, point expiry, contact), careers (Barista, Store Manager, + 1–2), about story, delivery blurb, cookie policy, contact block (real hotline `1800 6230` + generic "TP.HCM, Việt Nam" only — no invented address/phone). Reasonable, no invented numbers.
7. `image-url.ts` — `import.meta.glob` eager map; `getImageUrl(name)` → URL | placeholder.
8. `index.ts` — helpers: `getProductBySlug`, `getProductsByCategory`, `getRelatedProducts`, `getStoreBySlug`, `getBlogBySlug`, `getFeaturedProducts(8)`.
9. `tsc --noEmit`; write a scratch console log in a page to confirm data resolves + images map (remove after).

## Todo List
- [ ] `types.ts` interfaces
- [ ] `products.ts` (42, missing-price items flagged per crawl data, top comment)
- [ ] `categories.ts` (10 ordered)
- [ ] `blog.ts` (5), `stores.ts` (7)
- [ ] `pages.ts` static copy incl. 6-Q FAQ + sample jobs
- [ ] `image-url.ts` resolver + placeholder
- [ ] `index.ts` lookup helpers
- [ ] `tsc --noEmit` clean; sample data + image resolves

## Success Criteria
- [ ] All 42/5/7/10 records typed and exported; no `any`.
- [ ] `getImageUrl` returns real bundled URL for a known filename; placeholder+warn for unknown.
- [ ] `getRelatedProducts` returns ≤4 same-category items excluding self.
- [ ] `getProductsByCategory('coffee')` returns expected subset.
- [ ] All products lacking a source price carry `priceEstimated:true` (count follows `research/crawl-report.md`, not a hardcoded assumption).

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Estimated prices** (count per `research/crawl-report.md`) diverge from real | High | Low | Flag `priceEstimated`; top comment; use category median. Cosmetic only (no cart). |
| Image filename typo → broken img | Med | Med | Helper warns on miss + placeholder; copy filenames verbatim from crawl table. |
| `import.meta.glob` path base wrong | Med | Med | Use absolute `/src/assets/images/**`; verify one resolved URL in dev. |
| Category with 0 products (empty tab) | Low | Low | Every category has ≥1 product per crawl; empty-state UI handled Phase 6. |

## Security Considerations
- No user input, no secrets. Static content only. Ensure `pages.ts` copy contains no real personal data beyond public store addresses/hotline.

## Next Steps
- Phases 5–9 consume this data. Phase 4 layout also uses `stores`/nav links indirectly.
