---
phase: 3
title: "Admin shell FE + route guard + ImageField"
status: completed
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 3: Admin shell FE — layout, route guard, ImageField

## Overview

AdminLayout (sidebar/topbar/outlet) bọc route tree `/admin/*`, route guard qua
`useMe`, `/admin` redirect `/admin/products` (trang placeholder trống tới
phase 5), `<ImageField>` upload dùng chung. Tailwind tự xây, không component
library.

## Requirements

- Functional: vào `/admin/*` chưa login → về `/admin/login`; login xong vào
  shell thấy sidebar + tên user + logout; ImageField upload được ảnh và preview.
- Non-functional: FE lint/build sạch; không đụng public tree; admin bundle chung
  SPA (không code-split riêng — YAGNI, tách sau nếu nặng).

## Architecture

### Route tree (`src/routes.tsx`)
Thay 2 route phẳng hiện tại (`/admin/login`, `/admin` → AdminHomePage) bằng:

```tsx
{ path: '/admin/login', element: <AdminLoginPage /> },   // giữ nguyên, ngoài guard
{
  path: '/admin',
  element: <AdminLayout />,          // guard + shell, chứa <Outlet />
  children: [
    { index: true, element: <Navigate to="/admin/products" replace /> },
    { path: 'products', element: <AdminProductsPage /> }, // placeholder tới phase 5
    { path: '*', element: <AdminNotFound /> },            // not-found riêng admin
  ],
},
```

`AdminHomePage.tsx` XÓA (placeholder auth round đã xong nhiệm vụ) — logout
chuyển vào topbar.

### Guard trong `AdminLayout` (`src/components/admin/AdminLayout.tsx`)
- `useMe()`: `isPending` → màn loading tối giản; `isError` (401) →
  `<Navigate to="/admin/login" replace />`; success → render shell.
- KHÔNG guard riêng từng page — một chỗ duy nhất ở layout.

### Shell components (`src/components/admin/`)
- `AdminLayout.tsx` — guard + khung: sidebar trái cố định (desktop), topbar.
- `AdminSidebar.tsx` — nav links: Sản phẩm, Danh mục, Bài viết, Cửa hàng,
  Banner, Cài đặt website (`NavLink` active state). Ở thời điểm phase này chỉ
  Products có trang (placeholder); các link khác rơi vào AdminNotFound —
  phase 5/8/9/10 lấp dần. Mobile: sidebar thu thành drawer đơn giản
  (button toggle, không lib).
- `AdminTopbar.tsx` — tên user từ `useMe` data, nút logout (`useLogout` →
  navigate `/admin/login`).
- `AdminNotFound.tsx` — not-found state riêng trong shell.
- Style: Tailwind token hiện có (`text-primary`, `bg-page`…), tông admin trung
  tính (stone) như AdminLoginPage hiện tại.

### `<ImageField>` (`src/components/admin/ImageField.tsx`)
- Props: `{ kind, value?: string, onChange(objectKey: string), label }`.
- `<input type="file" accept="image/png,image/jpeg,image/webp,image/gif">` →
  gọi `useUploadImage` mutation → nhận `objectKey` → `onChange(key)`.
- Preview: có value → `<img src={getImageUrl(value)}>` (tái dùng
  `src/lib/image-url.ts`); đang upload → trạng thái loading; lỗi → message từ
  ApiError (map lỗi validate BE: sai loại/quá size).
- Gắn tạm một instance demo vào `AdminProductsPage` placeholder để có chỗ test
  thủ công; phase 5 thay bằng form thật.

### Service (`src/services/admin/uploads.service.ts`)
- Thư mục mới `src/services/admin/` (quy ước từ report §13, các phase sau thêm
  vào đây).
- `useUploadImage()`: `useMutation` POST multipart `/admin/uploads` — cần thêm
  helper `apiPostFormData<T>` vào `src/lib/api/axios.ts` (axios tự set boundary
  khi body là FormData; KHÔNG set Content-Type tay).

## Related Code Files

- Create: `src/components/admin/{AdminLayout,AdminSidebar,AdminTopbar,AdminNotFound,ImageField}.tsx`,
  `src/pages/admin/AdminProductsPage.tsx` (placeholder), `src/services/admin/uploads.service.ts`
- Modify: `src/routes.tsx` (tree admin), `src/lib/api/axios.ts` (apiPostFormData)
- Delete: `src/pages/AdminHomePage.tsx`
- Read for context: `src/services/auth.service.ts` (useMe/useLogout),
  `src/lib/image-url.ts`, `src/components/layout/MobileDrawer.tsx` (pattern drawer)

## Implementation Steps

1. Thêm `apiPostFormData` vào axios.ts.
2. Viết `uploads.service.ts` (useUploadImage).
3. Viết shell: AdminLayout (guard) → Sidebar → Topbar → AdminNotFound.
4. Viết ImageField (upload + preview + error).
5. Viết AdminProductsPage placeholder (heading + ImageField demo).
6. Sửa routes.tsx theo tree trên; xóa AdminHomePage.
7. FE lint + build; test dev: guard redirect, login vào shell, upload preview.

## Success Criteria

- [x] Chưa login vào `/admin` hoặc `/admin/products` → về `/admin/login`.
- [x] Login → `/admin` redirect `/admin/products`, sidebar + tên user + logout.
- [x] ImageField chọn ảnh → upload → preview hiện từ MinIO URL; file sai loại →
      message lỗi rõ.
- [x] Public tree không đổi hành vi (spot-check `/`, `/menu`).
- [x] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** `useMe` retry/stale làm guard nháy (flash login rồi vào). Đã có
  `retry: false`; dùng `isPending` chặn render sớm.
- **Rủi ro:** axios interceptor unwrap 204/envelope không khớp multipart
  response 201. Response 201 có body ApiResponse chuẩn → đi path thường; chỉ
  cần KHÔNG tự set Content-Type.
- **Rủi ro:** xóa AdminHomePage sót import. `tsc -b` bắt; grep trước khi xóa.
