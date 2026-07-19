---
phase: 4
title: "Store default-detail and galleries"
status: completed
effort: "4h"
priority: P1
---

# Phase 4: Store default-detail and galleries

## Context Links

- Gap audit P1 §6 (`/cua-hang` wrong template, 30/35 gallery images missing) — `clone-website-gap-audit.md`
- Store template anatomy + 7 branches — `source-website-scout-report.md` §Stores + §Template geometry
- Store gallery assets — `source-full-media-manifest.json` (35 assets whose `sampleSourceRoutes` include `/cua-hang/`; 5/store × 7)
- Current stores (single image each) — `src/data/stores.ts:5-62`
- Download script pattern — `scripts/download-images.sh`

## Overview

**Priority:** P1. **Status:** completed. **Depends on:** phase 1.

Source `/cua-hang` is **not a grid** — it renders the first store's (40D Lý Tự Trọng) detail with a 7-branch selector. Clone shows a 7-card grid (`StoreListPage.tsx:13-19`). Each store detail currently uses one representative image; source has ~5 route-specific images/store (35 total). This phase: make `/cua-hang` render the default store detail, give each store its real multi-image gallery (download the 35 assets), and add a mixed-ratio gallery + lightbox + branch selector.

## Key Insights

- Manifest confirms **35 store-route assets** (verified: 5 per store × 7). Sample: `http://www.thuccoffee.com.vn/s-media/1d90946a_5.png` (1080×1080, 206 OK, `sampleSourceRoutes: [.../thuc-coffee-320-nguyen-thai-son-s106t2/]`).
- `/cua-hang` = the 40D detail view (default selected), duplicating that detail's content — NOT a separate index template.
- Store detail geometry: 620px gallery + 520px map desktop, four-column branch selector; 345px gallery/map mobile, one branch/row (`source-website-scout-report.md` §Template geometry).
- `Store` type (`types.ts:21-28`) has single `image: string` — add `gallery: string[]`.
- Breadcrumb already removed from store detail in phase 1.
- Second origin download pass (this phase + phase 5) — reuse hardened `download-images.sh` over `http://` with HEAD pre-flight + Content-Type gate + hard-fail.

## Requirements

Functional:
- `/cua-hang` renders the 40D default-store detail with the 7-branch selector (not a grid).
- Each of 7 stores has a real ~5-image gallery.
- Gallery is mixed-ratio + opens a lightbox.
- Branch selector switches between the 7 store detail views (links to `/cua-hang/{slug}`).
- Map + name + address + phone retained per store.

Non-functional:
- Download step: hardened script, atomic tmp+rename, Content-Type gate, hard-fail exit (reuse existing).

## Architecture

Data flow: manifest → filtered download list (35 store assets) → `scripts/download-images.sh` → `src/assets/images/stores/` → `stores.ts` `gallery` arrays → `StoreDetailPage` gallery + lightbox.

Route change: `/cua-hang` (`routes.tsx:30`) element becomes the default-store detail (render `StoreDetailPage` with the first store, or redirect logic that selects 40D). Simplest (KISS): `StoreListPage` becomes a thin wrapper that renders the same detail component as `/cua-hang/:slug` but with the default store — so the shared `StoreDetail` view is reused (DRY), driven by either the route param or the default.

Component interactions:
- Extract the store-detail body into a shared component consumed by both `/cua-hang` (default=40D) and `/cua-hang/:slug`.
- Branch selector renders 7 `<Link to={/cua-hang/{slug}}>` entries, highlighting active.
- Gallery + lightbox reuse the existing lightbox lib already used by products (`yet-another-react-lightbox`, seen in `ProductDetailPage.tsx:3`).

## Related Code Files

Create:
- `scripts/store-gallery-image-urls.txt` — tab-separated `path\tstores` list of the 35 store `/s-media/...` asset paths (derive from manifest).
- `src/components/store/BranchSelector.tsx` — 7-branch selector (links + active state).
- `src/components/store/StoreGallery.tsx` — mixed-ratio gallery + lightbox (if `StoreDetailPage` would exceed 200 lines otherwise).

Modify:
- `src/data/types.ts:21-28` — add `gallery: string[]` to `Store`.
- `src/data/stores.ts:5-62` — add `gallery` arrays (5 filenames each) from downloaded assets.
- `src/pages/StoreListPage.tsx:7-20` — render default 40D store detail + selector (not a grid).
- `src/pages/StoreDetailPage.tsx:22-56` — use gallery + lightbox + branch selector; breadcrumb already removed.
- `scripts/download-images.sh` — reuse as-is; point at the new URL list (or add a `stores` sub-list). Confirm the `stores` dest sub-dir exists (script line 40 creates it).

## Implementation Steps

1. From `source-full-media-manifest.json`, filter the 35 assets whose `sampleSourceRoutes` include `/cua-hang/`; map each to its store slug; build `store-gallery-image-urls.txt` (path → `stores`).
2. Run the download script against that list — HEAD pre-flight must pass, Content-Type gate + hard-fail on any bad asset. Verify 35 files land in `src/assets/images/stores/`.
3. Add `gallery: string[]` to `Store`; populate 5 filenames per store in `stores.ts`.
4. Extract a shared `StoreDetail` body; `StoreListPage` renders it with default 40D, `StoreDetailPage` with the routed store.
5. Build `BranchSelector` (7 links, active highlight) + `StoreGallery` (mixed-ratio + lightbox).
6. Verify `/cua-hang` shows 40D detail + selector; each `/cua-hang/{slug}` shows its gallery; lightbox opens/cycles. `npm run build` + `npm run lint`.

## Todo List

- [x] Filter 35 store assets from manifest → `store-gallery-image-urls.txt`
- [x] Run hardened download; verify 35 files, valid image mime
- [x] `Store.gallery` field + 5 images/store in `stores.ts`
- [x] Shared `StoreDetail` body (DRY) used by `/cua-hang` + `/cua-hang/:slug`
- [x] `BranchSelector` + `StoreGallery` (mixed-ratio + lightbox)
- [x] `/cua-hang` = 40D default detail (not grid)
- [x] build + lint

## Success Criteria

- [x] `/cua-hang` renders the 40D default-store detail with a 7-branch selector (no grid).
- [x] All 7 stores have a working ~5-image mixed-ratio gallery + lightbox.
- [x] Branch selector switches between all 7 store detail views.
- [x] 35 store gallery images downloaded, valid image mime, referenced by code.
- [x] build + lint pass.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Origin down / drift on second download pass (broken HTTPS cert) | Med | High | Reuse hardened script over `http://`: HEAD pre-flight aborts if >5 fail; Content-Type gate + 0-byte reject; hard-fail exit before wiring. |
| Wrong asset→store mapping (5 imgs to wrong branch) | Med | Med | Map strictly by `sampleSourceRoutes` slug from manifest; spot-check one image per store visually in phase 7. |
| Shared-detail refactor breaks `/cua-hang/:slug` | Low | Med | Extract carefully; verify both entry points render before moving on. |

## Security Considerations

None beyond download hygiene (Content-Type gate prevents non-image payloads from entering the build).

## Next Steps

Independent of phases 2, 3, 5, 6. Feeds phase 7 route-parity check (`/cua-hang` + 7 store slugs).
