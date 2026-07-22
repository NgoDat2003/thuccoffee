---
title: "FE data-layer structure (React Query + axios)"
description: ""
status: completed
priority: P2
branch: "main"
tags: []
blockedBy: []
blocks: []
created: "2026-07-22T02:18:23.598Z"
createdBy: "ck:plan"
source: skill
---

# FE data-layer structure (React Query + axios)

## Overview

Dựng lớp data-fetching cho FE theo pattern `inno-pos`: axios client + interceptor
unwrap `ApiResponse<T>`, TanStack Query v5 provider, và service theo tài nguyên
(mỗi service tự chứa `queryKeys` + type + hook `useQuery`). **Chỉ dựng structure,
KHÔNG implement vào component nào.** Component/page giữ nguyên đọc `src/data/*.ts`
cho tới vòng sau.

Nguyên tắc: component chỉ render, nghiệp vụ nằm trong hook/service. Bỏ ranh giới cũ
`src/data/index.ts` (cập nhật CLAUDE.md ở Phase 3).

Design đầy đủ: [brainstorm-summary.md](./brainstorm-summary.md).

**Đã verify:** `import type` từ `server/src/modules/*/*.schemas.ts` compile sạch
dù FE không có `zod` (`tsc -b` exit 0 — `verbatimModuleSyntax` xóa type-only import).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Cài thư viện & api client](./phase-01-c-i-th-vi-n-api-client.md) | Pending |
| 2 | [Query provider & services](./phase-02-query-provider-services.md) | Pending |
| 3 | [Verify build/lint & cập nhật docs](./phase-03-verify-build-lint-c-p-nh-t-docs.md) | Pending |

## Dependencies

<!-- Cross-plan dependencies -->

## Validation Log

### Session 1 — 2026-07-22

**Verification Results** (Standard tier, 3 phases)
- Claims checked: 8 | Verified: 8 | Failed: 0 | Unverified: 0
- Endpoints `/api/{products,products/:slug,categories,banners,stores,blog,site-settings}`
  mounted — `server/src/index.ts:27-33`. ✅
- Type exports `Product`, `BlogListItem`/`BlogDetail`, `Store`/`StoreDetail`, `Banner`,
  `PublicSiteSettings`, `Category` — all present in respective `*.schemas.ts`. ✅
- Cross-boundary `import type` compiles without FE `zod` — empirical `tsc -b` exit 0. ✅
- `ApiResponse<T>` envelope shape matches interceptor design — `server/src/common/api-response.ts`. ✅
- **New fact:** backend has open `cors()` at `index.ts:23` — direct base-URL would also
  work; does not change chosen approach.

**Decisions confirmed (all match plan as written, no changes):**
1. Dev API access → **Vite proxy `/api`→:8080** (relative baseURL, matches prod nginx same-origin).
2. Blog pagination hook → **return `{ data, meta }`** so component builds pagination from
   `meta.totalPages` instead of hardcoded 54.
3. CLAUDE.md convention update → **do it in Phase 3** (success criteria already), avoid
   stale "index.ts is the boundary" note contradicting new structure.

### Whole-Plan Consistency Sweep

Re-read `plan.md` + all 3 phase files. No stale terms, no renamed APIs/fields, no
superseded decisions. Validation decisions all confirm existing plan text — no
propagation edits needed. **Zero unresolved contradictions.**
