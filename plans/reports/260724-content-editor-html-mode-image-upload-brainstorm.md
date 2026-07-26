# Brainstorm: Nút tải ảnh cho chế độ HTML thuần trong ContentEditor

Ngày: 2026-07-24. Nhánh: `fix/product-content-editor` (tiếp tục đợt product
content editor). Nguồn gốc câu hỏi: owner hỏi tại sao không chèn được ảnh ở
`/admin/blog/2` (bài "Deal on Day - Chill all Day", slug
`deal-on-day-chill-all-day-s1468t2`).

## Vấn đề đã verify

Bài id=2 chứa `<span style="color:#003366">` và `<div style="text-align:center">`
bao quanh toàn bộ nội dung (đã query trực tiếp DB xác nhận). Đây là cấu trúc
"legacy" bị `classifyBlogHtmlForVisual` khóa về chế độ HTML thuần — hành vi
đúng thiết kế (đã brainstorm ở đợt trước, xác nhận Tiptap không thể round-trip
span/div style mà không làm sai lệch cấu trúc/màu — 0/245 bài pass khi thử
nghiệm thêm custom extension).

Khoảng trống thật sự phát hiện lần này: `ContentEditor.tsx` khi
`mode === 'html'` chỉ render `<textarea>` thuần (dòng 86), không có input
file hay nút upload nào — nhánh đó chỉ tồn tại trong `mode === 'visual'`
(dòng 79-83, `BlogEditorToolbar` + input file ẩn). Nghĩa là bài nào bị khóa
HTML thì **không có cách nào chèn ảnh mới qua UI** — phải biết trước object
key MinIO để tự gõ tay marker `blog-asset:<key>`, không thực tế.

## Giải pháp đã chốt

Thêm nút "Tải ảnh lên" + input file ẩn, chỉ hiển thị khi `mode === 'html'`,
đặt phía trên hoặc cạnh `<textarea>` trong `ContentEditor.tsx`. Luồng xử lý:

1. Người dùng bấm nút → chọn file.
2. Gọi `onUploadImage(file)` (prop đã có sẵn, dùng chung với nhánh visual) →
   nhận về `objectKey`.
3. Ghép `<img src="${assetUrlScheme}:${objectKey}">` (dùng đúng
   `assetUrlScheme` prop đã có — `blog-asset` cho blog, `product-asset` cho
   product, không hardcode).
4. Chèn chuỗi đó vào `value` tại vị trí con trỏ hiện tại
   (`textarea.selectionStart`/`selectionEnd`), gọi `onChange` với giá trị
   mới.

Vì `ContentEditor.tsx` dùng chung cho cả `ProductForm.tsx` và
`AdminBlogFormPage.tsx`, thay đổi này tự động áp dụng cho cả hai — không
cần sửa thêm 2 nơi gọi component.

## Không đổi

- Không đụng `classifyBlogHtmlForVisual`/cơ chế khóa legacy — giữ nguyên
  quyết định đã chốt ở đợt trước.
- Không đổi API `onUploadImage`/`assetUrlScheme` — chỉ thêm 1 nhánh UI mới
  dùng lại đúng props đã có.
- Không đổi backend — sanitizer đã cho phép marker `blog-asset`/
  `product-asset` từ trước.

## Next steps

`/ck:plan` — tạo phase implementation cho thay đổi này trong
`ContentEditor.tsx`.
