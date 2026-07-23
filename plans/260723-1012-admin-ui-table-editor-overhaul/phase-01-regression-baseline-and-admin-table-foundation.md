---
phase: 1
title: "Regression baseline and admin table foundation"
status: completed
effort: "1.5 days"
dependsOn: []
---

# Phase 1: Regression baseline and admin table foundation

## Overview

Establish a non-breaking layout and table contract before migrating any resource page.
The category page must consume the full content area, while settings and blog forms
retain a readable maximum width.

## Related Code Files

- Modify: `package.json`, `package-lock.json`
- Add: `vitest.config.ts`
- Modify: `src/components/admin/AdminLayout.tsx`
- Modify: `src/components/admin/ui/AdminTable.tsx`
- Add: `src/components/admin/ui/admin-table-state.ts`
- Add: `src/components/admin/ui/admin-table-state.test.ts`
- Add: `src/components/admin/ui/AdminTableToolbar.tsx`
- Modify: `src/components/admin/ui/AdminDrawer.tsx`
- Modify: `src/pages/admin/AdminCategoriesPage.tsx`
- Modify: `src/pages/admin/AdminBlogFormPage.tsx`
- Modify: `src/pages/admin/AdminSettingsPage.tsx`
- Reference: `src/components/admin/AdminSidebar.tsx`

## Contract

```ts
type AdminSortState = { key: string; direction: 'asc' | 'desc' } | null;
type AdminTableMode = 'client' | 'server';

interface AdminTableChange {
  action: 'paginate' | 'sort';
  page: number;
  sort: AdminSortState;
}
```

Keep all current props (`sortValue`, `pageSize`, `clientResetKey`, `pagination`,
`onVisibleRowsChange`). Add controlled `mode`, `sort`, `onChange`, column layout
classes, total-row label, and accessible selection hooks only where needed. Default
`mode` is `pagination ? 'server' : 'client'`; server mode requires controlled sort and
never applies local `sortValue`.

## Implementation Steps

1. Capture baseline screenshots at 375, 768, 1024, 1440, and 1920px for all admin
   lists, forms, sidebar, drawer, and settings; record current CRUD interaction matrix.
2. Add Vitest/jsdom and `test:admin-ui`. Extract pure sort/page/reset helpers before
   changing markup; cover tri-state order, Vietnamese strings, numeric values, reset,
   clamp, current-page rows, and non-mutating input.
3. Remove the global `max-w-[1180px]` cap from `AdminLayout` main while preserving
   the fixed 232px sidebar and existing responsive padding.
4. Remove `max-w-4xl` from Categories so its header, create controls, toolbar, and
   table use 100% of available width. Add local `max-w-[1180px]` only to Blog Form
   and Settings to prevent global widening from damaging long-form readability.
5. Refactor `AdminTable` to Ant-inspired semantics:
   - tri-state sort (`none -> asc -> desc -> none`) with `aria-sort`;
   - explicit client/server mode; never client-sort a server-paginated result;
   - filter/sort changes reset page 1 and shrinking results clamp the current page;
   - header remains mounted during loading/empty states using a `colSpan` body row;
   - current-page select-all exposes checked/indeterminate states;
   - pagination retains first/last/ellipsis and adds previous/next plus total count.
6. Add `AdminTableToolbar` as a composition shell only; each page owns its resource-
   specific filters. Do not build a generic schema-driven form/filter engine.
7. Make `AdminDrawer` accept a backward-compatible `size`/`className` escape hatch
   (`default=560px`, `wide=720px`) without changing dialog, ESC, focus, or backdrop.
8. Preserve Product `onVisibleRowsChange` semantics exactly: selected IDs are scoped
   to the filtered current page and failed bulk mutations remain selected.

## Success Criteria

- [x] Categories visibly use 100% of the post-sidebar content width at >=1024px.
- [x] Blog Form and Settings never stretch beyond 1180px after the shell change.
- [x] Existing `AdminTable` consumers compile without an all-at-once prop rewrite.
- [x] Sort is tri-state and announced through native table semantics/ARIA.
- [x] Loading and empty states keep column widths/header stable.
- [x] Client filter/sort resets and clamps pagination; server mode emits state only.
- [x] `npm run test:admin-ui`, `npm run lint`, and `npm run build` pass.
