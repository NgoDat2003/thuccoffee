# Product Content Editor - fix ảnh vỡ, public render, màu chữ tự do

**Ngày:** 2026-07-24
**Nhánh:** `fix/product-content-editor`
**Phạm vi:** Sửa lỗi ảnh vỡ trong Tiptap content editor của sản phẩm (ảnh hưởng bởi asset scheme prefix `product-asset:`), cập nhật schema và service backend để trả về nội dung sản phẩm qua API công khai, hiển thị nội dung chi tiết trên giao diện chi tiết sản phẩm ở frontend, và mở rộng thanh công cụ editor với color picker chọn màu tự do bên cạnh các preset.

## Quá trình thực hiện & Kết quả

### 1. Fix ảnh vỡ trong editor (Phase 1)
- Lỗi phát sinh do component `BlogAssetImage.tsx` (dùng chung cho cả blog và product editor) kiểm tra cứng prefix `blog-asset:` trong khi dữ liệu sản phẩm lưu dưới dạng `product-asset:<key>`.
- Khắc phục bằng cách tổng quát hóa regex thành `/^([a-z-]+-asset):(.+)$/` để khớp với mọi `<scheme>-asset:` format (bao gồm cả `blog-asset` và `product-asset`), tách key và gọi `getImageUrl()`. Cách làm này giúp code linh hoạt hơn mà không phá vỡ logic cũ của blog.

### 2. Trả và render nội dung sản phẩm ở trang công khai (Phase 2)
- Bổ sung `content` dưới dạng optional string vào Zod schema public (`productSchema` trong `products.schemas.ts`).
- Cập nhật backend service (`products.service.ts`): select cột `products.content` và gán vào object product nếu có giá trị.
- Phía frontend: tạo hàm `resolveProductContentImageUrls` trong `image-url.ts` để phân giải các marker `product-asset:<key>` thành URL MinIO công khai khi render HTML.
- Trang chi tiết sản phẩm (`ProductDetailPage.tsx`) được cập nhật để render HTML an toàn từ `product.content` (nếu có giá trị) bằng `dangerouslySetInnerHTML` và style thống nhất với trang blog chi tiết.

### 3. Thêm Color Picker chọn màu chữ tự do (Phase 3)
- Dropdown chọn màu chữ cũ chỉ hỗ trợ 4 preset cố định. Đã bổ sung thêm một `<input type="color">` ngay cạnh select box trong `BlogEditorToolbar.tsx`.
- Color picker này lấy giá trị hiện tại của văn bản được chọn thông qua `editor.getAttributes('textStyle').color` và áp dụng màu được chọn trực tiếp vào Tiptap editor qua command `editor.chain().focus().setColor(hex).run()`.
- Việc lưu trữ và hiển thị ở cả admin và public đều hoạt động mượt mà do bộ lọc `sanitize-html` của backend vốn đã chấp nhận giá trị hex của style color.

### 4. Đánh giá tính tương thích và Regression (Phase 4)
- Kiểm tra toàn bộ trang blog (cả giao diện admin editor lẫn trang chi tiết blog công khai). Do dùng chung các components `BlogAssetImage` và `BlogEditorToolbar`, blog tự động kế thừa các nâng cấp trên mà không phát sinh lỗi.
- Đã chạy 10/10 test case trong `frontend` (bao gồm test tương thích HTML của blog editor) và 9/9 api smoke test trong `server`. Tất cả đều pass 100%.

## Bài học kinh nghiệm

- **Tận dụng linh hoạt components dùng chung:** Việc blog và product chia sẻ các UI logic (`ContentEditor`, `BlogEditorToolbar`, `BlogAssetImage`) giúp giảm công sức phát triển nhưng đồng thời đặt ra yêu cầu kiểm tra kỹ blast radius. Việc tổng quát hóa regex cho asset scheme là hướng đi an toàn và mở rộng tốt.
- **Backend sanitizer sẵn có:** Trước khi triển khai một tính năng thay đổi định dạng dữ liệu (như màu sắc tự do ở frontend), việc kiểm tra kỹ bộ lọc backend (`sanitize-html`) giúp loại bỏ các bước xử lý/sửa đổi API backend không cần thiết (YAGNI).

## Verify

- Plan `260724-product-content-editor`: 4/4 phase completed.
- Frontend: `npm run lint` sạch, `npm run build` thành công, `vitest` pass 10/10.
- Server: `npm run lint` sạch, `npm run build` thành công, `npm run smoke:api` pass 9/9.
- Chưa commit theo quy ước.
