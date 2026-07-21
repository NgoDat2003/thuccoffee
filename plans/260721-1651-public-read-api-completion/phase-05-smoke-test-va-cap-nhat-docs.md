---
phase: 5
title: "Smoke test và cập nhật docs"
status: pending
priority: P2
effort: "2h"
dependencies: [1, 2, 3, 4]
---

# Phase 5: Smoke test và cập nhật docs

## Overview

Mở rộng `smoke-api.ts` assert 1 endpoint mới (site-settings) + gallery trong store
detail. Cập nhật docs: endpoint list (8→9), data counts, seed state. Sửa số "11
estimated" sai thành 10 (report §4.1, §13).

<!-- Updated: Validation Session 1 — bỏ pages assert (Phase 4 hoãn). 8→9 endpoint. -->

## Requirements

- Functional: `smoke:api` assert 9 endpoint + gallery; pass 100%.
- Non-functional: dùng slug động (không hardcode); docs khớp DB thật.

## Architecture

- `smoke-api.ts` thêm assert:
  - `GET /api/site-settings` → 200 + có `hotline`.
  - `GET /api/stores/:slug` → có `gallery` mảng 5 phần tử.
- Docs:
  - `backend-architecture.md`: endpoint list 8→9, data state (banners/settings
    đã seed; pages hoãn).
  - `database-design.md`: correct counts (10 estimated không phải 11), seed state
    của banners/settings. KHÔNG mở lại full parity schema.
  - `README.md`: nếu cần, nhắc 9 endpoint.

## Related Code Files

- Modify: `server/scripts/smoke-api.ts` (2 endpoint + gallery assert)
- Modify: `docs/backend-architecture.md`, `docs/database-design.md`, `README.md`

## Implementation Steps

1. Thêm assert vào smoke script (site-settings, store gallery).
2. Chạy `docker compose up -d` → `npm run db:seed` → `npm run smoke:api` → all pass.
3. Cập nhật 3 docs (endpoint list 8→9, counts, seed state, sửa 11→10 estimated).
4. build+lint root+server sạch; `git diff --check`.

## Success Criteria

- [ ] `smoke:api` pass 100% gồm site-settings endpoint + gallery assert.
- [ ] docs: endpoint list = 9, counts đúng DB (10 estimated), seed state cập nhật.
- [ ] Không còn "11 estimated prices" trong docs.
- [ ] root+server build/lint EXIT 0; `git diff --check` sạch.

## Risk Assessment

- **Smoke hardcode slug/key** → giòn. Mitigation: lấy slug động từ list response;
  page key là enum cố định (chấp nhận hardcode 2 key hợp lệ).
- **Docs drift ngược code** (bài học journal foundation). Mitigation: verify bằng
  lượt seed+smoke thật trước khi viết docs.
