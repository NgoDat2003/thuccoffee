---
phase: 1
title: "Test-first: auth smoke contract"
status: completed
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Test-first — auth smoke contract

## Overview

Viết smoke script khóa hợp đồng auth TRƯỚC khi implement, theo pattern
`smoke:api`/`smoke:images` (tsx, không thêm test framework). Script chạy đỏ ở
trạng thái hiện tại (chưa có route auth), phải xanh sau Phase 2. Lưới an toàn cho
logic security-critical.

## Requirements

- Functional: script test đường đi thật qua HTTP — login đúng/sai, me, logout,
  guard chặn `/api/admin/*`.
- Non-functional: không thêm dependency; dùng `tsx`; chạy khi backend + Postgres chạy.

## Architecture

Smoke script `server/scripts/smoke-auth.ts` (cạnh smoke-api/smoke-images). Cần một
admin test tồn tại (bootstrap qua CLI Phase 2, hoặc script tự tạo rồi cleanup).

Các assert (hợp đồng auth):
1. **Login sai** (email không tồn tại) → 401, body `success:false`, message chung.
2. **Login sai** (đúng email, sai password) → 401, **cùng message** (chống enumeration).
3. **Login đúng** → 200, `Set-Cookie` có cookie httpOnly; body trả `{ email, role }`.
4. **GET /api/auth/me** không cookie → 401.
5. **GET /api/auth/me** kèm cookie hợp lệ → 200, trả admin.
6. **GET /api/admin/** (route thử nghiệm hoặc bất kỳ admin route) không cookie → 401.
7. **GET /api/admin/** kèm cookie → không 401 (200/404 tùy route tồn tại).
8. **Logout** → **204** (No Content, không body — quy ước CLAUDE.md); sau logout,
   cookie cũ gọi `/api/auth/me` → 401.
   <!-- Updated: Red Team — chốt 204, bỏ 200/204 mập mờ -->

## Related Code Files

- Create: `server/scripts/smoke-auth.ts`
- Modify: `server/package.json` (thêm `smoke:auth`)
- Read for context: `server/scripts/smoke-api.ts`, `smoke-images.ts` (pattern),
  `server/src/common/api-error.ts` (401 shape)

## Implementation Steps

1. Đọc `smoke-api.ts` theo đúng pattern (fetch, assert, exit code, log bảng).
2. Viết `smoke-auth.ts` với 8 assert trên; giữ/gửi cookie giữa các request
   (đọc `Set-Cookie`, gửi lại ở request sau).
3. Dùng admin test từ env (ADMIN_EMAIL/PASSWORD) — cùng bootstrap Phase 2.
4. Thêm `"smoke:auth": "tsx scripts/smoke-auth.ts"`.
5. Chạy baseline: xác nhận ĐỎ (route auth chưa có → 404/không match) đúng kỳ vọng.

## Success Criteria

- [x] `npm run smoke:auth` chạy được khi stack chạy.
- [x] Baseline ĐỎ đúng (chưa implement); in rõ assert nào fail.
- [x] Không thêm dependency; chỉ tsx.
- [x] 8 assert phủ: login sai/đúng, me có/không cookie, guard chặn/cho, logout revoke.

## Risk Assessment

- **Rủi ro:** smoke cần admin test tồn tại → phụ thuộc bootstrap Phase 2. Giảm
  thiểu: script chạy sau Phase 2, hoặc tự tạo admin test rồi xóa.
- **Rủi ro:** cookie handling trong fetch (Set-Cookie → gửi lại) dễ sai. Giảm
  thiểu: parse cookie thủ công, assert cả tồn tại cookie lẫn flag httpOnly.
- **Rủi ro:** cần một admin route thật để test guard. Giảm thiểu: Phase 2 thêm
  route admin tối thiểu (vd `GET /api/admin/me` hoặc placeholder) chỉ để test guard.
