---
phase: 5
title: "Blog form page + sticky save bar"
status: completed
priority: P1
effort: "4h"
dependencies: [2]
---

# Phase 5: Blog form — trang riêng, 2 cột, sticky save bar

## Overview

Blog form là form DUY NHẤT giữ trang riêng (quyết định drawer: content editor
dài + preview không hợp drawer — product/store/banner đã chuyển drawer ở phase
3-4). Reskin theo view `isBlogForm`: 2 cột + underline inputs + card "Xuất
bản" + sticky save bar. Logic (state, submit, validate map lỗi, slug lock,
unsaved guard, preview sanitized) GIỮ NGUYÊN.

## Nguồn design

View `isBlogForm` trong `./design-reference-espresso.dc.html`: back link
(arrow + "Danh sách bài viết") trên title 34px/900; trái: title/slug/summary
underline input + content textarea box; phải: cover dropzone (ImageField phase
2) + card "Xuất bản" (publish toggle + input ngày đăng). Sticky bar đáy-phải:
"Hủy" text + "Lưu bài viết" pill copper.

**Lệch behavior đã chốt:** design vẽ publish toggle TRONG form; hiện tại
publish là PATCH riêng. Card "Xuất bản" hiển thị trạng thái + toggle gọi
`usePublishBlogPost` sẵn có (mutation riêng, KHÔNG gộp vào PUT update — giữ
contract API); publishedAt vẫn là field trong form như hiện tại. Nút preview
an toàn GIỮ (design không vẽ nhưng là chức năng đã có — đặt cạnh label
content cùng idiom nút text). Toggle publish chỉ hiện khi EDIT (bài chưa tạo
thì chưa có gì để publish).

## Requirements

- Functional: create/update/validate lỗi field/slug lock/unsaved guard/
  preview sanitized giữ nguyên; "Hủy" trên sticky bar navigate về list (qua
  unsaved guard tự nhiên); toggle publish (edit) dùng mutation sẵn có.
- Non-functional: form container padding-bottom ≥ chiều cao sticky bar; FE
  lint/build sạch.

## Related Code Files

- Modify: `src/pages/admin/AdminBlogFormPage.tsx`
- Read for context: view isBlogForm trong file design;
  `src/services/admin/blog.service.ts` (usePublishBlogPost — dùng, không sửa)

## Implementation Steps

1. Reskin AdminBlogFormPage: back link + 2 cột + card Xuất bản + sticky bar;
   preview giữ.
2. FE lint/build; dev: tạo/sửa bài đầy đủ luồng, lỗi validate đúng field,
   guard chặn dirty, preview sanitize, toggle publish trong form phản ánh
   list + public.

## Success Criteria

- [ ] Form khớp view isBlogForm; sticky bar không che nội dung.
- [ ] Toàn bộ hành vi cũ không đổi; publish toggle dùng mutation riêng sẵn có,
      chỉ hiện khi edit.
- [ ] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** sticky bar + useBlocker dialog chồng z-index — dialog native
  luôn top-layer; kiểm dev.
- **Rủi ro:** toggle publish trong form + PublishSwitch ngoài list cùng bài —
  invalidate sẵn có đồng bộ cả hai; kiểm dev.
