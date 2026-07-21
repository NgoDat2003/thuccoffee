---
phase: 4
title: "Smoke test e2e và docs"
status: completed
priority: P2
effort: "3h"
dependencies: [1, 2, 3]
---

# Phase 4: Smoke test e2e và docs

## Overview

Script curl e2e assert cả 8 endpoint (status + shape) chạy qua compose đang lên,
lặp lại được và đưa CI sau dễ. Cập nhật docs đánh dấu API đọc đã xong.

## Requirements

- Functional: một script gọi 8 endpoint, assert HTTP status + field chính, in
  PASS/FAIL từng cái, exit != 0 nếu có fail.
- Non-functional: không cần test runner; chạy được với backend qua compose hoặc
  `npm run dev`; base URL đọc từ env/tham số.

## Architecture

- `server/scripts/smoke-api.sh` (hoặc `.ts` dùng fetch nếu muốn assert JSON kỹ):
  - list endpoints: assert 200 + body `success:true` + `data` là mảng
  - `:slug` hợp lệ: 200 + object; slug sai: **404** + `success:false`
  - `/api/blog?page=2`: 200 + có `meta.totalPages`
  - `/api/products?category=<key>`: 200 + data lọc đúng
  - `?page=abc`: 400
- Thêm script `"smoke:api": "..."` vào `server/package.json`.
- Docs: `backend-architecture.md` mục "Thứ tự triển khai" đánh dấu bước 2 xong;
  ghi 8 endpoint đã có. README thêm dòng backend content API khả dụng local.

## Related Code Files

- Create: `server/scripts/smoke-api.sh` (hoặc `.ts`)
- Modify: `server/package.json` (script `smoke:api`)
- Modify: `docs/backend-architecture.md`, `README.md`

## Implementation Steps

1. Viết `smoke-api` script assert 8 endpoint (list, :slug ok/404, pagination,
   filter, validate 400).
2. Thêm script npm.
3. Chạy `docker compose up -d` (hoặc backend dev) → `npm run smoke:api` → tất cả
   PASS.
4. Cập nhật docs (thứ tự triển khai, README).
5. build+lint sạch cả root và server.

## Success Criteria

- [x] `npm run smoke:api` chạy 8 endpoint, in PASS hết, exit 0.
- [x] Script assert đúng 404 cho slug sai và 400 cho query sai (không chỉ 200).
- [x] docs cập nhật: bước 2 đánh dấu xong, 8 endpoint liệt kê.
- [x] root + server build/lint EXIT 0.

## Risk Assessment

- **Script phụ thuộc dữ liệu seed cụ thể** (slug thật). Mitigation: script lấy
  slug động từ chính response list (gọi list trước, lấy slug[0]), không hardcode.
- **Windows shell vs sh:** nếu `.sh` khó chạy trên Windows dev, cân nhắc `.ts`
  dùng `tsx` + fetch cho khả chuyển. Chọn `.ts` nếu team dev trên Windows.
