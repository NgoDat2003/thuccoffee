---
phase: 4
title: "Admin API products + categories"
status: completed
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 4: Admin API — products + categories

## Overview

CRUD API cho products (kèm M:N categories, transaction) và categories (chỉ
label/sortOrder). Đây là pattern chuẩn cho mọi resource sau — viết kỹ, các
phase 7/9/10 nhân bản. Kèm smoke test-first mở rộng.

## Requirements

- Functional: list/detail/create/update/publish/unpublish products; update
  label+sortOrder categories; slug khóa sau tạo; transaction product+categories.
- Non-functional: admin DTO tách public DTO; validation details theo field;
  không migration schema.

## Architecture

### Vị trí module (chốt tại đây — câu mở từ brainstorm)
Admin routes nằm TRONG module resource hiện có, file riêng:
`server/src/modules/products/products.admin.routes.ts` (+ `.admin.schemas.ts`,
mở rộng `products.service.ts` hoặc thêm `.admin.service.ts` nếu service public
phình). Lý do: schema/type/query dùng chung nằm cạnh nhau, không tạo module
admin song song trùng tên. `admin.routes.ts` hiện có (chỉ `GET /me`) thành
router tổng hợp mount các admin router con:

```ts
// server/src/modules/admin/admin.routes.ts
adminRoutes.use('/uploads', uploadsRoutes);       // từ phase 2
adminRoutes.use('/products', productsAdminRoutes);
adminRoutes.use('/categories', categoriesAdminRoutes);
// phase sau: /blog, /stores, /banners, /settings
```

Guard duy nhất giữ ở index.ts: `app.use('/api/admin', requireAuth, adminRoutes)`.

### Endpoints products
```
GET    /api/admin/products          → toàn bộ (kể cả unpublished), admin DTO:
                                      id, name, slug, price, priceEstimated,
                                      thumb, image, description, isPublished,
                                      sortOrder, createdAt, updatedAt,
                                      categories: [{id, key, label}]
                                      (JOIN không N+1 — pattern public đã có)
GET    /api/admin/products/:id      → detail; 404 nếu không có
POST   /api/admin/products          → create; body Zod: name, slug (regex
                                      ^[a-z0-9-]+$), price?>=0, priceEstimated,
                                      thumb (object key), image?, description?,
                                      sortOrder, categoryIds: number[]
                                      → transaction: insert product + insert
                                      productCategories → 201 admin DTO
                                      → slug trùng: unique violation map 409
PUT    /api/admin/products/:id      → update mọi field TRỪ slug (slug khóa —
                                      body có slug khác → 400); transaction
                                      delete+reinsert productCategories
PATCH  /api/admin/products/:id/publish   → body { isPublished: boolean } → 200
```
KHÔNG có DELETE (delete = unpublish, đã chốt).

### Endpoints categories
```
GET  /api/admin/categories          → toàn bộ: id, key, label, sortOrder
PUT  /api/admin/categories/:id      → CHỈ label + sortOrder. `key` bất biến
                                      (red-team #7: key là semantic routing FE
                                      `category-paths` — sửa là vỡ URL public).
```
KHÔNG create/delete category trong MVP (tập category cố định theo menu).

### Smoke (test-first trong phase này)
`server/scripts/smoke-admin-products.ts` + script `smoke:admin-products`,
viết TRƯỚC implement, assert:
1. Mọi endpoint không cookie → 401.
2. List trả cả unpublished (khác public).
3. Create hợp lệ → 201, categories gắn đúng; slug trùng → 409.
4. Create slug sai format → 400 kèm details field.
5. Update đổi slug → 400; update field khác + categoryIds mới → categories thay đúng.
6. Publish false → public `GET /api/products` KHÔNG còn item; publish true → có lại.
7. Category PUT label → đổi; PUT kèm `key` → key KHÔNG đổi (hoặc 400).
8. Cleanup: unpublish/xóa record test bằng SQL trực tiếp cuối script (record
   test tạo bằng slug ngẫu nhiên `smoke-test-*`, delete bằng pg client — cho
   phép trong smoke, không qua API vì API không có delete).

### Error map chung (dùng lại các phase sau)
- Zod fail → 400 details field (error-handler sẵn có).
- Unique violation (pg code 23505) → 409 `CONFLICT` — thêm nhánh error-handler
  hoặc catch tại service; chốt: catch tại service, ném `ApiError` mới
  `ApiError.conflict()` (thêm static vào api-error.ts).
- Not found → `ApiError.notFound()` (đã có? kiểm — nếu chưa, thêm).

## Related Code Files

- Create: `server/src/modules/products/products.admin.{routes,schemas}.ts`,
  `server/src/modules/categories/categories.admin.{routes,schemas}.ts`,
  `server/scripts/smoke-admin-products.ts`
- Modify: `server/src/modules/admin/admin.routes.ts` (mount),
  `server/src/common/api-error.ts` (conflict/notFound nếu thiếu),
  `server/package.json` (script)
- Read for context: `server/src/modules/products/products.routes.ts` (JOIN
  pattern), `server/src/db/schema.ts:28-51`

## Implementation Steps

1. Viết smoke-admin-products (đỏ baseline).
2. Thêm `ApiError.conflict()` (+ notFound nếu thiếu).
3. products.admin.schemas: create/update/publish Zod + admin DTO type.
4. products.admin.routes: 5 endpoint, transaction qua `db.transaction`.
5. categories.admin: 2 endpoint.
6. Mount vào admin.routes; lint/build; smoke XANH.

## Success Criteria

- [x] `smoke:admin-products` XANH toàn bộ.
- [x] Transaction: create fail giữa chừng không để product mồ côi category link.
- [x] Slug khóa enforced; key category bất biến; 409 slug trùng.
- [x] Publish/unpublish phản ánh ngay ở public API.
- [x] Server lint/build sạch.

## Risk Assessment

- **Rủi ro:** Drizzle transaction + unique violation: lỗi trong transaction tự
  rollback — chỉ cần catch ngoài và map 409.
- **Rủi ro:** admin DTO lộ field nhạy cảm — products không có field nhạy cảm,
  nhưng giữ nguyên tắc select tường minh, không `select()` trần.
