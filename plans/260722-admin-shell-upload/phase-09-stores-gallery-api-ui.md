---
phase: 9
title: Stores + gallery (API + UI)
status: completed
priority: P1
effort: 1d
dependencies:
  - 6
---

# Phase 9: Stores + gallery — API + UI

## Overview

CRUD stores theo pattern phase 4/5, thêm phần riêng: gallery qua
`media_attachments` (transaction delete-reinsert, red-team #9).

## Requirements

- Functional: CRUD store + publish + order; gallery add/remove/reorder (ảnh
  upload qua ImageField kind="stores"); slug khóa.
- Non-functional: gallery write idempotent, không nổ unique constraint 500.

## Architecture

### API (`stores.admin.routes.ts`)
```
GET    /api/admin/stores            → toàn bộ + gallery đếm (không cần full
                                      gallery ở list)
GET    /api/admin/stores/:id        → detail + gallery đầy đủ có thứ tự
                                      (pattern public store detail sẵn có)
POST   /api/admin/stores            → name, slug, address, phone, hours,
                                      image (key), region?; 409 slug trùng
PUT    /api/admin/stores/:id        → mọi field trừ slug
PATCH  /api/admin/stores/:id/publish
PUT    /api/admin/stores/:id/gallery → body { items: [{ storageKey, sortOrder }] }
                                      → TRANSACTION: delete toàn bộ attachment
                                      (ownerType='store', ownerId, role='gallery')
                                      rồi reinsert theo list mới (red-team #9:
                                      idempotent, né uniqueIndex owner+storage+role;
                                      trùng storageKey trong body → Zod refine 400
                                      trước khi chạm DB)
```
Gallery replace-toàn-bộ thay vì add/remove lẻ: đơn giản hơn nhiều, đúng KISS
với gallery ~5-10 ảnh.

### Smoke `smoke-admin-stores.ts`
Guard 401; CRUD + 409 slug; publish phản ánh public; gallery PUT replace →
GET detail trả đúng thứ tự; PUT lại cùng payload → không lỗi (idempotent);
body trùng storageKey → 400; cleanup SQL.

### UI
- `src/services/admin/stores.service.ts` — hooks + invalidate public store keys.
- `AdminStoresPage.tsx` — AdminTable: image thumb, name, slug, address, region,
  publish, order, actions.
- `AdminStoreFormPage.tsx` — FormField các cột + ImageField image + **section
  gallery**: list ảnh hiện có (thumbnail + nút xóa + nút lên/xuống đổi thứ tự
  — KHÔNG drag-drop lib, nút mũi tên đủ) + ImageField thêm ảnh mới → tất cả
  thành state local, nút "Lưu gallery" PUT một lần.
- Routes: `stores`, `stores/new`, `stores/:id`.

## Related Code Files

- Create: `server/src/modules/stores/stores.admin.{routes,schemas}.ts`,
  `server/scripts/smoke-admin-stores.ts`,
  `src/pages/admin/{AdminStoresPage,AdminStoreFormPage}.tsx`,
  `src/services/admin/stores.service.ts`
- Modify: `server/src/modules/admin/admin.routes.ts`, `src/routes.tsx`,
  `server/package.json`
- Read for context: `server/src/modules/stores/stores.routes.ts` (gallery JOIN
  pattern), `src/services/stores.service.ts` (public keys)

## Implementation Steps

1. Smoke đỏ baseline.
2. stores.admin schemas + routes (gallery transaction).
3. Mount; lint/build; smoke XANH.
4. Service FE + 2 page + routes.
5. FE lint/build; test dev: sửa gallery → public store detail đổi thứ tự ảnh.

## Success Criteria

- [x] `smoke:admin-stores` XANH (kèm idempotency + 400 trùng key) — 5/5 cả :8080 lẫn :3000.
- [x] Gallery reorder phản ánh đúng thứ tự ở public store detail (smoke assert 4 so cả public).
- [x] Publish/unpublish store phản ánh public list (smoke assert 3).
- [x] FE + server lint/build sạch.

## Risk Assessment

- **Rủi ro:** delete-reinsert gallery làm mất attachment role khác ('cover',
  'detail') nếu WHERE thiếu role — WHERE phải đủ 3 điều kiện ownerType +
  ownerId + role='gallery'.
