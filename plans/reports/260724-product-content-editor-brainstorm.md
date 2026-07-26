# Brainstorm: Product Content Editor — fix bug ảnh + public render + màu chữ

Ngày: 2026-07-24. Nhánh: `fix/product-content-editor`. Scope: chỉ `product`,
blog editor để đợt sau (owner chốt rõ: "làm cho product trước oke rồi làm sau
cho blog").

## Vấn đề ban đầu (từ owner)

1. "ở sản phẩm chỗ chèn ảnh đang ảnh lỗi ko ra ảnh"
2. "chưa implement qua blog" — sau làm rõ: ý là muốn product content editor
   đạt mức hoàn thiện y như blog (đã có sẵn), không phải blog thiếu tính năng.

## Root cause đã verify

### Bug 1 — ảnh vỡ trong content editor sản phẩm

`frontend/src/components/admin/blog-editor/BlogAssetImage.tsx:7` hardcode
`persistedSrc.startsWith('blog-asset:')`. `ProductForm.tsx:202` truyền
`assetUrlScheme="product-asset"` cho `ContentEditor`, nên ảnh chèn vào nội
dung sản phẩm được lưu dạng `product-asset:<key>` — component render ảnh
không nhận diện prefix này, ảnh vỡ ngay trong admin editor.

Backend (`products-content-sanitizer.ts`) đã đúng từ trước — cho phép scheme
`product-asset` riêng biệt (khác `blog-asset`), chỉ thiếu nối dây ở FE.

### Bug 2 — nội dung chi tiết sản phẩm không lên public

`server/src/modules/products/products.schemas.ts` (public schema) không có
field `content` — chỉ `products.admin.schemas.ts` có. `products.service.ts`
(`selectProductRows`) không select cột `products.content`.
`frontend/src/pages/ProductDetailPage.tsx` không render field này ở đâu cả.
Kết quả: admin nhập "Nội dung chi tiết" nhưng không bao giờ ra public.

Verify: `frontend/src/pages/BlogDetailPage.tsx:39` là pattern đúng cần copy —
`resolveBlogContentImageUrls(post.content)` + `dangerouslySetInnerHTML`.

### Không phải bug — màu chữ

Test trực tiếp `sanitizeProductContent()` với input giống Tiptap
(`<span style="color: #ef4444">`) xác nhận màu đi qua đúng, không bị cắt.
Owner xác nhận ý thật là: dropdown "Màu chữ" trong `BlogEditorToolbar.tsx`
chỉ có 4 màu cố định, muốn thêm color picker tự do — đây là yêu cầu tính
năng, không phải lỗi.

## Giải pháp đã chốt với owner

### 1. Fix BlogAssetImage — generalize thay vì hardcode 1 scheme thêm

Đổi điều kiện nhận diện từ `startsWith('blog-asset:')` sang regex tổng quát
kiểu `<scheme>-asset:` (vd `/^[\w-]+-asset:/`), để dùng chung được cho
`blog-asset`/`product-asset` mà không phải sửa lần 3 nếu sau này có thêm
scheme khác. Tránh nhân đôi logic (DRY).

File: `frontend/src/components/admin/blog-editor/BlogAssetImage.tsx`

### 2. Public render `content` sản phẩm

- Thêm `content: z.string().nullable().optional()` vào `products.schemas.ts`.
- `products.service.ts`: select thêm `products.content`, gán vào object trả
  về trong `groupProducts`.
- Thêm `resolveProductContentImageUrls()` trong `frontend/src/lib/image-url.ts`
  (bản sao `resolveBlogContentImageUrls`, regex đổi sang `product-asset:`).
- `ProductDetailPage.tsx`: thêm block "Nội dung chi tiết" full-width, đặt
  sau grid 2 cột hiện có (ảnh + info/giá/option), trước `RelatedProducts`.
  Owner chốt: **nullable, chỉ hiện khi có giá trị** — không đổi layout cột
  phải hiện tại.

### 3. Mở rộng màu chữ — giữ dropdown nhanh + thêm color picker tự do

Owner chọn: giữ dropdown 4 màu cũ (thao tác nhanh 1-click cho màu hay dùng)
+ thêm control color picker tự do bên cạnh (không thay thế hẳn dropdown, vì
mất thao tác nhanh nếu chỉ còn color picker). Backend không cần đổi gì —
sanitizer đã chấp nhận mọi `#rrggbb` từ trước.

File: `frontend/src/components/admin/blog-editor/BlogEditorToolbar.tsx`

## Ngoài scope đợt này (đã chốt, không làm)

- Blog editor: giữ nguyên, không đổi engine, không thêm tính năng nào —
  đợt sau mới quay lại (owner: "blog tạm thời để sau").
- Không đổi Tiptap sang CKEditor/TinyMCE (owner xem ảnh site gốc, cân nhắc
  rồi chọn giữ Tiptap, chỉ vá + bổ sung).

## Next steps

`/ck:plan` — implementation plan theo 3 phase tương ứng 3 mục trên. Không
cần `--tdd` vì đây là bug fix + tính năng nhỏ trên UI/schema hiện có, không
đụng business logic phức tạp có test coverage sẵn cần khóa lại trước.
