---
phase: 5
title: home-page
status: completed
effort: 3h
---

# Phase 5: Home Page

## Context Links
- Section list: task brief route #1
- Data: `src/data/products.ts`, `blog.ts`, `stores.ts` (Phase 3)
- Libs: `embla-carousel-react` (sliders), `yet-another-react-lightbox` (gallery)

## Overview
- **Priority:** P1
- **Status:** Pending
- Build `/` with 6 sections: banner slider, featured products, promo banner, blog carousel, store master-detail, gallery lightbox.

## Key Insights
- Reuses shared `ProductCard`, `SectionTitle`, `Container` — **created in Phase 4** (moved there per red-team review to fix a file-ownership race between "parallel-safe" Phases 5/6; do not recreate here).
- Banner slider = 2 images (embla, autoplay optional, dots/arrows). Blog carousel = 5 posts (embla, multi-slide responsive).
- Store master-detail: 7 store names listed (right); clicking a name updates the left panel (image + address). Local `selectedStore` state; default = first. Teal-blue bg (`bg-accent`).
- Gallery grid → click opens `yet-another-react-lightbox` with the full-res image set.
- Featured = `getFeaturedProducts(8)` (`yeu-thich-nhat`-tagged).

## Requirements
### Functional
- Banner auto/manual advances; blog carousel scrolls; store selector swaps left panel; gallery images open in lightbox with prev/next.
- Product cards link to `/menu/:slug`; blog cards to `/chuyen-cua-thuc/:slug`; store panel CTA to `/cua-hang/:slug`.
### Non-functional
- Responsive: products 4-col desktop / 2-col mobile; blog carousel slides-per-view responsive; no CLS from images (fixed aspect).

## Architecture
### Components
- `src/pages/HomePage.tsx` — composes sections.
- `src/components/home/BannerSlider.tsx` — embla, 2 slides.
- `src/components/home/BlogCarousel.tsx` — embla, 5 blog cards. Reused/subset on blog index if useful.
- `src/components/home/StoreLocator.tsx` — master-detail, `bg-accent`.
- `src/components/home/GalleryLightbox.tsx` — grid + `yet-another-react-lightbox`.
- `src/components/home/PromoBanner.tsx` — single promo image (link `/delivery` or `/chuong-trinh-thanh-vien`).
- **Data flow:** HomePage imports data → passes arrays to section components (props). Store selection + lightbox open index = local `useState` in respective component.

## Related Code Files
### Create
- `src/pages/HomePage.tsx`
- `src/components/home/BannerSlider.tsx`, `BlogCarousel.tsx`, `StoreLocator.tsx`, `GalleryLightbox.tsx`, `PromoBanner.tsx`
- `src/components/ui/EmblaCarousel.tsx` (optional shared embla wrapper: buttons/dots) — reused by banner + blog.
### Reuse
- `ProductCard`, `SectionTitle`, `Container`, `formatPrice` (Phase 4).
### Modify
- `src/pages/HomePage.tsx` (replace Phase 1 stub).

## Implementation Steps
1. `EmblaCarousel` wrapper — `useEmblaCarousel`, prev/next buttons, dots; accepts slides + options.
2. `BannerSlider` — 2 banner images (from `site/`), full-width, embla, arrows/dots.
3. Featured section — `SectionTitle "Top thức uống được ưa thích"` + 8 `ProductCard` grid (4/2 col), both from Phase 4.
4. `PromoBanner` — "Ưu đãi khi đến với Thức", one promo image, CTA link.
5. `BlogCarousel` — "Chuyện của Thức" heading + 5 blog cards (cover, title) linking to detail.
6. `StoreLocator` — "Hệ thống cửa hàng", `bg-accent`; left = selected store image+address, right = 7 clickable names; `useState(0)`.
7. `GalleryLightbox` — "Bộ sưu tập của Thức", image grid; click → open lightbox at index.
8. Compose in `HomePage`; quick mobile sanity check (~375px, not the full sweep — Phase 10 owns that); `tsc --noEmit`.

## Todo List
- [ ] `EmblaCarousel` wrapper
- [ ] `BannerSlider` (2 slides)
- [ ] Featured products grid (8, using Phase 4's `ProductCard`)
- [ ] `PromoBanner`
- [ ] `BlogCarousel` (5)
- [ ] `StoreLocator` master-detail (bg-accent), array order = source page order (see Phase 3)
- [ ] `GalleryLightbox`
- [ ] Compose HomePage + responsive + tsc clean

## Success Criteria
- [ ] All 6 sections render with real images.
- [ ] Banner + blog carousels navigable (arrows/dots/drag).
- [ ] Clicking a store name swaps left panel content.
- [ ] Gallery opens lightbox with working prev/next.
- [ ] Product/blog/store links route correctly.
- [ ] 4-col desktop / 2-col mobile product grid.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Embla config differences (v8 API) | Med | Low | Use `useEmblaCarousel` hook per current docs; wrapper isolates API. |
| Lightbox CSS not imported → unstyled | Med | Med | Import `yet-another-react-lightbox/styles.css` once (in main.css or component). |
| Store images missing for some stores | Med | Low | Fallback to logo/site placeholder via `getImageUrl`. |
| Gallery image set undefined | Low | Low | Curate gallery list from `site/`+`blog/` promo images in a local const. |

## Security Considerations
- External links (none new). No user input. Images from local bundle only.

## Next Steps
- Home page consumes Phase 4's shared atoms; nothing new is created here for other phases to depend on.
