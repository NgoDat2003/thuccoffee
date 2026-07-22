---
phase: 1
title: "Test-first: khóa hành vi ảnh (smoke)"
status: completed
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Test-first — khóa hành vi ảnh (smoke)

## Overview

Viết smoke script khóa hành vi ảnh TRƯỚC khi đổi, theo pattern `smoke:api` đang có
(tsx script, không thêm test framework — dự án cố tình chưa có test runner). Script
này chạy đỏ ở trạng thái hiện tại cho phần "MinIO URL đúng", và phải chạy xanh sau
Phase 2. Là lưới an toàn cho refactor đụng 14 caller FE.

## Requirements

- Functional: script kiểm chứng mọi ảnh DB (products/blog/stores/banners) và ảnh
  UII tĩnh (site/) resolve tới object key MinIO đúng, HTTP 200 qua public URL.
- Non-functional: không thêm dependency; dùng `tsx` như `smoke:api`; chạy được
  local khi Compose stack đang chạy.

## Architecture

Smoke script `server/scripts/smoke-images.ts` (cạnh `smoke-api.ts`):

1. Query DB thật lấy giá trị cột ảnh: `products.thumb/image`, `blog_posts.cover`,
   `stores.image`, `banners.image`, `media_attachments.storage_key`.
2. Với mỗi giá trị, GET `${MINIO_PUBLIC_URL}/${bucket}/${key}` → assert 200.
3. Assert **định dạng key**: sau Phase 2 mọi key phải có prefix hợp lệ
   (`products/|blog/|stores/|banners/|site/`), không còn basename trần.
4. Danh sách ảnh UI tĩnh FE hardcode (`site/icon-coffee.png`, `site/icon-delivery.png`,
   placeholder `site/151b6674_circlelogo-white-blue-jul2023.png`) — assert 200.

Chạy ở HAI mốc:
- **Trước Phase 2** (baseline): phần "key có prefix" ĐỎ (DB còn basename) — đúng kỳ
  vọng test-first. Phần "ảnh tồn tại trên MinIO" đã xanh (498 ảnh đã seed).
- **Sau Phase 2**: toàn bộ XANH.

## Related Code Files

- Create: `server/scripts/smoke-images.ts`
- Modify: `server/package.json` (thêm script `smoke:images`)
- Read for context: `server/scripts/smoke-api.ts` (pattern), `server/src/db/schema.ts`,
  `server/src/lib/minio-client.ts`, `server/src/common/env.ts`

## Implementation Steps

1. Đọc `smoke-api.ts` để theo đúng pattern (cách connect, assert, exit code, log).
2. Viết `smoke-images.ts`: kết nối DB (Drizzle), lấy mọi giá trị cột ảnh distinct.
3. Xác định public URL MinIO: local `http://localhost:9000/thuccoffee/<key>`. Đọc
   endpoint/bucket từ `env` (không hardcode).
4. Hàm assert: fetch HEAD/GET key → status; gom lỗi, in bảng key → status.
5. Assert prefix hợp lệ bằng regex `^(products|blog|stores|banners|site)/`.
6. Thêm ảnh UI tĩnh hardcode vào danh sách assert (đồng bộ với Phase 2 §FE).
7. Thêm `"smoke:images": "tsx scripts/smoke-images.ts"` vào `server/package.json`.
8. Chạy baseline: xác nhận phần prefix ĐỎ (DB còn basename), phần tồn tại XANH.

## Success Criteria

- [x] `npm run smoke:images` chạy được với Compose stack đang chạy.
- [x] Baseline: assert "ảnh tồn tại trên MinIO" (498) xanh; assert "key có prefix"
      đỏ đúng như kỳ vọng (chưa migrate).
- [x] Script không thêm dependency mới; chỉ dùng `tsx` + Drizzle sẵn có.
- [x] In rõ key nào fail để debug Phase 2.

## Risk Assessment

- **Rủi ro:** smoke cần stack chạy → không chạy được trong CI thuần build. Giảm
  thiểu: đây là verify local như `smoke:api` (README ghi rõ cần backend port 8080);
  không đưa vào CI gate build.
- **Rủi ro:** ảnh UI tĩnh hardcode ở FE lệch danh sách trong smoke. Giảm thiểu:
  Phase 2 và Phase 1 dùng chung một danh sách nguồn (ghi trong phase 2 §FE).
