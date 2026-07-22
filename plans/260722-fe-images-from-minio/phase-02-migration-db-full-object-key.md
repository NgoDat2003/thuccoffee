---
phase: 2
title: "Đổi atomic: DB migration + getImageUrl + seed + env"
status: completed
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Đổi atomic — DB full key + FE resolve MinIO

## Overview

Phase lõi. Đổi **cùng lúc** (atomic, không tách): DB migrate cột ảnh basename →
full object key; `getImageUrl`/`resolveBlogContentImageUrls` resolve qua MinIO URL;
seed ghi full key; thêm env `VITE_MINIO_BASE_URL` + proxy. Sau phase này FE không
còn đọc bundle cho ảnh DB, và trạng thái phải build/verify được ngay (không nửa vời).

## CẢNH BÁO map prefix (đã verify bucket — KHÔNG map theo tên bảng)

Phân bố object thật trên bucket: `blog/` 354, `products/` 84, `stores/` 45,
`site/` 15 = 498. **Không có prefix `banners/`.**

| Cột DB | Prefix MinIO THẬT |
|---|---|
| `products.thumb`, `products.image` | `products/` |
| `blog_posts.cover` | `blog/` |
| `stores.image` | `stores/` |
| **`banners.image`** | **`site/`** ← KHÔNG phải `banners/` |
| `site_settings` logo (`logo_storage_key`) | `site/` |
| `media_attachments.storage_key` (store gallery) | `stores/` |

Map ngây thơ theo tên bảng (`banners → banners/`) sẽ tạo key 404. **Bắt buộc** map
theo bucket thật. Cách an toàn: mỗi basename (có hash unique) khớp đúng 1 object key
trên bucket → migration tra bucket để lấy prefix, không suy diễn.

## Requirements

- Functional:
  - Mọi cột ảnh trong DB lưu full object key có prefix hợp lệ.
  - FE dựng `<img src>` = `VITE_MINIO_BASE_URL + '/' + key`.
  - Ảnh UI tĩnh hardcode FE đổi sang full key `site/...`.
  - `resolveBlogContentImageUrls` map ảnh inline blog (`blog-asset:filename`) sang
    `blog/` key.
  - Seed (`seed.ts`, `seed-images.ts`) ghi full key ở lần chạy sau.
- Non-functional: FE build + lint sạch; không placeholder rơi ở ảnh thật.

## Architecture

### DB migration (data migration, không chỉ schema)

<!-- Updated: Validation Session 1 — chốt cơ chế bucket-driven + logo row -->

Cột ảnh vẫn kiểu `text`, chỉ **giá trị** đổi. Đây là **data update**, không phải
schema change. Cơ chế đã chốt: **script tra bucket một lần** để sinh mapping
basename→full key (mỗi basename có hash unique → khớp đúng 1 object), xuất ra file
SQL `UPDATE`. KHÔNG suy prefix theo tên bảng (sai cho banner). Đồng thời sửa seed để
dữ liệu mới đúng từ đầu.

Số hàng migrate thật (đã verify DB): products 42, blog_posts 267, stores 7,
banners 3, media_attachments 35 (chỉ `owner_type='store'`), logo 1.

**Logo là trường hợp riêng:** `logo_storage_key` nằm trong `site_settings` dạng
key-value row, không phải cột. Migration thêm câu:
`UPDATE site_settings SET value='site/'||value WHERE key='logo_storage_key';`

### FE resolve (`src/lib/image-url.ts`)

Bỏ `import.meta.glob`. Hàm mới:

```ts
const base = import.meta.env.VITE_MINIO_BASE_URL; // vd http://localhost:9000/thuccoffee
export function getImageUrl(objectKey: string): string {
  if (!objectKey) return `${base}/site/151b6674_circlelogo-white-blue-jul2023.png`; // placeholder full key
  return `${base}/${objectKey}`;
}
```

- **3 loại caller** (đã verify) xử lý khác nhau:
  1. Ảnh DB (product/blog/store/banner/logo): API đã trả full key → truyền thẳng.
  2. Ảnh UI hardcode (`icon-coffee.png`→`site/icon-coffee.png`,
     `icon-delivery.png`→`site/icon-delivery.png`) tại `Footer.tsx`,
     `FloatingOrderButton.tsx`: đổi literal sang full key.
  3. `GALLERY_IMAGES` trong `GalleryLightbox.tsx`: đổi từng phần tử sang `blog/`
     hoặc key đúng (verify prefix thật từng ảnh gallery).
