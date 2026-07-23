---
phase: 7
title: "Admin API blog + sanitize"
status: completed
priority: P1
effort: "1d"
dependencies: [6]
---

# Phase 7: Admin API blog — pagination server + sanitize HTML

## Overview

CRUD API blog theo pattern phase 4, khác biệt: list server pagination+search
(267 bài) và sanitize HTML allow-list khi lưu content. Allow-list TRÍCH TỪ DATA
THẬT trước khi chốt (red-team #5 vòng brainstorm: sanitize quá chặt vỡ format
bài cũ).

## Requirements

- Functional: list phân trang+search; detail/create/update/publish; sanitize
  content khi lưu; slug khóa.
- Non-functional: sanitize là HÀM THUẦN export được (FE preview dùng chung
  logic — red-team #5); không mất format khi chạy trên mẫu bài thật.

## Architecture

### Bước 0 bắt buộc: khảo sát tag thật
Script một lần (chạy trong impl, không commit): query DISTINCT tag/attr xuất
hiện trong `blog_posts.content` (regex trên 267 bài) → chốt allow-list từ kết
quả. Dự kiến (xác nhận bằng data): `p, h2, h3, h4, strong, em, u, a[href],
img[src,alt], ul, ol, li, blockquote, br, figure, figcaption, iframe[src
youtube-nocookie]?` — iframe CHỈ giữ nếu data thật có video nhúng, ngược lại bỏ.
Attr `src` của img phải giữ pattern `blog-asset:` marker (FE resolve) — sanitize
KHÔNG được phá marker này.

### Sanitizer
- Dep: `sanitize-html` + types (chuẩn ngành, không tự viết parser HTML —
  tự viết là lỗ hổng chắc chắn).
- `server/src/modules/blog/blog-content-sanitizer.ts`: hàm thuần
  `sanitizeBlogContent(html): string` với allow-list đã chốt. Export type +
  hàm để FE import (quy ước type-sharing dự án; sanitize-html chạy được cả
  browser — nếu bundle nặng, FE fallback gọi endpoint preview, chốt lúc impl
  phase 8).

### Endpoints (`blog.admin.routes.ts` trong module blog)
```
GET    /api/admin/blog?page=&limit=&q=   → pagination meta (tái dùng pattern
                                           public blog); q search title/slug
                                           ILIKE; trả cả unpublished
GET    /api/admin/blog/:id
POST   /api/admin/blog                   → title, slug, cover (object key),
                                           summary, content (sanitize trước
                                           khi lưu), publishedAt; 409 slug trùng
PUT    /api/admin/blog/:id               → mọi field trừ slug; content sanitize
PATCH  /api/admin/blog/:id/publish       → { isPublished }
```

### Smoke `smoke-admin-blog.ts`
1. Guard 401 mọi endpoint.
2. Pagination: page/limit đúng meta; q search khớp.
3. Create → 201; slug trùng → 409; đổi slug khi update → 400.
4. **Sanitize:** POST content chứa `<script>alert(1)</script>` + `<img
   onerror=...>` + `<a href="javascript:...">` → record lưu KHÔNG còn các vector
   này; content hợp lệ (p/h2/img blog-asset) giữ NGUYÊN VẸN byte-по-byte.
5. Publish toggle phản ánh public `GET /api/blog`.
6. Cleanup SQL record test.

## Related Code Files

- Create: `server/src/modules/blog/blog.admin.{routes,schemas}.ts`,
  `server/src/modules/blog/blog-content-sanitizer.ts`,
  `server/scripts/smoke-admin-blog.ts`
- Modify: `server/src/modules/admin/admin.routes.ts` (mount `/blog`),
  `server/package.json` (dep sanitize-html + script)
- Read for context: `server/src/modules/blog/blog.routes.ts` (pagination
  pattern), mẫu content thật trong DB

## Implementation Steps

1. Khảo sát tag thật 267 bài → chốt allow-list (ghi vào sanitizer kèm comment
   nguồn gốc).
2. Cài sanitize-html; viết sanitizer thuần + unit-style check trong smoke.
3. Smoke đỏ baseline.
4. Schemas + routes theo pattern phase 4.
5. Mount; lint/build; smoke XANH; chạy sanitize thử trên 5 bài thật dài nhất →
   diff phải rỗng (không mất format).

## Success Criteria

- [x] `smoke:admin-blog` XANH.
- [x] Sanitize chặn script/onerror/javascript: URI; giữ nguyên 5 bài thật
      (diff rỗng).
- [x] Marker `blog-asset:` sống sót qua sanitize.
- [x] Pagination + search đúng meta.
- [x] Server lint/build sạch.

## Risk Assessment

- **Rủi ro cao:** allow-list chặn nhầm tag data thật dùng → mất format hàng
  loạt khi admin bấm lưu bài cũ. Giảm thiểu: bước 0 khảo sát + success
  criterion diff rỗng trên bài thật.
- **Rủi ro:** sanitize-html strip attr `src="blog-asset:..."` vì scheme lạ.
  Cấu hình `allowedSchemes`/`allowProtocolRelative` cho phép marker; test rõ
  trong smoke assert 4.
