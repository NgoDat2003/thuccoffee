---
phase: 4
title: "Blog"
status: completed
priority: P2
effort: "3h"
dependencies: [1]
---

# Phase 4: Blog

## Overview

Chuyển BlogIndexPage (phân trang từ `meta`, bỏ hardcode 54), BlogDetailPage (date format,
related, content từ API), BlogCard, BlogPagination, BlogCarousel sang hook. Thêm
`formatDate()`. Đây là phase phức tạp nhất (date + phân trang + content).

## Requirements

- Functional: blog list phân trang từ `meta.totalPages`; detail hiện content từ API;
  date hiển thị 'DD.MM.YYYY'; related từ trang đầu.
- Non-functional: loading/error; build/lint sạch.

## Architecture

**Đã verify:**
- `useBlogPage(page)` trả `{data: BlogListItem[], meta}` (`apiGetPaginated`).
- `useBlogPost(slug)` trả `BlogDetail` gồm `content` (`blog.service.ts:67,78` — API detail
  trả `content`). → **bỏ lazy-load `blog-content.ts`**, dùng API content.
- Backend `perPage=5`; `meta.totalPages` thay `BLOG_PAGE_COUNT=54` hardcode.
- Date BE là ISO datetime; FE cũ hiển thị 'DD.MM.YYYY'.

**Date:** thêm `formatDate(iso: string): string` → 'DD.MM.YYYY' vào `src/lib/format.ts`
(cạnh `formatPrice`). BlogCard + BlogDetail gọi.

- **BlogIndexPage**: `getBlogPage(page)` → `useBlogPage(page)`; dùng `meta.totalPages`;
  loading→skeleton grid; page ngoài range → Navigate. Bỏ import `BLOG_PAGE_COUNT`.
- **BlogPagination**: nhận `totalPages` prop thay `import BLOG_PAGE_COUNT`.
- **BlogDetailPage**: `getBlogBySlug` → `useBlogPost(slug)`; content từ `data.content`
  (bỏ `useEffect` lazy-load `blog-content.ts`); date `formatDate`; related từ
  `useBlogPage(1)` lọc bỏ bài hiện tại; 404→Navigate; giữ mẫu error/retry hiện có nếu hợp.
- **BlogCard**: date `formatDate(post.date)`; type BE `BlogListItem`.
- **BlogCarousel** (Home): đọc blog list → `useBlogPage(1)`.

## Related Code Files

- Modify: `src/lib/format.ts` — thêm `formatDate`.
- Modify: `src/pages/BlogIndexPage.tsx`, `src/pages/BlogDetailPage.tsx`.
- Modify: `src/components/blog/BlogCard.tsx`, `src/components/blog/BlogPagination.tsx`,
  `src/components/home/BlogCarousel.tsx`.
- Create: blog skeleton (inline hoặc component).
- (`src/data/blog-content.ts` — sẽ dừng dùng; xóa ở Phase 6 sau khi chắc 0 ref.)

## Implementation Steps

1. `formatDate(iso)` vào `format.ts` — parse ISO → 'DD.MM.YYYY' theo **UTC**
   (`getUTCDate`/`getUTCMonth`/`getUTCFullYear` + pad), khớp ngày lưu DB, không lệch
   theo múi giờ máy user. Xử lý input rỗng/không hợp lệ an toàn (trả '' hoặc nguyên chuỗi).
2. BlogCard: `formatDate(post.date)`, type BE.
3. BlogPagination: prop `totalPages`.
4. BlogIndexPage: `useBlogPage(page)`, dùng `meta.totalPages`, skeleton, truyền
   `totalPages` xuống BlogPagination.
5. BlogDetailPage: `useBlogPost`, content từ API, date format, related từ `useBlogPage(1)`,
   bỏ lazy `blog-content`.
6. BlogCarousel: `useBlogPage(1)`.
7. `npm run build` + `npm run lint`; runtime verify (/chuyen-cua-thuc, /t1p2, 1 bài detail).

## Success Criteria

- [x] Blog list phân trang từ `meta.totalPages`; không còn `BLOG_PAGE_COUNT` hardcode.
- [x] Blog detail content từ API; không còn lazy-load `blog-content.ts`.
- [x] Date hiển thị 'DD.MM.YYYY' qua `formatDate`.
- [x] Related bài viết từ `useBlogPage(1)`.
- [x] `npm run build` + `npm run lint` sạch.

## Risk Assessment

- **Content HTML từ API vs lazy cũ.** API detail đã trả `content`; verify content render
  đúng (dangerouslySetInnerHTML + `resolveBlogContentImageUrls` giữ nguyên). Ảnh trong
  content vẫn qua `getImageUrl`/resolve.
- **totalPages: 267 bài / 5 = 54 trang.** `meta.totalPages` từ backend phải khớp 54;
  verify runtime trang cuối.
- **Date parse ISO lệch timezone.** Chốt **UTC** (`getUTC*`) để khớp ngày lưu DB,
  không lệch theo máy user. Verify 1 bài có date biết trước.
- **BlogPagination đổi từ import→prop.** Mọi nơi render BlogPagination phải truyền
  totalPages (chỉ BlogIndexPage dùng — verify grep).