- `resolveBlogContentImageUrls`: pattern `src="blog-asset:filename"` → map
  `blog/filename` rồi nối base. Verify mọi filename inline khớp `blog/`.

### Env + proxy

<!-- Updated: Validation Session 1 — chốt nginx /media/ proxy -->

- FE: thêm `VITE_MINIO_BASE_URL`.
  - Dev = `http://localhost:9000/thuccoffee` (hoặc `/media` nếu Vite proxy).
  - **Production = `/media`** — nginx thêm `location /media/` proxy tới MinIO
    (giống `location /api/` đã có). Không lộ MinIO port ra internet, cùng origin.
- `deploy/nginx.conf`: thêm nhánh `/media/` proxy — GIỮ 3-nhánh asset/index/404 có
  chủ đích, không gộp `try_files`. `/media/` là location riêng đứng trước fallback.
- Đối chiếu convention `import.meta.env.VITE_*` (đã có `VITE_API_BASE_URL`).

## Related Code Files

- Create: `server/src/db/migrations/<n>_image_full_object_key.sql` (hoặc script data-migrate)
- Modify:
  - `src/lib/image-url.ts` (bỏ glob, nối base URL)
  - `src/components/layout/Footer.tsx`, `src/components/layout/FloatingOrderButton.tsx`
    (icon UI → `site/` key)
  - `src/components/home/GalleryLightbox.tsx` (`GALLERY_IMAGES` → full key)
  - `server/src/db/seed.ts`, `server/src/db/seed-images.ts` (ghi full key)
  - `vite.config.ts` (env/proxy nếu cần), `deploy/nginx.conf` (proxy MinIO production)
  - `.env.example` FE + server nếu thêm biến
- Read for context: 14 caller `getImageUrl` (blast radius), `src/lib/format.ts`

## Implementation Steps

1. Xác nhận bảng map basename → object key bằng cách tra bucket (script một lần),
   xuất mapping để migration dùng. Đặc biệt kiểm banner nằm `site/`.
2. Viết migration/script data-update: mỗi cột ảnh → full key theo mapping. Idempotent
   (chạy lại không double-prefix: chỉ đổi giá trị chưa có prefix hợp lệ).
3. Sửa `seed.ts` + `seed-images.ts` để nguồn seed ghi full key (đồng bộ định dạng).
4. Đổi `getImageUrl` sang nối `VITE_MINIO_BASE_URL + key`; bỏ `import.meta.glob`.
5. Đổi ảnh UI hardcode (Footer, FloatingOrderButton) + `GALLERY_IMAGES` sang full key.
6. Đổi `resolveBlogContentImageUrls` map `blog/` key.
7. Thêm env `VITE_MINIO_BASE_URL` (dev) + xử lý production qua nginx.
8. `npm run lint` + `npm run build` FE; server `npm run lint`/`build`.
9. Chạy migration trên DB local, rồi `npm run smoke:images` (Phase 1) → phải XANH.

## Success Criteria

- [x] Mọi cột ảnh DB có prefix hợp lệ; banner ở `site/` (không `banners/`).
- [x] `getImageUrl` không còn tham chiếu `import.meta.glob`.
- [x] Ảnh UI hardcode + gallery + blog inline resolve đúng (không placeholder).
- [x] `smoke:images` XANH toàn bộ.
- [x] FE + server lint/build sạch.
- [x] Seed chạy lại cho ra full key (không regress về basename).

## Risk Assessment

- **Rủi ro cao:** map prefix sai (banner→`banners/`) → 404 hàng loạt. Giảm thiểu:
  map theo bucket thật, smoke assert 200 mọi key.
- **Rủi ro:** migration double-prefix khi chạy lại. Giảm thiểu: idempotent, chỉ
  đổi giá trị chưa có prefix hợp lệ.
- **Rủi ro:** sót caller trong 14 file → ảnh lẻ vỡ. Giảm thiểu: grep toàn bộ
  caller, smoke + verify DOM Phase 3.
- **Rủi ro:** production nginx chưa proxy MinIO → ảnh 404 ở `:3000`. Giảm thiểu:
  Phase 3 verify trên Docker thật, không chỉ dev (bài học "local build đánh lừa").
- **Rollback:** giữ migration đảo ngược (full key → basename) + `image-url.ts` cũ
  trong git; revert được nếu production hỏng.
