---
phase: 3
title: "Products với join và lọc"
status: completed
priority: P1
effort: "5h"
dependencies: [1]
---

# Phase 3: Products với join và lọc

## Overview

Module products — phức tạp nhất: gom `categories: string[]` (join
`product_categories`), lọc `?category=`, chi tiết theo slug. Pattern đã chốt ở
Phase 1 nên tập trung vào phần join/lọc.

## Requirements

- Functional: `GET /api/products` trả list kèm `categories: string[]` (mảng key);
  `?category=<key>` lọc sản phẩm thuộc danh mục; `GET /api/products/:slug` trả 1
  sản phẩm hoặc 404; chỉ `is_published=true`.
- Non-functional: KHÔNG N+1 — 1 query lấy sản phẩm + categories rồi group JS;
  response khớp `Product` trong `src/data/types.ts`.

## Architecture

- `products.schemas.ts`: `listProductsQuerySchema` (`category?: string`),
  `productSchema` khớp FE `Product`: `{ name, slug, price, priceEstimated?,
  categories: string[], thumb, image?, description? }`. **Schema gộp 1 file** (chỉ
  query+response cho vòng đọc — tách file như QA/QC khi tới vòng CRUD).
  <!-- Updated: Validation Session 1 -->
  **`price` non-null:** data thật 0 sản phẩm null (verify psql). Response
  `price: number` (Zod `.int().nonnegative()`, KHÔNG nullable). Đồng thời sửa
  `src/data/types.ts` FE `price: number | null` → `price: number` để khớp (1
  touchpoint FE ngoại lệ, user duyệt). Field `priceEstimated` PHẢI có trong
  response (FE Product dùng).
- `products.service.ts`:
  - `listProducts(categoryKey?)`: join products ⋈ product_categories ⋈
    categories, where is_published (+ where category.key nếu có filter). Lấy hết
    rồi **group theo product.id** trong JS → gắn `categories: string[]`. Tránh
    N+1 (1 query thay vì 1+42).
  - `getProductBySlug(slug)`: 1 sản phẩm + categories, where is_published.
- `products.routes.ts`: `GET /` (validate query) → `ok(list)`; `GET /:slug` →
  `ok` hoặc 404.
- **KHÔNG gom stickers/options** (YAGNI — FE chưa dùng).
- Ảnh (`thumb`, `image`) trả **tên file trần**.

## Related Code Files

- Create: `server/src/modules/products/{products.schemas,products.service,products.routes}.ts`
- Modify: `server/src/index.ts` (đăng ký `/api/products`)
- Modify: `src/data/types.ts` (FE `Product.price: number | null` → `number` — khớp
  response non-null; ngoại lệ FE có chủ đích)

## Implementation Steps

1. `products.schemas.ts` — query + product schema khớp FE type.
2. `products.service.ts` — `listProducts` (1 join query + group JS),
   `getProductBySlug`.
3. `products.routes.ts` — 2 route + validate `?category=`.
4. Đăng ký `/api/products` ở `index.ts`.
5. build+lint; curl `/api/products`, `?category=<key thật>`, `/:slug`, slug sai.

## Success Criteria

- [x] `curl /api/products` trả 42 sản phẩm, mỗi cái có `categories: string[]`.
- [x] `?category=<key>` chỉ trả sản phẩm thuộc danh mục đó; key sai → mảng rỗng.
- [x] `/api/products/<slug>` trả object khớp shape FE; slug sai → 404.
- [x] Chỉ sản phẩm is_published; `price` là số non-null (data thật không null);
      `src/data/types.ts` đã đổi `price: number`.
- [x] Không có N+1 (kiểm số query trong log 1 lần list).
- [x] build + lint EXIT 0.

## Risk Assessment

- **N+1 nếu gom categories bằng loop.** Mitigation: 1 join query + group JS
  (đã thiết kế). Dữ liệu nhỏ nhưng làm đúng từ đầu.
- **`price` type FE:** data thật 0 null, response non-null. Sửa `src/data/types.ts`
  cùng lúc để type FE khớp — nếu quên, bước 3 FE import type sẽ vênh. Đây là
  touchpoint FE duy nhất của plan này.
- **Group JS làm mất order** nếu không giữ. Mitigation: order theo sort_order/name
  ở SQL, group giữ nguyên thứ tự xuất hiện.
