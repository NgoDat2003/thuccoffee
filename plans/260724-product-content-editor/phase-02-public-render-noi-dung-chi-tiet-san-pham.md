---
phase: 2
title: "Public render noi dung chi tiet san pham"
status: completed
priority: P1
effort: "1.5h"
dependencies: [1]
---

# Phase 2: Public render nội dung chi tiết sản phẩm

## Overview

`content` sản phẩm (nhập qua Tiptap trong admin) hiện chỉ tồn tại ở admin
schema/service, không có trong public schema/service, và
`ProductDetailPage.tsx` không render field này ở đâu cả. Kết quả: nội dung
admin nhập không bao giờ lên trang công khai. Thêm field vào public API,
resolve marker ảnh `product-asset:`, và render trên trang chi tiết sản
phẩm — chỉ hiện khi có giá trị (nullable).

## Requirements

- Functional: `GET /api/products/:slug` trả thêm field `content` (nullable).
  `ProductDetailPage.tsx` hiện block "Nội dung chi tiết" full-width khi
  `content` không rỗng; ẩn hoàn toàn khi null/rỗng.
- Non-functional: theo đúng pattern đã có ở blog
  (`resolveBlogContentImageUrls` + `dangerouslySetInnerHTML` trong
  `BlogDetailPage.tsx`) — không phát minh cách khác.
- Scope boundary: không đổi layout grid 2 cột hiện có (ảnh + info/giá/
  option) — block content là phần thêm mới, đặt sau grid đó.

## Architecture

Backend: thêm `content` vào `productSchema` (public), select thêm cột
`products.content` trong `selectProductRows`, gán vào object product trong
`groupProducts`.

Frontend: thêm `resolveProductContentImageUrls()` trong `image-url.ts` —
bản sao của `resolveBlogContentImageUrls` nhưng regex bắt `product-asset:`
thay vì `blog-asset:`. `ProductDetailPage.tsx` thêm block render content
sau phần `grid grid-cols-1 md:grid-cols-2` hiện có, trước
`<RelatedProducts>`.

## Related Code Files

- Modify: `server/src/modules/products/products.schemas.ts`
- Modify: `server/src/modules/products/products.service.ts`
- Modify: `frontend/src/lib/image-url.ts`
- Modify: `frontend/src/pages/ProductDetailPage.tsx`

## Implementation Steps

1. `server/src/modules/products/products.schemas.ts` — thêm vào
   `productSchema`:
   ```ts
   content: z.string().optional(),
   ```
   (theo đúng pattern `image`/`description` hiện có trong cùng schema —
   optional, field null từ DB thì omit khi serialize).

2. `server/src/modules/products/products.service.ts`:
   - `selectProductRows` (dòng ~28-39): thêm `content: products.content,`
     vào object select.
   - `groupProducts` (dòng ~124-136): thêm
     `...(row.content === null ? {} : { content: row.content }),`
     theo đúng pattern `image`/`description` đã có ngay bên trên.

3. `frontend/src/lib/image-url.ts` — thêm sau
   `resolveBlogContentImageUrls`:
   ```ts
   const productAssetPattern = /src="product-asset:([^"]+)"/g;

   export function resolveProductContentImageUrls(content: string): string {
     return content.replace(productAssetPattern, (_, objectKey: string) => (
       `src="${getImageUrl(objectKey)}"`
     ));
   }
   ```

4. `frontend/src/pages/ProductDetailPage.tsx`:
   - Import `resolveProductContentImageUrls` từ `../lib/image-url`.
   - Sau thẻ đóng `</div>` của grid 2 cột (dòng 109) và trước
     `<RelatedProducts ...>` (dòng 111), thêm:
     ```tsx
     {product.content && (
       <div
         className="mt-10 text-gray-700 [&_a]:text-primary [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:my-3"
         dangerouslySetInnerHTML={{ __html: resolveProductContentImageUrls(product.content) }}
       />
     )}
     ```
     (className copy từ `BlogDetailPage.tsx:38` để nhất quán style rich-text
     giữa 2 trang).

5. Verify: sửa 1 sản phẩm trong admin, thêm nội dung + ảnh vào "Nội dung
   chi tiết", lưu. Mở trang chi tiết sản phẩm đó ở public — nội dung và
   ảnh phải hiện đúng, ảnh phải ra đúng URL MinIO.

6. Verify sản phẩm không có `content` (null) — trang chi tiết không hiện
   block này, không có khoảng trắng thừa hay lỗi render.

7. Chạy smoke test liên quan nếu có (`server/scripts/smoke-api.ts`) để chắc
   chắn không phá field cũ. Chạy `npm run build`/`npm run lint` ở cả
   `frontend/` và `server/`.

## Success Criteria

- [x] `GET /api/products/:slug` trả `content` khi sản phẩm có nội dung,
      omit field khi null.
- [x] Trang chi tiết sản phẩm public hiện đúng nội dung + ảnh khi có
      `content`.
- [x] Sản phẩm không có `content` — trang chi tiết không đổi gì (ẩn hoàn
      toàn block).
- [x] `frontend` + `server` lint/build sạch.

## Risk Assessment

Rủi ro thấp-trung bình — thêm field mới vào response public, không đổi
field cũ nên không breaking. Điểm cần chú ý: `content` sản phẩm đã qua
`sanitizeProductContent()` ở phía admin lúc lưu (đã verify không mất màu/
style), nên public chỉ cần resolve marker ảnh, không cần sanitize lại lần
2.
