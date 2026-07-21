---
phase: 1
title: "Validate middleware và các module đơn giản"
status: completed
priority: P1
effort: "5h"
dependencies: []
---

# Phase 1: Validate middleware và các module đơn giản

## Overview

Thêm validate middleware dùng chung, rồi 3 module đơn giản nhất (categories,
banners, stores) để **chốt pattern** module tài nguyên (schemas + service +
routes) trước khi tới blog/products phức tạp.

## Requirements

- Functional: `common/validate.ts` với `validateQuery`/`validateParams`;
  `GET /api/categories`, `GET /api/banners`, `GET /api/stores`,
  `GET /api/stores/:slug` hoạt động, bọc `ApiResponse<T>`, chỉ trả
  `is_published`/`is_active=true`, `:slug` sai trả 404.
- Non-functional: mỗi module đóng gói trong thư mục riêng; schema Zod suy ra
  type; không đọc thẳng `process.env`; build+lint sạch.

## Architecture

**Validate middleware** (`common/validate.ts`):
```ts
export const validateQuery = (schema: ZodSchema) =>
  (req, _res, next) => { req.query = schema.parse(req.query); next(); };
// parse fail → ném ZodError → error-handler bọc 400 (đã có sẵn)
```
Tương tự `validateParams`. Không tự bọc lỗi ở đây — để error-handler lo.

**Mẫu module** (mỗi tài nguyên 3 file trong `modules/<res>/`):
- `<res>.schemas.ts` — Zod query/response schema + `type X = z.infer<...>`
- `<res>.service.ts` — hàm truy vấn Drizzle, trả dữ liệu đã map
- `<res>.routes.ts` — Router: validate → service → `ok()`

Response khớp type FE tái dùng được (bước 3):
- categories → `{ key, label }` (khớp `Category` trong `src/data/types.ts`)
- stores → `{ name, slug, address, phone, hours, image }` (gallery để bước sau)
- banners → `{ type, image, altText, linkUrl, sortOrder }`, chỉ `is_active`

Ảnh trả **tên file trần** (không URL MinIO).

## Related Code Files

- Create: `server/src/common/validate.ts`
- Create: `server/src/modules/categories/{categories.schemas,categories.service,categories.routes}.ts`
- Create: `server/src/modules/banners/{banners.schemas,banners.service,banners.routes}.ts`
- Create: `server/src/modules/stores/{stores.schemas,stores.service,stores.routes}.ts`
- Modify: `server/src/index.ts` (đăng ký 3 router)

## Implementation Steps

1. Viết `common/validate.ts` (`validateQuery`, `validateParams`).
2. Module **categories**: service `listCategories()` (order by sortOrder),
   route `GET /` → `ok(list)`. Chốt pattern ở đây.
3. Module **banners**: service `listActiveBanners()` (where is_active, order
   sortOrder), route `GET /`.
4. Module **stores**: service `listStores()` + `getStoreBySlug(slug)`, routes
   `GET /` và `GET /:slug` (404 nếu không thấy hoặc unpublished).
5. Đăng ký 3 router ở `index.ts` dưới `/api/categories`, `/api/banners`,
   `/api/stores`.
6. `npm run build` + `npm run lint` sạch. Verify curl từng endpoint (compose up).

## Success Criteria

- [x] `curl /api/categories` trả 10 danh mục dạng `{key,label}`, bọc success.
- [x] `curl /api/banners` chỉ trả banner is_active.
- [x] `curl /api/stores` trả 7 store; `/api/stores/<slug-thật>` trả object;
      `/api/stores/khong-ton-tai` trả **404** đúng hình dạng.
- [x] Không endpoint nào trả bản ghi unpublished.
- [x] server build + lint EXIT 0.

## Risk Assessment

- **Pattern sai ở module đầu → nhân bản sai.** Mitigation: làm categories xong,
  review kỹ shape trước khi copy sang banners/stores.
- **`req.query` gán lại trong Express 5** có thể readonly. Mitigation: nếu gán
  trực tiếp lỗi, dùng `res.locals` hoặc gán field đã parse — verify khi viết.
