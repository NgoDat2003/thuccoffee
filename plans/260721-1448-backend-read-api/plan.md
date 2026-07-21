---
title: "Backend Read API"
description: "8 GET endpoints công khai (products, categories, blog, stores, banners) theo module tài nguyên. Chỉ trả bản ghi published. FE chưa đổi; verify bằng curl e2e."
status: completed
priority: P1
branch: "feat/backend"
tags: [backend, api, read]
blockedBy: []
blocks: []
created: "2026-07-21T07:52:22.297Z"
createdBy: "ck:plan"
source: skill
---

# Backend Read API

## Tổng quan

Bước 2 của lộ trình backend (`docs/backend-architecture.md`): dựng 8 GET endpoint
công khai đọc dữ liệu đã seed (42 sản phẩm, 267 blog, 7 store, 10 danh mục).
Mỗi tài nguyên một module; response bọc `ApiResponse<T>`; chỉ trả bản ghi
`is_published`/`is_active=true`. FE **chưa** đổi — vẫn đọc `src/data/*.ts`.

Nguồn: `reports/brainstorm-summary.md`
Foundation: `ApiError`, `ApiResponse`/`ok`/`okPaginated`, error-handler bọc
Zod+ApiError, `db` client — đã có. Thiếu: validate middleware.

## Phạm vi

**Trong:**
- `common/validate.ts` — middleware validate query/params bằng Zod
- 5 module: categories, banners, stores, blog, products (mỗi cái schemas +
  service + routes)
- 8 endpoint: `/api/categories`, `/api/banners`, `/api/stores`(+`/:slug`),
  `/api/blog`(+`?page=`, +`/:slug`), `/api/products`(+`?category=`, +`/:slug`)
- Script curl e2e assert 8 endpoint
- Đăng ký routes ở `index.ts`

**Ngoài:**
- FE đổi ruột (`src/data/index.ts` sang fetch) — bước 3. *Ngoại lệ:* Phase 3 sửa
  1 dòng `src/data/types.ts` (`price` non-null) để khớp response — touchpoint FE
  duy nhất, user duyệt.
- Auth, admin CRUD — bước 4-5
- Ảnh MinIO (trả tên file trần), automated test runner (vitest — vòng auth)
- Gom stickers/options vào product response (YAGNI — FE chưa dùng)

## Quyết định đã chốt (brainstorm)

| Mục | Chọn |
|---|---|
| Phạm vi | Chỉ API đọc (bước 2) |
| Blog phân trang | Thật theo 267 bài, meta từ COUNT, perPage=5 |
| Ảnh response | Tên file trần (giữ ranh giới) |
| Kiểu | Zod schema per-module + infer; không OpenAPI |
| Product join | Gom `categories: string[]`; KHÔNG gom stickers/options |
| Test | Curl e2e vòng này; automated khi auth |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Validate middleware và các module đơn giản](./phase-01-validate-middleware-va-cac-module-don-gian.md) | Pending |
| 2 | [Blog phân trang thật](./phase-02-blog-phan-trang-that.md) | Pending |
| 3 | [Products với join và lọc](./phase-03-products-voi-join-va-loc.md) | Pending |
| 4 | [Smoke test e2e và docs](./phase-04-smoke-test-e2e-va-docs.md) | Pending |

## Dependencies

Nối tiếp `260720-1730-backend-foundation` + `260721-1230-minio-image-storage`
(đã completed). Không có plan mở nào bị ảnh hưởng.

**Chặn bước sau (không phải plan này):** bước 3 "FE đọc API" phụ thuộc plan này.
Rủi ro type-sharing đã biết: `tsconfig.app.json` có `include: ["src"]` nên FE
import type từ `server/src/modules/*` sẽ ngoài phạm vi compile FE — giải quyết ở
bước 3, không phải vòng này.

## Validation Log

### Session 1 — 2026-07-21

**Verification Results (Standard tier: Fact Checker + Contract Verifier)**
- Claims checked: 8 | Verified: 7 | Failed/Adjusted: 1 | Unverified: 0
- Verified: `okPaginated(data, meta)` signature đúng thứ tự; `PaginationMeta
  {page,pageSize,total,totalPages}` khớp; blog_posts có `is_published`/
  `published_at`(date)/`content`/`summary`/`cover`; product_categories PK gộp;
  category keys thật tồn tại (`yeu-thich-nhat`…).
- **Data thật khớp plan:** 267 blog published, 42 products, 10 categories.
  267/5 = 54 trang, trang cuối 2 bài — khớp Phase 2.
- **Adjusted:** plan/docs nói "10 sản phẩm price nullable" — SAI. psql: **0 sản
  phẩm price NULL**. ~11 là `priceEstimated=true` (giá ước tính), không phải null.

**Quyết định từ interview**
- **price non-null:** response `price: number` (không nullable). Đồng thời sửa
  `src/data/types.ts` FE `number | null` → `number` để khớp (1 touchpoint FE
  ngoại lệ, user duyệt — Phase 3).
- **Response khớp type FE:** product có `priceEstimated`; blog date trả ISO
  string (FE format sau ở bước 3).
- **Schema layout:** gộp `schemas.ts` (query+response) cho vòng đọc; tách file
  theo loại như QA/QC khi tới vòng CRUD. Đã đối chiếu QA/QC thật tại
  `maycha_QAQC_app/apps/api` (NestJS, `modules/<res>/` + dto/ + schema/ + service
  + controller) — structure Express+modules+service của plan khớp tinh thần, chỉ
  khác NestJS→Express có chủ đích.

### Whole-Plan Consistency Sweep
- Rà plan.md + 4 phase: "10 nullable/price null giữ null" đã đổi thành "0 null,
  price non-null + sửa types.ts". Touchpoint FE (`src/data/types.ts`) thêm vào
  Phase 3 Related Files + plan phạm vi. Không còn mâu thuẫn.
