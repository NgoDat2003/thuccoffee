---
phase: 1
title: "Fix anh vo trong content editor"
status: completed
priority: P1
effort: "30m"
dependencies: []
---

# Phase 1: Fix ảnh vỡ trong content editor

## Overview

`BlogAssetImage.tsx` (component render node ảnh trong Tiptap, dùng chung cho
mọi `ContentEditor` bất kể product hay blog) hardcode kiểm tra prefix
`blog-asset:`. Form sản phẩm (`ProductForm.tsx`) truyền
`assetUrlScheme="product-asset"`, nên ảnh chèn vào nội dung sản phẩm được
lưu `product-asset:<key>` — component không nhận diện được, ảnh hiện lỗi
ngay trong admin editor.

## Requirements

- Functional: ảnh chèn vào content editor (cả product và blog) phải render
  đúng URL bất kể `assetUrlScheme` là gì.
- Non-functional: không phá logic hiện có của blog (đã đúng, không được
  regress). Không cần thêm scheme mới ngoài `blog-asset`/`product-asset`
  hiện có — chỉ tổng quát hoá điều kiện nhận diện để tránh phải sửa lần 3
  nếu sau này thêm scheme khác.

## Architecture

Thay điều kiện cứng `persistedSrc.startsWith('blog-asset:')` bằng regex
tổng quát dạng `/^[a-z]+-asset:/` khớp mọi `<scheme>-asset:` rồi tách phần
object key sau dấu `:`. Không đổi cách `ContentEditor.tsx` hay
`ProductForm.tsx`/`AdminBlogFormPage.tsx` gọi `assetUrlScheme` — chỉ đổi
phía render.

## Related Code Files

- Modify: `frontend/src/components/admin/blog-editor/BlogAssetImage.tsx`

## Implementation Steps

1. Đọc `frontend/src/components/admin/blog-editor/BlogAssetImage.tsx` hiện
   tại (đã đọc ở brainstorm — dòng 6-9 là nơi cần sửa).
2. Thay:
   ```ts
   const displaySrc = persistedSrc.startsWith('blog-asset:')
     ? getImageUrl(persistedSrc.slice('blog-asset:'.length))
     : persistedSrc;
   ```
   bằng:
   ```ts
   const assetMatch = persistedSrc.match(/^([a-z-]+-asset):(.+)$/);
   const displaySrc = assetMatch ? getImageUrl(assetMatch[2]) : persistedSrc;
   ```
3. Verify bằng cách mở admin, tạo/sửa sản phẩm, chèn ảnh vào "Nội dung chi
   tiết" — ảnh phải hiện ngay trong Tiptap, không vỡ.
4. Verify blog vẫn hoạt động bình thường (mở `AdminBlogFormPage.tsx`, chèn
   ảnh — vẫn phải ra đúng như trước, không regress).
5. Chạy `npm run build` và `npm run lint` trong `frontend/`.
6. Chạy `npm run test:admin-ui` — baseline hiện tại 10/10 pass (verified
   2026-07-24). `blog-editor-compatibility.test.ts` chỉ kiểm tra
   `editor.getHTML()` (chuỗi lưu trữ), không mount `BlogAssetImage.tsx`
   (React NodeView không chạy trong test này) — thay đổi ở bước 2 không
   đổi output `getHTML()` nên không kỳ vọng regress, nhưng vẫn chạy lại để
   xác nhận.

## Success Criteria

- [x] Chèn ảnh vào content editor sản phẩm hiện đúng ảnh trong admin, không
      còn icon ảnh lỗi.
- [x] Blog vẫn chèn/hiện ảnh đúng như trước (không regress).
- [x] `frontend` lint + build sạch.

## Risk Assessment

Rủi ro thấp — thay đổi cô lập trong 1 component render, không đổi data
format lưu trữ hay API. Regex chặt (`[a-z-]+-asset:`) tránh khớp nhầm URL
http/https thật (không có dấu `-asset:` ở giữa).
