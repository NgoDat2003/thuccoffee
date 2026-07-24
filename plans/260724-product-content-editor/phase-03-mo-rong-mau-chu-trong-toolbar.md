---
phase: 3
title: "Mo rong mau chu trong toolbar"
status: completed
priority: P2
effort: "45m"
dependencies: [1]
---

# Phase 3: Mở rộng màu chữ trong toolbar

## Overview

Dropdown "Màu chữ" trong `BlogEditorToolbar.tsx` (dùng chung cho product và
blog content editor) chỉ có 4 màu cố định (đỏ/xanh dương/xanh lá/nâu Thức).
Owner muốn thêm màu tự do. Đã verify backend sanitizer (`sanitize-html`)
chấp nhận mọi giá trị `color: #rrggbb` — không cần đổi backend.

Owner chốt: giữ dropdown 4 màu nhanh (thao tác 1-click cho màu hay dùng) +
thêm color picker tự do bên cạnh, không thay thế hẳn dropdown.

## Requirements

- Functional: bên cạnh dropdown "Màu chữ" hiện có, thêm 1 input
  `type="color"` cho phép chọn mọi màu hex, áp dụng qua
  `editor.chain().focus().setColor(hex).run()` — cùng lệnh Tiptap dropdown
  đang dùng.
- Non-functional: không đổi behavior 4 preset màu hiện có. Không cần đổi
  backend (`products-content-sanitizer.ts` / `blog-content-sanitizer.ts`
  đã chấp nhận mọi `#rrggbb`).
- Scope boundary: chỉ áp dụng cho "Màu chữ" (Color/TextStyle extension).
  Dropdown "Làm nổi" (Highlight) giữ nguyên 3 preset, không mở rộng —
  owner không yêu cầu phần này.

## Architecture

Thêm 1 `<input type="color">` ngay sau dropdown "Màu chữ" hiện có trong
`BlogEditorToolbar.tsx`. `onChange` gọi `editor.chain().focus().setColor(e.target.value).run()`
— cùng API `setColor` mà dropdown đang gọi, chỉ khác nguồn giá trị (input
color native thay vì option cố định). Không cần state React riêng — đọc
giá trị hiện tại từ `editor.getAttributes('textStyle').color` để đồng bộ
2 control cùng phản ánh 1 trạng thái màu, giống cách dropdown đang làm.

## Related Code Files

- Modify: `frontend/src/components/admin/blog-editor/BlogEditorToolbar.tsx`

## Implementation Steps

1. Đọc lại `BlogEditorToolbar.tsx` dòng 57-74 (dropdown "Màu chữ" hiện có).
2. Thêm ngay sau `</select>` của dropdown màu chữ:
   ```tsx
   <input
     type="color"
     aria-label="Chọn màu chữ tự do"
     className="h-9 w-9 cursor-pointer rounded-md border border-admin-border bg-transparent p-0.5"
     value={editor.getAttributes('textStyle').color || '#000000'}
     onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
   />
   ```
3. Verify trong admin: mở content editor sản phẩm, bôi đen 1 đoạn text,
   dùng color picker chọn màu tuỳ ý (không nằm trong 4 preset) — text phải
   đổi màu ngay trong Tiptap.
4. Verify màu tự do được giữ nguyên sau khi lưu + tải lại trang admin
   (edit lại sản phẩm vừa lưu).
5. Verify màu tự do hiện đúng ở public (phụ thuộc Phase 2 đã xong) —
   `product.content` render ra đúng màu đã chọn.
6. Chạy `npm run lint`/`npm run build` trong `frontend/`.

## Success Criteria

- [x] Color picker xuất hiện cạnh dropdown "Màu chữ", không phá layout
      toolbar hiện có.
- [x] Chọn màu tuỳ ý áp dụng ngay lên text đang chọn trong Tiptap.
- [x] Màu tự do được lưu và hiện đúng khi tải lại / xem ở public.
- [x] `frontend` lint + build sạch.

## Risk Assessment

Rủi ro thấp — chỉ thêm 1 input UI, dùng lại đúng API `setColor` đã có sẵn
và đã verify sanitizer backend chấp nhận mọi hex hợp lệ. Không có thay đổi
schema hay data format.
