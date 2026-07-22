---
phase: 8
title: "UI blog list + editor"
status: pending
priority: P1
effort: "1d"
dependencies: [7]
---

# Phase 8: UI blog — list phân trang + editor HTML/preview

## Overview

Màn blog dùng primitive phase 5 + hai thứ mới: pagination server-side trên
AdminTable và editor textarea HTML + preview sanitized + unsaved-changes guard.

## Requirements

- Functional: list phân trang+search server; editor content + preview render
  AN TOÀN; cover qua ImageField; unsaved guard.
- Non-functional: preview render qua CÙNG sanitize logic BE (red-team #5 —
  không `dangerouslySetInnerHTML` content thô).

## Architecture

### Service `src/services/admin/blog.service.ts`
- `useAdminBlogList({page, q})` — pagination meta (pattern public blog service).
- `useAdminBlogPost(id)`, `useCreateBlogPost`, `useUpdateBlogPost`,
  `usePublishBlogPost`.
- Invalidate: admin blog keys + public blog keys (đọc key thật lúc impl).

### Preview an toàn (red-team #5)
Content trong DB gồm bài cào CHƯA từng qua sanitize → admin preview không được
render thô. Chốt: import `sanitizeBlogContent` từ BE module (quy ước
type/hàm-sharing dự án; sanitize-html bundle được browser). Nếu lúc impl thấy
bundle phình bất hợp lý (>50KB gzip thêm) → fallback endpoint
`POST /api/admin/blog/preview` trả HTML sanitized, chốt tại chỗ và ghi lại.
Preview pipeline: `sanitizeBlogContent(content)` →
`resolveBlogContentImageUrls(...)` (marker blog-asset → URL) → render.

### Pages
- `AdminBlogPage.tsx` — AdminTable + pagination control (nút prev/next + số
  trang từ meta — thêm prop pagination vào AdminTable, không viết table mới) +
  search input (debounce 300ms) + PublishSwitch + cột: cover thumb, title,
  slug, publishedAt, trạng thái, updatedAt, actions.
- `AdminBlogFormPage.tsx` — `/admin/blog/new` + `/admin/blog/:id`:
  - FormField title/slug (lock khi edit)/summary/publishedAt (input date).
  - ImageField cover (`kind="blog"`).
  - Content: textarea monospace + nút toggle "Preview" render pipeline trên.
  - **Unsaved-changes guard:** state `isDirty` (so form với data gốc) +
    `useBlocker` của React Router v7 → ConfirmDialog khi rời trang dirty.

### Routes
```
blog        → AdminBlogPage
blog/new    → AdminBlogFormPage
blog/:id    → AdminBlogFormPage
```

## Related Code Files

- Create: `src/pages/admin/{AdminBlogPage,AdminBlogFormPage}.tsx`,
  `src/services/admin/blog.service.ts`
- Modify: `src/routes.tsx`, `src/components/admin/ui/AdminTable.tsx`
  (prop pagination)
- Read for context: `src/services/blog.service.ts` (public keys + pagination
  pattern), `src/lib/image-url.ts` (resolveBlogContentImageUrls),
  `server/src/modules/blog/blog-content-sanitizer.ts` (phase 7)

## Implementation Steps

1. blog.service admin (list pagination + CRUD hooks).
2. AdminTable thêm pagination prop.
3. AdminBlogPage (list + search debounce).
4. AdminBlogFormPage (form + preview sanitized + useBlocker guard).
5. Routes; lint/build; test dev: sửa 1 bài thật → preview khớp public render;
   thoát khi dirty → dialog chặn.

## Success Criteria

- [ ] List phân trang 267 bài + search hoạt động.
- [ ] Preview render qua sanitizer — paste `<script>` vào textarea → preview
      KHÔNG thực thi/hiển thị script.
- [ ] Sửa bài thật, lưu → public render không đổi format; ảnh inline sống.
- [ ] Unsaved guard chặn điều hướng khi dirty.
- [ ] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** `useBlocker` cần data router (createBrowserRouter — ĐÃ dùng,
  routes.tsx:35). OK.
- **Rủi ro:** search debounce + pagination reset page khi q đổi — nhớ reset
  page=1 khi search thay đổi.
