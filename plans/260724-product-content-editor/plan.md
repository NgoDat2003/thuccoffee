---
title: "Product Content Editor - fix anh, public render, mau chu"
description: ""
status: completed
priority: P2
branch: "fix/product-content-editor"
tags: []
blockedBy: []
blocks: []
created: "2026-07-24T08:53:21.117Z"
createdBy: "ck:plan"
source: skill
---

# Product Content Editor - fix anh, public render, mau chu

## Overview

Sửa content editor sản phẩm (Tiptap, dùng chung code với blog qua
`ContentEditor.tsx`) — ảnh chèn vào bị vỡ vì component render ảnh hardcode
prefix `blog-asset:`, không nhận `product-asset:` mà form sản phẩm dùng.
Đồng thời `content` sản phẩm hiện không được public API/FE trả về hay hiển
thị ở đâu — thêm vào. Mở rộng dropdown màu chữ (giữ preset nhanh, thêm color
picker tự do). Scope engine giữ nguyên Tiptap, không đổi sang CKEditor/
TinyMCE. Phase 4 chỉ chạy sau khi owner duyệt phase 1-3 trên product —
port y hệt logic sang blog editor, không đổi/thêm gì khác.

Nguồn: `plans/reports/260724-product-content-editor-brainstorm.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Fix anh vo trong content editor](./phase-01-fix-anh-vo-trong-content-editor.md) | Completed |
| 2 | [Public render noi dung chi tiet san pham](./phase-02-public-render-noi-dung-chi-tiet-san-pham.md) | Completed |
| 3 | [Mo rong mau chu trong toolbar](./phase-03-mo-rong-mau-chu-trong-toolbar.md) | Completed |
| 4 | [Port sang blog sau khi owner OK](./phase-04-port-sang-blog-sau-khi-owner-ok.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->

## Validation Log

### Verification Results (2026-07-24)

- Claims checked: 8
- Verified: 8 | Failed: 0 | Unverified: 0
- Tier: Standard (4 phases)
- Đã verify trực tiếp bằng Grep/Read:
  - `BlogAssetImage.tsx` hardcode `blog-asset:`, `ProductForm.tsx:202` dùng
    `assetUrlScheme="product-asset"`, `AdminBlogFormPage.tsx:221` dùng
    `"blog-asset"` — khớp claim phase 1.
  - `products.schemas.ts` không có field `content` — khớp claim phase 2.
  - `products.service.ts` dòng 28-39 (select) và 119-137 (groupProducts)
    không có `content`, pattern `image`/`description` dùng
    `...(row.x === null ? {} : { x: row.x })` — khớp claim phase 2.
  - `ProductDetailPage.tsx` dòng 109 đóng grid, dòng 111 là
    `<RelatedProducts>` — khớp vị trí chèn block content ở phase 2.
  - `BlogEditorToolbar.tsx` dòng 57-74 dropdown màu chữ dùng
    `editor.getAttributes('textStyle').color` + `setColor`/`unsetColor` —
    khớp claim phase 3.

### Interview (2 câu hỏi, plan đơn giản nên dưới mức tối thiểu thường lệ)

1. **Kiểu dữ liệu `content` trong public schema** — giữ `.optional()` theo
   đúng pattern `image`/`description` hiện có trong cùng `productSchema`,
   không dùng `.nullable()`. Owner xác nhận: FE chỉ check truthy
   (`product.content &&`), không cần phân biệt undefined/null.
2. **Phạm vi phase 4** — giữ nguyên chỉ verify, không thêm việc mới cho
   blog ngoài những gì phase 1/3 tự động mang lại qua component dùng
   chung.

### Phát hiện bổ sung trong lúc validate

Chạy thử `npm run test:admin-ui` (baseline, trước khi implement) —
**10/10 pass**. `blog-editor-compatibility.test.ts` có test liên quan tới
`blog-asset` marker (dòng 28-34: "keeps blog-asset marker and image order
through Tiptap") nhưng chỉ kiểm tra `editor.getHTML()` — chuỗi HTML lưu
trữ, không mount React NodeView (`BlogAssetImage.tsx` không chạy trong môi
trường test này). Thay đổi ở phase 1 chỉ đổi cách **hiển thị** `src` trong
component React, không đổi cách Tiptap serialize `getHTML()` — nên không
kỳ vọng regress test này. Đã thêm bước chạy `test:admin-ui` vào cuối
Implementation Steps của phase 1 để xác nhận sau khi sửa.

### Whole-Plan Consistency Sweep

Đọc lại `plan.md` + toàn bộ 4 phase file sau khi cập nhật — không có
thuật ngữ/field/API cũ nào còn sót, không có mâu thuẫn giữa các phase.
Dependency chain (`1 → 2,3 → 4`) nhất quán với mô tả trong Overview. Không
có contradiction chưa giải quyết.

**Kết luận: sẵn sàng triển khai.** Không có Failed claim, không có mâu
thuẫn tồn đọng.
