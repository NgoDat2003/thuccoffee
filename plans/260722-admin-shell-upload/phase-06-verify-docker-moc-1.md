---
phase: 6
title: "★ Mốc verify Docker 1"
status: pending
priority: P1
effort: "3h"
dependencies: [5]
---

# Phase 6: ★ Mốc verify Docker 1 — nền + products chạy production path

## Overview

Cổng giữa: chứng minh pattern chuẩn (shell, upload, CRUD products) trên Docker
+ nginx TRƯỚC khi nhân bản ra blog/stores/banners/settings. Nếu pattern sai,
sửa ở đây rẻ hơn sửa 6 chỗ.

## Requirements

- Functional: smoke auth/upload/admin-products xanh qua `:8080` VÀ `:3000`;
  DOM đầy đủ luồng CRUD product; public không regression.
- Non-functional: Docker build sạch; multipart 4MB qua nginx.

## Architecture

1. **nginx:** thêm `client_max_body_size` (≥ limit BE, vd `6m`) vào
   `location /api/` trong `deploy/nginx.conf` (verified đang THIẾU — mặc định
   1m sẽ 413 HTML với ảnh > 1MB). Thay đổi config duy nhất được phép trong
   phase verify.
2. **Build:** FE + server lint/build; `docker compose build backend frontend`.
3. **Smoke:** `smoke:auth` + `smoke:upload` + `smoke:admin-products`, mỗi cái
   qua `:8080` rồi `:3000`.
4. **DOM (agent-browser) qua `:3000`:**
   - Guard: `/admin/products` chưa login → về login; login → shell.
   - Tạo product mới: form + upload ảnh thật (>1MB để đập nginx limit) +
     chọn categories → lưu → thấy trong list admin.
   - Mở tab public `/menu` → product mới hiện, ảnh load từ `/media/`.
   - Unpublish qua ConfirmDialog → public list mất item.
   - Sửa category label → public nav đổi.
5. **Public regression:** spot-check `/`, `/menu`, 1 blog, 1 store — DOM + ảnh.

## Related Code Files

- Modify (duy nhất): `deploy/nginx.conf` (client_max_body_size)
- Read/verify: toàn bộ phase 1-5. Lỗi logic → quay lại phase tương ứng.

## Implementation Steps

1. Sửa nginx.conf → rebuild frontend image.
2. Build + up stack healthy; create-admin nếu volume mới.
3. Smoke ×3 script ×2 origin.
4. DOM flow theo Architecture 4.
5. Public regression spot-check.

## Success Criteria

- [ ] 3 smoke xanh cả 2 origin; upload >1MB qua `:3000` không 413.
- [ ] DOM: tạo/sửa/unpublish product end-to-end, phản ánh public không F5.
- [ ] Public spot-check xanh.
- [ ] Docker build sạch.

## Risk Assessment

- **Rủi ro cao:** nginx 413 — đã biết trước, sửa ở bước 1, không chờ smoke đỏ.
- **Rủi ro:** DB volume cũ có record smoke sót → smoke idempotent phải tự
  cleanup (phase 4 đã yêu cầu).
