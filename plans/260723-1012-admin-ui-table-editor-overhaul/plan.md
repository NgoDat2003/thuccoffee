---
title: "Admin UI overhaul - full-width data tables, specialized media views, rich-text editor"
description: "Refactor the admin information architecture and interaction layer without changing existing CRUD behavior: full-width category/data views, Ant-inspired custom tables, distinct store/banner experiences, and a legacy-safe visual blog editor."
status: completed
priority: P1
effort: "9.5 days"
branch: "feat/admin-ui-overhaul"
tags: [admin, frontend, table, rich-text, ux]
blockedBy: []
blocks: []
created: "2026-07-23T03:17:17.670Z"
createdBy: "ck:plan"
source: skill
---

# Admin UI overhaul - full-width data tables, specialized media views, rich-text editor

## Overview

Fix the five observed admin UX problems while preserving API contracts, React Query
invalidation, publish flows, media keys, and public behavior. This is an incremental
interaction refactor, not a backend/database redesign.

## Scope

- Full-width list/data screens; locally constrained long forms.
- Tailwind-native, Ant-inspired sort/filter/selection/pagination. Do not install `antd`.
- Products/Categories/Blog remain tables; Stores/Banners get specialized media views.
- Lazy Tiptap Visual/HTML blog editor; sanitized HTML remains in PostgreSQL.

## Locked decisions

1. `AdminTable` stays backward compatible. Default mode is
   `pagination ? 'server' : 'client'`; server mode never sorts received rows locally.
2. Resource filters remain page-owned toolbars. Table emits sort/pagination only.
3. Blog page maps table keys through an explicit allow-list to API sort enums.
4. Backend sanitizer and authenticated preview remain the trust boundary.
5. Untouched blog content stays byte-identical. All current posts pass a corpus gate;
   incompatible markup is source-only, never silently normalized.
6. New images store `blog-asset:<storageKey>`, never environment URLs.
7. Store gallery save, Product bulk publish, Banner enum, CRUD endpoints, and
   admin/public query invalidation remain behaviorally unchanged.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Regression baseline and admin table foundation](./phase-01-regression-baseline-and-admin-table-foundation.md) | Completed |
| 2 | [Products categories and blog list migration](./phase-02-products-categories-and-blog-list-migration.md) | Completed |
| 3 | [Specialized stores and banners](./phase-03-specialized-stores-and-banners.md) | Completed |
| 4 | [Rich-text blog editor with legacy HTML safety](./phase-04-rich-text-blog-editor-with-legacy-html-safety.md) | Completed |
| 5 | [Integration and visual verification](./phase-05-integration-and-visual-verification.md) | Completed |

## Dependencies

Phase 1 is foundational. Phases 2 and 3 consume its primitives; Phase 4 consumes
Phases 1-2; Phase 5 requires all prior phases and a running Postgres/MinIO/API stack.

## Research

- [Current admin code audit](./research/admin-ui-current-codebase-research.md)
- [Ant Table and rich-text compatibility](./research/table-editor-and-rich-text-research.md)

## Validation Log

| Gate | Status | Evidence |
|------|--------|----------|
| Current-code contract audit | Passed | Research report; exact hooks/layout/smokes mapped |
| Official table/editor research | Passed | Ant/Tiptap sources and React 19 compatibility |
| Red-team review | Passed with corrections | Upload contract, corpus checks, mode defaults, fresh-container order, browser artifact |
| Root gates | Passed | `test:admin-ui` 9/9; root lint/build; server lint/build |
| Blog corpus and persistence | Passed | `smoke:admin-blog` 11/11; 267/267 sanitizer byte-identical; 267 posts classified source-only because current legacy bodies contain unsupported wrappers/spacing; new compatible bodies retain Visual mode |
| Fresh Docker regression | Passed | Postgres, MinIO, backend and frontend healthy after build plus explicit frontend/backend force-recreate; container image IDs matched new images |
| Existing smoke matrix | Passed | auth 8/8; upload 8/8; products 8/8; blog 11/11; stores 5/5; banners/settings 5/5; public API 9/9; images passed with 561 references, 0 missing, 0 basename-only, 0 public HEAD failures |
| Browser E2E | Passed | Playwright 5/5: auth guard/logout, product/table interactions, category CRUD+cleanup, blog pagination/preview/upload/dirty guard, store gallery mutation+restore, banner/settings flows, and six resources across five widths |
| Responsive evidence | Passed | 30 screenshots under `test-results/admin-ui-overhaul/`; all six resources at 375/768/1024/1440/1920; page overflow assertions passed |
| Bundle isolation | Passed | public entry gzip 173.57 KiB versus Phase 1 baseline 174.63 KiB (delta -1.06 KiB); lazy Blog Form/Tiptap chunk gzip 143.98 KiB |
| Cleanup | Passed | category count restored to 10; `e2e-admin-ui-*` leftovers = 0; smoke scripts removed their records/uploads |
| Intentional integration fix | Passed | `smoke:images` valid-prefix contract now includes `banners/`, matching the existing upload API and banner admin form |

## Verification boundary

- Browser automation covers UI-specific interactions and deterministic responsive evidence.
- Full mutation/upload/public-reflection coverage is supplied by the eight existing smoke suites.
- Screenshots are captured evidence, not a long-lived pixel-diff baseline.

## Out of scope

Dashboard, DB schema migration, public UI redesign, auth changes, virtual/multi-sort,
column drag/resize, collaborative editing, and general settings/form redesign.
