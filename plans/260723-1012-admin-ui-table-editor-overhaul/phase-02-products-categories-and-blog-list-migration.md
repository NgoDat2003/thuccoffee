---
phase: 2
title: "Products categories and blog list migration"
status: completed
effort: "2 days"
dependsOn: [1]
---

# Phase 2: Products categories and blog list migration

## Overview

Migrate the three genuine data resources to the new table contract. Products and
Categories remain client-driven; Blog receives real server-side sort/filter so a
header action applies to all 267 posts, not only the current page.

## Related Code Files

- Modify: `src/pages/admin/AdminProductsPage.tsx`
- Modify: `src/pages/admin/AdminCategoriesPage.tsx`
- Modify: `src/pages/admin/AdminBlogPage.tsx`
- Modify: `src/services/admin/blog.service.ts`
- Modify: `server/src/modules/blog/blog.admin.schemas.ts`
- Modify: `server/src/modules/blog/blog.admin.routes.ts`
- Modify: `server/src/modules/blog/blog.admin.service.ts`
- Modify: `server/scripts/smoke-admin-blog.ts`

## API Contract

Extend, do not replace, `GET /api/admin/blog`:

```ts
{
  page?: number; limit?: number; q?: string;
  status?: 'all' | 'published' | 'draft';
  sortBy?: 'title' | 'publishedAt' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
}
```

Default remains `publishedAt desc, id desc`. Every dynamic ordering choice maps from
the Zod enum to a Drizzle column; never interpolate request text into SQL. The page
maps visual keys through an explicit constant:

```ts
const blogSortMap = {
  post: 'title',
  publishedAt: 'publishedAt',
  updatedAt: 'updatedAt',
} as const;
```

Never forward an arbitrary `AdminTable` key to the API.

## Implementation Steps

1. Products: compose search, category, and publish-status controls into a table toolbar;
   keep 10-row client paging, name/price/order sorting, visible-page bulk selection,
   partial-failure behavior, and the existing Product drawer.
2. Categories: add name/key search and order/product-count sorting; retain one-row
   inline edit, immutable key, computed create order, and delete guard when count > 0.
3. Blog API: add validated status/sort fields, Drizzle conditions/order mapping, stable
   `id` tie-breaker, correct count query, and unchanged response pagination metadata.
4. Blog UI: keep 300ms search debounce, add publish-status filter and controlled
   `mode="server"` table sort; include all state in the React Query key; reset page to
   1 on q/status/sort.
5. Standardize table columns, row hover/focus, compact status badges, action alignment,
   mobile overflow, and empty/error copy without changing mutation endpoints.
6. Extend `smoke-admin-blog.ts` first with failing assertions for global sort, filter,
   pagination metadata, invalid enum values, and stable ordering; implement to green.

## Success Criteria

- [x] Products/Categories/Blog share table behavior but retain resource-specific columns.
- [x] Product bulk selection and failure recovery work exactly as before.
- [x] Category inline edit and guarded delete work exactly as before.
- [x] Blog sort/filter covers the entire result set and returns truthful metadata.
- [x] Invalid `status`, `sortBy`, or `sortDir` is rejected by validation.
- [x] Search/filter/sort changes reset the blog list to page 1.
- [x] Existing blog create/update/publish/preview contracts are unchanged.
- [x] Root tests/lint/build pass; server lint/build and `smoke:admin-blog` pass.
