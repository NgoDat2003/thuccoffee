---
phase: 2
title: "Store gallery trong detail contract"
status: pending
priority: P1
effort: "3h"
dependencies: []
---

# Phase 2: Store gallery trong detail contract

## Overview

Mở rộng `GET /api/stores/:slug` trả `gallery: string[]` (ordered) từ
`media_attachments`. Đây là contract change của store detail, KHÔNG endpoint
`/media` riêng. List store vẫn KHÔNG có gallery (tránh payload lặp).

## Requirements

- Functional: `GET /api/stores/:slug` trả thêm `gallery: string[]` — 5 filename
  theo thứ tự; store không có attachment trả `gallery: []`, không 500; slug sai
  vẫn 404.
- Non-functional: không N+1; list `/api/stores` không đổi (không gallery).

## Architecture

- `stores.schemas.ts`: tách `storeDetailSchema = storeSchema.extend({ gallery:
  z.array(z.string()) })`. List giữ `storeSchema` (không gallery).
- `stores.service.ts`: `getStoreBySlug` thêm query media:
  - lấy store (published) trước; nếu không có → undefined (route trả 404).
  - query `media_attachments` where `owner_type='store' AND owner_id=store.id AND
    role='gallery'` order `sort_order ASC, id ASC` → map `storage_key` → string[].
  - 2 query (store + media), không N+1. (Hoặc 1 join + group nếu gọn hơn.)
- `stores.routes.ts`: envelope không đổi, chỉ shape data giàu hơn.

## Related Code Files

- Modify: `server/src/modules/stores/stores.schemas.ts` (storeDetailSchema + gallery)
- Modify: `server/src/modules/stores/stores.service.ts` (query media cho detail)
- Modify: `server/src/modules/stores/stores.routes.ts` (nếu cần đổi type trả)

## Implementation Steps

1. Thêm `storeDetailSchema` (extend + gallery) vào schemas.
2. `getStoreBySlug`: query store, nếu có thì query media gallery ordered, gắn vào.
3. Đảm bảo `listStores` KHÔNG kèm gallery.
4. build+lint; curl `/api/stores/<slug>` xem 5 gallery đúng thứ tự; store detail
   khác cũng 5; slug sai → 404.

## Success Criteria

- [ ] `GET /api/stores/:slug` trả `gallery` 5 filename đúng `sort_order` (0→4).
- [ ] Mọi store seeded trả đúng 5 gallery.
- [ ] `GET /api/stores` (list) KHÔNG có field gallery.
- [ ] Store giả định 0 attachment → `gallery: []`, không 500.
- [ ] slug sai → 404. build+lint sạch.

## Risk Assessment

- **Query media sai owner → ảnh nhầm store.** Mitigation: filter đủ owner_type +
  owner_id + role; order deterministic (report §8.1).
- **N+1 nếu query media trong loop.** Detail chỉ 1 store nên 2 query là đủ; không
  loop.
- **List bị phình gallery** nếu vô ý dùng chung schema. Mitigation: tách schema
  list vs detail rõ ràng.
