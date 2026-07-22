---
phase: 5
title: "UI products + categories"
status: completed
priority: P1
effort: "1.5d"
dependencies: [3, 4]
---

# Phase 5: UI — products list/form + categories

## Overview

Màn CRUD đầu tiên, đồng thời xây bộ primitive admin dùng chung (table, form
field, confirm dialog, status badge/switch, toast). Các phase UI sau (8/9/10)
chỉ tái dùng primitive, không viết mới.

## Requirements

- Functional: list (filter/search client), create, edit, publish/unpublish có
  confirm; category sửa label/order; lỗi validate BE map về field.
- Non-functional: Tailwind tự xây; invalidate cả admin + public keys; FE
  lint/build sạch.

## Architecture

### Primitives (`src/components/admin/ui/`) — xây một lần
- `AdminTable.tsx` — table generic: cột config, sort client, empty/loading state.
- `FormField.tsx` — label + input/textarea/select + error text (nhận lỗi từ
  ApiError details theo field).
- `ConfirmDialog.tsx` — `<dialog>` NATIVE (focus trap sẵn — quyết định
  red-team vòng 1), confirm/cancel, dùng cho unpublish.
- `StatusBadge.tsx` + `PublishSwitch.tsx` — hiển thị + toggle isPublished.
- `Toast.tsx` — thông báo thành công/lỗi đơn giản (context + timeout, không lib).
- Form state: `useState` object đơn giản, KHÔNG React Hook Form (đã chốt).
  Lỗi server map qua `details: [{field, message}]` từ error-handler.

### Service (`src/services/admin/products.service.ts`, `categories.service.ts`)
- `adminProductKeys`, `adminCategoryKeys` queryKeys.
- Hooks: `useAdminProducts`, `useAdminProduct(id)`, `useCreateProduct`,
  `useUpdateProduct`, `usePublishProduct`, `useAdminCategories`,
  `useUpdateCategory`.
- Type import thẳng từ `products.admin.schemas` BE (quy ước dự án).
- **Invalidate sau mutation (red-team #6):** admin keys + public keys:
  `['products']`, `['menu']`, `['home']` — đọc key thật từ
  `src/services/*.service.ts` hiện có lúc impl, không bịa.

### Pages (`src/pages/admin/`)
- `AdminProductsPage.tsx` (thay placeholder phase 3): AdminTable — cột
  thumbnail (`getImageUrl`), tên, slug, giá, categories, PublishSwitch,
  sortOrder, updatedAt, actions (sửa / xem trang public). Search input +
  filter category + filter trạng thái — tất cả client (42 records).
- `AdminProductFormPage.tsx` — dùng cho cả `/admin/products/new` và
  `/admin/products/:id`: FormField các cột, ImageField cho thumb (bắt buộc) +
  image (optional), checkbox group categories, slug input DISABLED khi edit.
- `AdminCategoriesPage.tsx` — bảng nhỏ: key (readonly), label (edit inline
  hoặc form), sortOrder.

### Routes (thêm vào tree admin phase 3)
```
products            → AdminProductsPage
products/new        → AdminProductFormPage
products/:id        → AdminProductFormPage
categories          → AdminCategoriesPage
```

## Related Code Files

- Create: `src/components/admin/ui/{AdminTable,FormField,ConfirmDialog,StatusBadge,PublishSwitch,Toast}.tsx`,
  `src/pages/admin/{AdminProductFormPage,AdminCategoriesPage}.tsx`,
  `src/services/admin/{products,categories}.service.ts`
- Modify: `src/pages/admin/AdminProductsPage.tsx` (placeholder → thật),
  `src/routes.tsx` (children admin)
- Read for context: `src/services/products.service.ts` (public keys thật),
  `src/components/admin/ImageField.tsx` (phase 3)

## Implementation Steps

1. Primitives ui/ (Table, FormField, ConfirmDialog, Badge/Switch, Toast).
2. Services admin products + categories (hooks + invalidate map).
3. AdminProductsPage list + filter client.
4. AdminProductFormPage create/edit (ImageField, categories checkbox, slug lock).
5. AdminCategoriesPage.
6. Routes; FE lint/build; test dev đầy đủ luồng.

## Success Criteria

- [x] Tạo product mới có ảnh upload + categories → xuất hiện đúng ở public
      `/menu` (invalidate hoạt động).
- [x] Unpublish qua ConfirmDialog → biến mất khỏi public list không cần F5.
- [x] Sửa category label → đổi ở public menu nav.
- [x] Lỗi validate BE (slug sai, price âm) hiện đúng dưới field.
- [x] Slug không sửa được khi edit.
- [x] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** primitive over-engineer (generic quá sớm). Giữ tối giản: đủ cho
  6 resource đã biết, không props tương lai.
- **Rủi ro:** public query keys đoán sai → invalidate hụt. Bước impl bắt buộc
  đọc key thật từ service hiện có.
