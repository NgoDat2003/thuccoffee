---
phase: 2
title: "Blog phân trang thật"
status: completed
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Blog phân trang thật

## Overview

Module blog: list phân trang thật theo 267 bài (`okPaginated` + meta từ COUNT,
perPage=5) và chi tiết theo slug. Bỏ hành vi giả 54 trang của FE — số trang tính
từ dữ liệu thật.

## Requirements

- Functional: `GET /api/blog?page=` trả 5 bài/trang + `meta{page,pageSize,total,
  totalPages}`; `GET /api/blog/:slug` trả 1 bài kèm `content` hoặc 404; chỉ
  `is_published=true`; sắp theo `published_at DESC`.
- Non-functional: page mặc định 1, validate page là số nguyên dương; type infer
  từ Zod.

## Architecture

- `blog.schemas.ts`: `listBlogQuerySchema` (`page: z.coerce.number().int().
  positive().default(1)`), `blogListItemSchema` (title, slug, cover, date,
  summary — khớp `BlogPost` FE), `blogDetailSchema` (thêm `content`).
- `blog.service.ts`:
  - `listBlog(page, perPage=5)`: 1 query COUNT (where is_published) + 1 query
    SELECT limit/offset order published_at DESC. Trả `{ items, total }`.
  - `getBlogBySlug(slug)`: 1 bài + content, where is_published.
- `blog.routes.ts`: `GET /` → tính `totalPages = ceil(total/perPage)` →
  `okPaginated(items, meta)`; `GET /:slug` → `ok` hoặc 404.
- **date:** DB là `date`; response giữ chuỗi hay Date? Trả **ISO string**
  (`published_at`), FE format sau. Không trả `'DD.MM.YYYY'` như cũ.

## Related Code Files

- Create: `server/src/modules/blog/{blog.schemas,blog.service,blog.routes}.ts`
- Modify: `server/src/index.ts` (đăng ký `/api/blog`)

## Implementation Steps

1. `blog.schemas.ts` — query + list item + detail schema.
2. `blog.service.ts` — `listBlog` (COUNT + SELECT paginated), `getBlogBySlug`.
3. `blog.routes.ts` — 2 route, tính meta, 404 cho slug sai.
4. Đăng ký `/api/blog` ở `index.ts`.
5. build+lint sạch; curl `/api/blog?page=1`, `?page=2`, `?page=54`, `/:slug`.

## Success Criteria

- [x] `curl /api/blog?page=1` trả 5 bài + meta `{page:1,pageSize:5,total:267,
      totalPages:54}`.
- [x] `?page=2` trả 5 bài khác; page cuối trả số dư đúng.
- [x] `?page=0` hoặc `?page=abc` → 400 (validate).
- [x] `/api/blog/<slug-thật>` trả bài + content; slug sai → 404.
- [x] Sắp xếp theo published_at giảm dần; chỉ bài published.
- [x] build + lint EXIT 0.

## Risk Assessment

- **Off-by-one phân trang** (offset = (page-1)*perPage). Mitigation: test page 1,
  2, và trang cuối (267/5 = 53.4 → 54 trang, trang 54 có 2 bài).
- **date serialization:** Drizzle `date mode:'date'` trả JS Date → JSON.stringify
  thành ISO. Xác nhận FE bước 3 parse được; ghi rõ đây là đổi format so với cũ.
- **`getBlogPage` FE cũ lặp bài đủ 54 trang** — API thật bỏ, FE bước 3 phải xử
  lại. Không phải việc vòng này. Xem memory blog-real-post-count-267.
