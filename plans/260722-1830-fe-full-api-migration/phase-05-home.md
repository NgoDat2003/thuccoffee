---
phase: 5
title: "Home"
status: in-progress
priority: P2
effort: "1h"
dependencies: [2, 3, 4]
---

# Phase 5: Home

## Overview

Chuyển HomePage sang API. Phần lớn đã xong qua component con (BlogCarousel, StoreLocator
ở phase trước). Còn `getFeaturedProducts(8)` → `useProducts('yeu-thich-nhat')`.

## Requirements

- Functional: HomePage featured products + blog carousel + store locator từ API.
- Non-functional: loading/error mỗi section; build/lint sạch.

## Architecture

HomePage hiện: `getFeaturedProducts(8)` (products category `yeu-thich-nhat`) +
BannerSlider + PromoBanner + BlogCarousel + StoreLocator + GalleryLightbox.

**Đã verify DB thật (`GET /api/banners`):** DB có 3 banner **khớp chính xác** ảnh
hardcode hiện tại → chuyển sang API KHÔNG lệch giao diện gốc:
| type | image | Component |
|---|---|---|
| `slider` sortOrder 0 | `3eb3f0f8_cover-2-.jpg` | BannerSlider ảnh 1 |
| `slider` sortOrder 1 | `446135be_cover-fb.jpg` | BannerSlider ảnh 2 |
| `promotion` | `2e94f8cc_cover-fb.jpg` → `/chuong-trinh-thanh-vien` | PromoBanner |

Nguyên tắc người dùng: **DB có gì thì chuyển hết**. Cả BannerSlider + PromoBanner
đều có data DB → chuyển cả hai.

- **Featured products**: `getFeaturedProducts(8)` → `useProducts('yeu-thich-nhat')`
  `.slice(0,8)`. Loading→skeleton grid 4.
- **BlogCarousel, StoreLocator**: đã chuyển ở Phase 3/4.
- **BannerSlider**: hiện hardcode `BANNER_IMAGES`. Đổi → `useBanners()` lọc
  `type==='slider'`, sort `sortOrder`, map ra `getImageUrl(image)`. Loading→giữ chỗ
  (không nhảy layout); lỗi→ẩn hoặc fallback rỗng.
- **PromoBanner**: hiện hardcode 1 ảnh + link. Đổi → `useBanners()` lọc
  `type==='promotion'` [0], dùng `image` + `linkUrl` + `altText` từ DB.
- **GalleryLightbox**: kiểm nguồn — nếu ảnh tĩnh thuần (không có API tương ứng) → GIỮ.

**Lỗi API ở section con**: ẩn section (return null) thay vì Navigate — home không nên
redirect vì 1 section lỗi. Loading → giữ chỗ / ẩn.

## Related Code Files

- Modify: `src/pages/HomePage.tsx` — `useProducts('yeu-thich-nhat')` cho featured.
- Modify: `src/components/home/BannerSlider.tsx` — `useBanners()` type slider.
- Modify: `src/components/home/PromoBanner.tsx` — `useBanners()` type promotion.
- Verify: `src/components/home/GalleryLightbox.tsx` — giữ nếu ảnh tĩnh (không API).
- (BlogCarousel, StoreLocator đã xong ở phase trước.)

## Implementation Steps

1. HomePage featured: `useProducts('yeu-thich-nhat')`, skeleton.
2. BannerSlider: `useBanners()` → filter `type==='slider'` → sort `sortOrder` →
   `getImageUrl(image)`. Verify render đúng 2 ảnh khớp hiện tại.
3. PromoBanner: `useBanners()` → `type==='promotion'`[0] → image + linkUrl + altText.
5. GalleryLightbox: kiểm; giữ static nếu không có API tương ứng.
6. Section lỗi → ẩn (return null), không Navigate.
7. `npm run build` + `npm run lint`; runtime verify (/).

## Success Criteria

- [x] HomePage featured products từ `useProducts('yeu-thich-nhat')`.
- [x] BannerSlider render từ `useBanners()` type slider — đúng 2 ảnh khớp hiện tại.
- [x] PromoBanner render từ `useBanners()` type promotion — đúng ảnh + link membership.
- [x] Section lỗi ẩn gọn, không sập trang.
- [ ] `npm run build` + `npm run lint` sạch; runtime verify home không lệch giao diện.

## Risk Assessment

- **Banner là "hardcode → API" (không phải "tĩnh→động thuần").** DB đã verify khớp 3
  banner với ảnh hardcode → không lệch. Nhưng nếu seed đổi sau này, giao diện home phụ
  thuộc DB — đây là hệ quả có chủ đích (nguyên tắc "DB có gì chuyển hết").
- **Nhiều section = nhiều hook loading.** Mỗi section tự loading; không chặn cả trang.
- **GalleryLightbox có thể là ảnh tĩnh thuần (không API).** Kiểm trước; giữ nếu không
  có data động — đừng ép chuyển thứ không có nguồn DB.
