---
title: Nut tai anh cho che do HTML thuan trong ContentEditor
description: ''
status: completed
priority: P2
branch: fix/product-content-editor
tags: []
blockedBy: []
blocks: []
created: '2026-07-24T10:29:39.410Z'
createdBy: 'ck:plan'
source: skill
---

# Nut tai anh cho che do HTML thuan trong ContentEditor

## Overview

Bài viết/sản phẩm có cấu trúc HTML legacy (`<span style>`/`<div style>`) bị
`classifyBlogHtmlForVisual` khóa về chế độ HTML thuần trong `ContentEditor.tsx`
— đây là hành vi đúng, giữ nguyên (Tiptap không round-trip được span/div style
mà không làm sai lệch cấu trúc, đã verify bằng thực nghiệm ở đợt trước). Nhưng
chế độ HTML thuần hiện chỉ có `<textarea>` trần, không có cách nào chèn ảnh
mới qua UI — người dùng phải biết trước object key MinIO để tự gõ tay marker
`blog-asset:`/`product-asset:`.

Thêm nút "Tải ảnh lên" khi ở chế độ HTML: bấm nút → chọn file → upload qua
`onUploadImage` (prop đã có) → chèn `<img src="scheme:key">` tại vị trí con
trỏ trong textarea. Vì `ContentEditor.tsx` dùng chung cho cả blog và product,
sửa 1 lần áp dụng cho cả hai.

Nguồn: `plans/reports/260724-content-editor-html-mode-image-upload-brainstorm.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Them nut tai anh + chen theo vi tri con tro](./phase-01-them-nut-tai-anh-chen-theo-vi-tri-con-tro.md) | Completed |
| 2 | [Verify blog va product deu dung duoc](./phase-02-verify-blog-va-product-deu-dung-duoc.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->

## Kết quả

Owner đã tự tay verify trên trình duyệt (2026-07-24): nút tải ảnh hoạt động
đúng ở chế độ HTML cho cả blog và product, không mất nội dung khi gõ tiếp
lúc chờ upload (race condition đã fix qua code review được xác nhận không
còn tái hiện). Plan hoàn tất.
