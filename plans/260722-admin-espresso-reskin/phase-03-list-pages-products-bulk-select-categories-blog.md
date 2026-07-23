---
phase: 3
title: "List pages: products bulk-select + categories + blog"
status: completed
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 3: List pages — products (+bulk-select), categories, blog

## Overview

Reskin 3 màn list theo view `isProducts`/`isCategories`/`isBlog` trong file
design. Điểm mới duy nhất về hành vi: bulk-select bar ở products (chọn nhiều
row → Hiển thị/Ẩn hàng loạt). Còn lại thuần đổi skin trên logic sẵn có.

## Nguồn design

Đọc từng view trong `./design-reference-espresso.dc.html` (grep mốc):
- **isProducts**: header row = eyebrow "Quản trị" (13px/700 copper-strong) +
  title 34px/900 + nút pill "Thêm sản phẩm" (bg `#241c15` chữ kem, icon plus);
  filter row = search input underline không border + 2 pill `<select>`;
  bulk bar (chỉ hiện khi ≥1 checked) = pill tối `#241c15` chữ kem "Đã chọn N
  sản phẩm" + nút "Hiển thị"/"Ẩn"; table = checkbox col + thumb+name+slug +
  price + category text + toggle+label + sortOrder + actions text link
  ("Sửa" copper, "Xem" muted — KHÔNG icon button).
- **isCategories**: key thành `<code>` chip (bg nhạt, mono); label + sortOrder
  input underline; nút "Lưu" pill per row.
- **isBlog**: cover thumb + title+slug + ngày đăng + toggle + updated +
  actions; pagination plain-text (primitive phase 2 đã có).

## Requirements

- Functional: filter/search/sort/publish/confirm giữ nguyên; bulk publish
  MỚI = check rows → bar hiện → "Hiển thị"/"Ẩn" chạy `Promise.all` lặp
  mutation publish sẵn có (`usePublishProduct`) cho từng id đã chọn → toast
  kết quả → clear selection. KHÔNG endpoint mới.
  **Products chuyển sang DRAWER**: nút "Thêm sản phẩm" + link "Sửa" mở
  `AdminDrawer` (phase 2) chứa nội dung form (tách `ProductForm` component
  từ `AdminProductFormPage` — logic form giữ nguyên, chỉ đổi vỏ); route
  `products/new` + `products/:id` XÓA khỏi routes.tsx;
  `AdminProductFormPage.tsx` xóa sau khi form tách xong.
  **Pagination client**: products dùng `pageSize={10}` của AdminTable.
- Non-functional: unpublish hàng loạt vẫn qua ConfirmDialog (một dialog cho
  cả batch, message ghi số lượng); invalidate tự chạy qua onSuccess mutation
  sẵn có; đóng drawer sau lưu thành công.

## Related Code Files

- Create: `src/components/admin/forms/ProductForm.tsx` (tách từ
  AdminProductFormPage — state/submit/validate/ImageField giữ nguyên, render
  trong drawer, sticky bar ở chân drawer)
- Modify: `src/pages/admin/{AdminProductsPage,AdminCategoriesPage,AdminBlogPage}.tsx`,
  `src/routes.tsx` (xóa products/new + products/:id)
- Delete: `src/pages/admin/AdminProductFormPage.tsx` (sau khi tách)
- Read for context: file design 3 view trên; `src/services/admin/products.service.ts`
  (usePublishProduct — dùng lặp, không sửa)

## Implementation Steps

1. Tách ProductForm từ AdminProductFormPage (props `{productId?, onDone}`;
   productId undefined = create); xóa page + routes.
2. AdminProductsPage: reskin header/filter/table + pageSize 10; state
   `drawerProduct` (undefined=đóng, null=create, number=edit) + AdminDrawer;
   `selectedIds` + checkbox col + bulk bar (ẩn qua ConfirmDialog).
3. AdminCategoriesPage: code chip + underline inputs + pill Lưu (không drawer
   — inline edit sẵn có).
4. AdminBlogPage: reskin theo view isBlog (blog GIỮ trang form riêng).
5. FE lint/build; dev: tạo/sửa product qua drawer, bulk ẩn 3 SP → public mất
   → hiện lại, pagination client 42 SP → 5 trang.

## Success Criteria

- [ ] 3 màn khớp view design (đối chiếu cạnh nhau).
- [ ] Product create/edit qua drawer đầy đủ (validate lỗi field, upload ảnh,
      slug lock khi edit, lưu xong drawer đóng + list cập nhật).
- [ ] Route products/new + products/:id đã xóa; vào URL cũ rơi AdminNotFound.
- [ ] Bulk-select: chọn/bỏ chọn/chọn-tất-cả đúng; Ẩn hàng loạt qua dialog;
      public phản ánh; selection clear sau thao tác.
- [ ] Pagination client products hoạt động cùng filter/sort (filter đổi →
      về trang 1).
- [ ] Hành vi cũ còn lại (search/filter/sort/single toggle) không đổi.
- [ ] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** `Promise.all` 42 mutation đập server — thực tế bulk hiếm khi
  quá vài chục record, PATCH nhẹ; nếu cần thì chunk 10 — quyết tại impl nếu
  thấy chậm, không cần thiết kế trước.
- **Rủi ro:** header checkbox chọn cả row bị filter ẩn — chốt: chỉ chọn rows
  ĐANG HIỂN THỊ sau filter.
