---
phase: 2
title: Verify blog va product deu dung duoc
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
---

# Phase 2: Verify blog và product đều dùng được

## Overview

Xác nhận nút tải ảnh mới hoạt động đúng ở cả 2 nơi dùng chung
`ContentEditor.tsx` (blog và product), và không có tác dụng phụ lên nhánh
Trực quan hay cơ chế khóa legacy.

## Requirements

- Functional: verify bằng thao tác thật trên trình duyệt (không chỉ đọc
  code) cho cả 2 form.
- Non-functional: không có regression ở nhánh Trực quan, không đổi hành vi
  `classifyBlogHtmlForVisual`.

## Architecture

Không có thay đổi kiến trúc — phase verify thuần.

## Related Code Files

Không sửa file. Đọc lại để verify:
- `frontend/src/pages/admin/AdminBlogFormPage.tsx`
- `frontend/src/components/admin/forms/ProductForm.tsx`
- `frontend/src/components/admin/blog-editor/ContentEditor.tsx` (đã sửa ở
  phase 1)

## Implementation Steps

1. Rebuild Docker frontend (`docker compose build frontend --no-cache` +
   `docker compose up -d frontend`) để bundle mới phản ánh thay đổi phase 1
   — dự án này đã gặp vấn đề cache Docker layer nhiều lần trong đợt trước,
   luôn rebuild `--no-cache` để chắc chắn.
2. Mở `/admin/blog/2` (bài "Deal on Day - Chill all Day", đã xác nhận bị
   khóa HTML) — verify nút "Tải ảnh lên" xuất hiện, upload 1 ảnh thử, xác
   nhận `<img src="blog-asset:...">` xuất hiện đúng vị trí con trỏ.
3. Mở 1 bài blog khác không bị khóa (đang ở chế độ Trực quan) — verify nút
   "Tải ảnh lên" của chế độ HTML KHÔNG xuất hiện (chỉ nhánh Trực quan với
   toolbar đầy đủ hiện ra), xác nhận không có regression.
4. Mở form sửa sản phẩm, dán `<span style="color:#111">test</span>` vào ô
   nội dung chi tiết để tự kích hoạt chế độ HTML (theo cơ chế đã thêm ở đợt
   trước) — verify nút tải ảnh cũng xuất hiện, chèn đúng
   `product-asset:...`.
5. Verify sản phẩm không có nội dung legacy vẫn dùng bình thường ở chế độ
   Trực quan với toolbar đầy đủ (đậm/nghiêng/màu chữ/color picker) — không
   bị ảnh hưởng bởi thay đổi này.
6. Chạy lại `npm run test:admin-ui`, `npm run lint`, `npm run build` lần
   cuối trước khi coi là hoàn tất.

## Success Criteria

- [x] Blog: bài bị khóa HTML tải ảnh được, bài không bị khóa vẫn dùng Trực
      quan bình thường. Owner xác nhận đã tự tay thử trên trình duyệt,
      đúng như mong đợi.
- [x] Product: kích hoạt chế độ HTML (dán span/div) tải ảnh được, sản phẩm
      thường vẫn dùng Trực quan bình thường. Owner xác nhận đã tự tay thử.
- [x] Không regression ở toolbar Trực quan (đậm/nghiêng/màu chữ/color
      picker) của cả 2 form. Xác nhận qua diff: nhánh `mode === 'visual'`
      hoàn toàn không bị đụng tới.
- [x] `test:admin-ui`/lint/build sạch lần chạy cuối. 10/10 test pass,
      lint/build sạch (chạy sau khi fix race condition ở phase 1).

## Risk Assessment

Rủi ro thấp — phase verify, không viết code mới. Rủi ro duy nhất là quên
rebuild Docker container (đã xảy ra 2 lần trong đợt trước của cùng dự án)
khiến verify trên trình duyệt cho kết quả sai (nhìn thấy bundle cũ), nên
bước 1 (rebuild `--no-cache`) là bắt buộc trước khi verify bằng mắt.
