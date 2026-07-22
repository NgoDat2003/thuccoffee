---
phase: 4
title: "Verify auth end-to-end (Docker)"
status: completed
priority: P1
effort: "3h"
dependencies: [3]
---

# Phase 4: Verify auth end-to-end (Docker production path)

## Overview

Xác minh auth hoạt động end-to-end ở môi trường production-like (Docker + nginx),
đặc biệt argon2 native build (bài học "local build đánh lừa"). Cổng cuối trước khi
coi phase Auth xong.

## Requirements

- Functional: login/logout/me + guard hoạt động qua `:3000` (nginx proxy `/api`);
  cookie set/gửi đúng; login sai → 401 chung.
- Non-functional: Docker build backend không đỏ (argon2 native); FE+server lint/build sạch.

## Architecture

Ba tầng verify:
1. **Build:** server lint/build, FE lint/build. `docker compose build backend` —
   argon2 native compile không đỏ. `docker compose build frontend`.
2. **Smoke:** `npm run smoke:auth` XANH (8 assert). Chạy `create-admin` trước.
3. **Runtime DOM:** agent-browser mở `:3000/admin/login` — login sai (lỗi hiện),
   login đúng (điều hướng /admin), logout (về login). Kiểm cookie trong browser là
   httpOnly (không đọc được bằng JS).

## Related Code Files

- Read/verify: `server/src/modules/auth/*`, `auth-middleware.ts`, `create-admin.ts`,
  `deploy/nginx.conf` (proxy /api đã có), `src/lib/api/axios.ts`
- Không sửa code (chỉ verify); lỗi → quay lại Phase 2/3.

## Implementation Steps

1. `docker compose build backend frontend` — xác nhận argon2 build không đỏ.
2. `docker compose up -d` — stack chạy healthy.
3. Chạy `create-admin` (env ADMIN_EMAIL/PASSWORD) trong container/ local.
4. `npm run smoke:auth` → XANH.
5. agent-browser `:3000/admin/login`: login sai → 401 chung; login đúng → /admin;
   me trả admin; logout → /admin/login.
6. Kiểm cookie httpOnly: `document.cookie` KHÔNG chứa token (httpOnly ẩn với JS).
7. Kiểm guard: gọi `:3000/api/admin/me` không cookie → 401; có cookie → 200.

## Success Criteria

- [x] Docker build backend (argon2 native) + frontend không đỏ.
- [x] `smoke:auth` XANH toàn bộ.
- [x] `:3000/admin/login` DOM: login sai/đúng/logout đúng luồng.
- [x] Cookie httpOnly (JS không đọc được token).
- [x] Guard `:3000/api/admin/*`: 401 không cookie, 200 có cookie.
- [x] Verify trên Docker production path, KHÔNG chỉ dev.

## Risk Assessment

- **Rủi ro cao:** argon2 native build đỏ trong Docker (khác local). Đây là lý do
  verify Docker thật — bắt đúng lớp bài học cũ.
- **Rủi ro:** cookie không set qua nginx (SameSite/Secure sai với http local).
  Giảm thiểu: Secure chỉ bật production; local http dùng SameSite=Lax không Secure.
- **Rủi ro:** agent-browser bỏ sót luồng. Giảm thiểu: liệt kê 3 luồng cụ thể
  (sai/đúng/logout) + kiểm httpOnly + guard.
