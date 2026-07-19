---
phase: 5
title: "Product data enrichment"
status: completed
effort: "3h"
priority: P1
---

# Phase 5: Product data enrichment

## Context Links

- Gap audit P1 §5 (0/42 descriptions, 41/42 use thumbnails not full-res) — `clone-website-gap-audit.md`
- Product detail anatomy — `source-website-scout-report.md` §Menu
- Product full-res assets — `source-full-media-manifest.json` (87 menu-route assets; full-res = the non-`thumbs-` variants)
- Current products — `src/data/products.ts` (thumbs use `thumbs-{hash}_{name}` prefix; only Berry Mango has `image`, line 19)
- Download script — `scripts/download-images.sh`

## Overview

**Priority:** P1. **Status:** completed. **Depends on:** phase 1.

Add product descriptions where the source has them (from crawled product-detail text), and download the ~41 missing full-resolution product images so the detail lightbox shows real full-res instead of a scaled 450×450 thumbnail. Currently only Berry Mango has a full-res `image` (`products.ts:19`); the other 41 fall back to `thumb` (`ProductDetailPage.tsx:27`).

## Key Insights

- Thumb naming convention: `thumbs-{hash}_{name}.ext`; the full-res variant drops the `thumbs-` prefix → `{hash}_{name}.ext` (confirmed by Berry Mango: thumb `thumbs-847b9f4d_berry-mango.jpg`, image `847b9f4d_berry-mango.jpg`, `products.ts:18-19`). This gives a deterministic thumb→full-res filename mapping for the download list.
- Manifest has 87 menu-route assets; the actionable subset is the ~41 full-res primaries not yet local. White Coffee needs a bespoke filename mapping (audit §"Gap ảnh cụ thể").
- `Product` type already has optional `image?` and `description?` (`types.ts:8-10`) — no type change needed.
- Descriptions exist only where the crawled product-detail page has body text — do NOT fabricate for products without source text (leave `description` undefined; UI already conditionally renders, `ProductDetailPage.tsx:46`).
- Second origin download pass — reuse hardened `download-images.sh` (HEAD pre-flight, Content-Type gate, hard-fail). Can share the run with phase 4 or run separately.

## Requirements

Functional:
- Products with source description text get `description` populated (verbatim from crawl).
- ~41 full-res product images downloaded; each product's `image` field points to its full-res file.
- Product detail lightbox shows full-res (not the thumbnail).

Non-functional:
- No fabricated descriptions; no fabricated prices (the 10 estimated prices stay `priceEstimated:true`, `products.ts:25` pattern — unchanged).
- Download hygiene: Content-Type gate + hard-fail.

## Architecture

Data flow: `products.ts` thumbs → derive full-res filenames (strip `thumbs-`) → cross-check against manifest 200/206 status → download list → `download-images.sh` → `src/assets/images/products/` → set `image` on each product. Descriptions: crawl JSON product pages → `products.ts` `description`.

Component interactions: `ProductDetailPage.tsx:27` (`fullImage = product.image ?? product.thumb`) already prefers `image` — populating `image` is enough for full-res to show in both the main view and lightbox slide (`ProductDetailPage.tsx:74`). No component change strictly required; verify.

## Related Code Files

Create:
- `scripts/product-fullres-image-urls.txt` — tab-separated path→`products` list of the ~41 full-res `/s-media/{hash}_{name}` asset paths (derive by stripping `thumbs-` from each product's thumb, cross-checked against the manifest for a healthy status).

Modify:
- `src/data/products.ts` — add `image` (full-res filename) to the 41 products missing it; add `description` where crawl has source text.
- `scripts/download-images.sh` — reuse; point at the new URL list (or append to a combined run with phase 4).
- `src/pages/ProductDetailPage.tsx:27,74` — verify full-res flows to main image + lightbox (likely no change).

Note White Coffee's bespoke filename — resolve its mapping explicitly (audit flagged it).

## Implementation Steps

1. For each of the 42 products, derive the full-res filename by stripping `thumbs-` from `thumb`. Cross-check each against `source-full-media-manifest.json` for a healthy (200/206, non-broken) status.
2. Resolve White Coffee's bespoke mapping (its full-res filename differs from the strip-prefix rule) using the manifest.
3. Build `product-fullres-image-urls.txt` for the ~41 not-yet-local full-res primaries.
4. Run the hardened download script — HEAD pre-flight, Content-Type gate, hard-fail. Verify files land in `src/assets/images/products/`.
5. Set `image` on all 41 products in `products.ts`.
6. From the crawl JSON product-detail pages, add `description` (verbatim) to products that have source body text; leave others undefined.
7. Verify product detail shows full-res in main view + lightbox; descriptions render where present. `npm run build` + `npm run lint`.

## Todo List

- [x] Derive full-res filenames (strip `thumbs-`) + cross-check manifest
- [x] Resolve White Coffee bespoke mapping
- [x] `product-fullres-image-urls.txt` (~41 assets)
- [x] Run hardened download; verify valid image mime
- [x] Set `image` on 41 products
- [x] Add `description` where crawl has source text (no fabrication)
- [x] Verify lightbox full-res + descriptions; build + lint

## Success Criteria

- [x] ~41 full-res product images downloaded, valid image mime, referenced by code.
- [x] Every product detail main image + lightbox shows full-res (not the 450×450 thumb).
- [x] Products with source descriptions display them; products without have none (no fabrication).
- [x] Estimated prices unchanged (`priceEstimated` preserved).
- [x] build + lint pass.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Strip-`thumbs-` rule wrong for some products (e.g. White Coffee) | Med | Med | Cross-check every derived filename against the manifest before download; handle White Coffee explicitly. |
| Origin drift on the download pass | Med | High | Hardened script: HEAD pre-flight aborts if >5 fail; Content-Type gate + hard-fail. |
| Tempted to fabricate descriptions for products lacking source text | Low | Med | Rule: only verbatim crawl text; leave undefined otherwise (UI already conditional). |

## Security Considerations

Download hygiene only (Content-Type gate blocks non-image payloads).

## Next Steps

Independent of phases 2, 3, 4, 6. Feeds phase 7 (verify full-res + cleanup of now-unused thumbs if any become orphaned).
