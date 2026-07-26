---
phase: 1
title: Them nut tai anh + chen theo vi tri con tro
status: completed
priority: P1
effort: 1h
dependencies: []
---

# Phase 1: Thêm nút tải ảnh + chèn theo vị trí con trỏ

## Overview

Thêm nút "Tải ảnh lên" trong `ContentEditor.tsx`, chỉ hiển thị khi
`mode === 'html'` (chế độ HTML thuần, dùng cho nội dung bị khóa Trực quan
vì cấu trúc legacy). Bấm nút → chọn file → upload qua `onUploadImage` (prop
đã có sẵn, cùng hàm dùng ở nhánh Trực quan) → chèn thẻ `<img>` vào đúng vị
trí con trỏ trong `<textarea>`.

## Requirements

- Functional: khi `mode === 'html'`, hiện 1 nút + input file ẩn cạnh
  textarea. Upload thành công → chèn
  `<img src="${assetUrlScheme}:${objectKey}">` vào `value` tại vị trí
  `textarea.selectionStart` hiện tại (không phải luôn nối cuối).
- Non-functional: dùng lại nguyên `onUploadImage`/`assetUrlScheme` props đã
  có — không đổi signature `ContentEditorProps`. Không đổi backend, không
  đổi sanitizer.
- Scope boundary: không đụng `classifyBlogHtmlForVisual` hay logic khóa
  legacy — giữ nguyên hoàn toàn. Không thêm tính năng khác cho chế độ HTML
  (không thêm toolbar, không thêm preview) ngoài đúng nút tải ảnh này.

## Architecture

`ContentEditor.tsx` hiện có state `uploading`, hàm `upload(file)` (dòng
49-61) chỉ dùng cho nhánh Trực quan — gọi `onUploadImage`, rồi
`editor.chain().focus().setImage(...)`. Cho nhánh HTML cần 1 hàm tương tự
nhưng thao tác trực tiếp trên chuỗi `value` (không có `editor` instance ở
nhánh này) và trên phần tử `<textarea>` DOM để biết vị trí con trỏ.

Thêm:
- `useRef<HTMLTextAreaElement>` riêng cho textarea (khác `inputRef` hiện có
  đang dùng cho input file của nhánh visual — cần 1 `inputRef` thứ 2 cho
  input file của nhánh HTML, hoặc dùng chung nếu tái cấu trúc được, nhưng
  ĐƠN GIẢN NHẤT là thêm ref/input riêng để tránh đụng logic nhánh visual
  đang chạy tốt).
- Hàm `uploadIntoHtml(file)`: gọi `onUploadImage(file)`, lấy
  `textarea.selectionStart`/`selectionEnd` tại thời điểm bấm nút, ghép
  chuỗi mới = `value.slice(0, start) + imgTag + value.slice(end)`, gọi
  `onChange(newValue)`.

## Related Code Files

- Modify: `frontend/src/components/admin/blog-editor/ContentEditor.tsx`

## Implementation Steps

1. Đọc lại `ContentEditor.tsx` hiện tại (đã đọc — 99 dòng, nhánh HTML ở
   dòng 85-94, chỉ có `<textarea>`).
2. Thêm state `htmlUploading` (tương tự `uploading` hiện có, tách riêng để
   không lẫn trạng thái loading giữa 2 nhánh).
3. Thêm `htmlTextareaRef = useRef<HTMLTextAreaElement>(null)` và
   `htmlInputRef = useRef<HTMLInputElement>(null)`.
4. Viết hàm:
   ```ts
   async function uploadIntoHtml(file?: File) {
     if (!file) return;
     setHtmlUploading(true);
     try {
       const objectKey = await onUploadImage(file);
       const textarea = htmlTextareaRef.current;
       const start = textarea?.selectionStart ?? value.length;
       const end = textarea?.selectionEnd ?? value.length;
       const imgTag = `<img src="${assetUrlScheme}:${objectKey}">`;
       onChange(value.slice(0, start) + imgTag + value.slice(end));
     } catch {
       // Form-level upload handler already surfaces a user-facing toast.
     } finally {
       setHtmlUploading(false);
       if (htmlInputRef.current) htmlInputRef.current.value = '';
     }
   }
   ```
5. Sửa nhánh render `mode === 'html'` (dòng 85-94): thêm 1 hàng nút phía
   trên `<textarea>`:
   ```tsx
   <div className="flex items-center justify-end border-b border-admin-border bg-admin-border-soft/35 p-2.5">
     <button
       type="button"
       disabled={htmlUploading}
       onClick={() => htmlInputRef.current?.click()}
       className="min-h-9 rounded-md border border-admin-border px-2.5 text-[12px] font-bold text-admin-ink hover:border-admin-accent disabled:opacity-40"
     >
       {htmlUploading ? 'Đang tải ảnh…' : 'Tải ảnh lên'}
     </button>
     <input
       ref={htmlInputRef}
       type="file"
       accept="image/jpeg,image/png,image/webp,image/gif"
       className="sr-only"
       onChange={(event) => void uploadIntoHtml(event.target.files?.[0])}
     />
   </div>
   <textarea ref={htmlTextareaRef} ... />
   ```
   (giữ nguyên toàn bộ props hiện có của `<textarea>`, chỉ thêm `ref`).
6. Verify trong admin: mở bài blog id=2 (đã xác nhận bị khóa HTML), bấm
   "Tải ảnh lên", chọn ảnh — thẻ `<img src="blog-asset:...">` phải xuất
   hiện đúng tại vị trí con trỏ đang đứng trong textarea.
7. Verify tương tự cho product — dán 1 đoạn `<span style="color:...">` vào
   ô nội dung chi tiết sản phẩm để tự kích hoạt chế độ HTML (đã có sẵn từ
   đợt trước), verify nút tải ảnh cũng hiện ra và chèn đúng
   `product-asset:` marker.
8. Chạy `npm run lint`/`npm run build`/`npm run test:admin-ui` trong
   `frontend/`.

## Success Criteria

- [x] Nút "Tải ảnh lên" chỉ hiện khi `mode === 'html'`, không xuất hiện ở
      chế độ Trực quan (nhánh đó giữ nguyên như cũ).
- [x] Upload ảnh ở chế độ HTML chèn đúng `<img>` tại vị trí con trỏ, không
      phải luôn nối cuối. (Sau code review phát hiện race condition khi
      gõ tiếp trong lúc chờ upload — đã fix bằng cách đọc live DOM
      `textarea.value` thay vì prop `value` đã đóng băng lúc gọi hàm.)
- [x] Hoạt động đúng cho cả blog (`blog-asset:`) và product
      (`product-asset:`) vì dùng chung component. (Xác nhận qua code
      review: cả 2 call site `AdminBlogFormPage.tsx`/`ProductForm.tsx`
      dùng chung `ContentEditor.tsx`.)
- [x] `frontend` lint + build sạch, `test:admin-ui` không regress. (10/10
      test pass, lint/build sạch — chạy lại sau khi fix race condition.)

## Risk Assessment

Rủi ro thấp — thêm 1 nhánh UI mới, không đổi logic nhánh Trực quan hay cơ
chế khóa legacy đang chạy đúng. Điểm cần chú ý: phải dùng `ref` riêng cho
`<textarea>` để đọc `selectionStart` tại đúng thời điểm bấm nút (không phải
tại thời điểm render) — nếu lấy sai thời điểm, ảnh có thể chèn nhầm vị trí
sau khi DOM re-render.
