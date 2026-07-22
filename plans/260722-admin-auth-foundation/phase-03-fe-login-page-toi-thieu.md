---
phase: 3
title: "FE login page tối thiểu"
status: completed
priority: P2
effort: "4h"
dependencies: [2]
---

# Phase 3: FE login page tối thiểu

## Overview

Trang `/admin/login` tối thiểu để test đường đi thật FE↔auth API. Form email/
password → gọi login → cookie tự set → điều hướng. KHÔNG làm admin shell, sidebar,
route guard đầy đủ (phase sau) — chỉ đủ để login hoạt động và thấy trạng thái.

## Requirements

- Functional: nhập email/password → submit → nếu đúng, cookie set + điều hướng
  tới `/admin` (trang tạm/placeholder); nếu sai, hiện lỗi 401 chung.
- Non-functional: FE lint/build sạch; theo pattern service+hook hiện có.

## Architecture

### axios (bắt buộc sửa)
- `src/lib/api/axios.ts`: thêm `withCredentials: true` vào `axios.create` — hiện
  THIẾU, không có thì cookie không gửi/nhận. Đây là touchpoint bắt buộc.

### Service `src/services/auth.service.ts`
- Theo pattern service hiện có: import type `AuthUser` thẳng từ
  `../../server/src/modules/auth/auth.schemas`.
- `useLogin()`: `useMutation` POST `/auth/login` với { email, password }.
- `useMe()`: `useQuery` GET `/auth/me` (dùng lại cho route guard phase sau).
- `useLogout()`: `useMutation` POST `/auth/logout` → invalidate me.
- queryKeys `authKeys`.

### Trang `src/pages/AdminLoginPage.tsx`
- Form email + password + submit; loading/error rõ ràng (lỗi 401 → message chung).
- Thành công → `navigate('/admin')`.
- `usePageMeta()` cho title (quy ước dự án).

### Route `src/routes.tsx`
- Thêm object route **NGOÀI** `<Layout />` (không header/footer public):
  `{ path: '/admin/login', element: <AdminLoginPage /> }`.
- `/admin` trang placeholder tối thiểu (vd chữ "Admin" + nút logout) — đủ để
  thấy điều hướng sau login. KHÔNG làm shell đầy đủ.

## Related Code Files

- Create: `src/services/auth.service.ts`, `src/pages/AdminLoginPage.tsx`,
  `src/pages/AdminHomePage.tsx` (placeholder tối thiểu)
- Modify: `src/lib/api/axios.ts` (withCredentials), `src/routes.tsx` (routes admin)
- Read for context: `src/services/site-settings.service.ts` (pattern),
  `src/lib/use-page-meta.ts`, `src/lib/api/index.ts`

## Implementation Steps

1. Thêm `withCredentials: true` vào axios client.
2. Viết auth.service (login/me/logout + queryKeys), import type từ backend.
3. Viết AdminLoginPage (form, loading/error, navigate khi đúng).
4. Viết AdminHomePage placeholder (chữ + nút logout gọi useLogout → về /admin/login).
5. Thêm routes `/admin/login` + `/admin` ngoài Layout.
6. FE lint + build; test thủ công dev: login sai → lỗi; đúng → vào /admin.

## Success Criteria

- [x] axios gửi cookie (`withCredentials`).
- [x] Login đúng → điều hướng /admin; sai → hiện lỗi 401 chung.
- [x] Logout → về /admin/login, cookie hết dùng.
- [x] `/admin/login` không render header/footer public.
- [x] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** axios thiếu withCredentials → cookie không gửi, login "thành công"
  nhưng me vẫn 401. Giảm thiểu: sửa axios là bước 1, verify me trả 200 sau login.
- **Rủi ro:** dev cross-origin (Vite :5173 vs BE :8080) cookie bị chặn. Giảm
  thiểu: dùng Vite proxy `/api` same-origin (đã có cho API hiện tại).
- **Rủi ro:** route guard chưa có → ai cũng vào /admin placeholder. Chấp nhận
  được phase này (chưa có gì nhạy cảm ở /admin); guard đầy đủ ở phase shell.
