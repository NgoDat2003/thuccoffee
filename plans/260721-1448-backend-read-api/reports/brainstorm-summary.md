# Brainstorm — Backend API đọc (8 GET endpoints)

Ngày: 2026-07-21
Nhánh: `feat/backend`

## Vấn đề

Foundation + DB (14 bảng, seed đủ: 42 sản phẩm, 267 blog, 7 store, 10 danh mục)
+ MinIO đã xong. Bước 2 của lộ trình backend (`docs/backend-architecture.md`):
dựng API đọc. FE chưa đổi.

## Phạm vi (chốt)

**Trong:** 8 GET endpoints công khai (chỉ trả `is_published`/`is_active=true`):
- `GET /api/categories`
- `GET /api/banners` (filter `is_active`)
- `GET /api/stores`, `GET /api/stores/:slug`
- `GET /api/blog?page=` (phân trang thật), `GET /api/blog/:slug`
- `GET /api/products?category=`, `GET /api/products/:slug`

**Ngoài:** FE đổi (`src/data/index.ts` giữ nguyên — bước 3), auth, admin CRUD,
ảnh MinIO (trả tên file trần), automated test runner (để vòng auth).

## Quyết định đã chốt (qua hỏi-đáp)

| Mục | Chọn |
|---|---|
| Phạm vi | Chỉ API đọc (bước 2), không kéo FE/auth/CRUD |
| Blog phân trang | **Thật** theo 267 bài, `okPaginated`+meta từ COUNT, bỏ giả 54 trang |
| Ảnh trong response | **Tên file trần** (giữ ranh giới, FE `getImageUrl()` xử sau) |
| Kiểu & schema | Zod schema per-module + infer type; FE import type thẳng; không OpenAPI |
| Thứ tự | Dễ→khó: categories → banners → stores → blog → products |
| Test | **Curl e2e vòng này**; vitest+supertest+test DB để vòng auth/CRUD |

## Trạng thái codebase (scout)

- Foundation đủ: `ApiError` (factory notFound/badRequest/unauthorized/forbidden/
  conflict), `ApiResponse`/`ok`/`okPaginated`, error-handler bọc Zod+ApiError,
  `env` Zod, `db` client, `minioClient`.
- **Thiếu:** validate middleware (query/params) — mảnh cần thêm ở `common/`.
- Chỉ có module `health`. Content module chưa có.
- 7 hàm FE data (`getProductBySlug`, `getBlogPage`…) là ranh giới bước 3.

## Kiến trúc module (mẫu)

Mỗi tài nguyên 3 file trong `server/src/modules/<res>/`:
- `<res>.schemas.ts` — Zod listQuery/response, type infer
- `<res>.service.ts` — truy vấn Drizzle
- `<res>.routes.ts` — Router, validate → service → `ok()`/`okPaginated()`

Thêm `common/validate.ts`: `validateQuery(schema)`/`validateParams(schema)` →
parse fail ném ZodError → error-handler bọc 400 (đã có).

## Thứ tự triển khai

1. **common/validate.ts** — middleware validate (dùng chung mọi module)
2. **categories** — đơn giản nhất, chốt pattern
3. **banners** — filter is_active
4. **stores** — list + :slug
5. **blog** — list + phân trang thật (meta từ COUNT 267) + :slug
6. **products** — phức tạp nhất: join product_categories lọc ?category=, gom
   `categories: string[]` vào response (khớp `src/data/types.ts`). Stickers/
   options KHÔNG gom (YAGNI — FE chưa dùng).
7. **smoke-api script** — curl e2e assert 8 endpoint qua compose

## Acceptance

- curl mỗi endpoint: list trả mảng; `:slug` sai trả **404** (không 200+null);
  `?category=` lọc đúng; `/api/blog?page=2` trả `meta` phân trang; chỉ
  `is_published/is_active=true`.
- `smoke-api` script assert hết, exit 0.
- server build+lint EXIT 0.

## Rủi ro

- **N+1 khi gom categories cho list products** (42 sản phẩm). Mitigation: 1 query
  join lấy hết rồi group JS.
- **Blog phân trang giả → thật:** FE `getBlogPage` hiện lặp bài đủ 54 trang. API
  thật bỏ hành vi đó. FE bước 3 xử lại — không phải vòng này. Xem
  [[blog-real-post-count-267]].
- **Type sharing path cross-package:** FE import type từ
  `server/src/modules/*/schemas`. Verify tsconfig FE cho phép khi làm; fallback
  đặt type chỗ FE với được.

## Bước sau (ngoài phạm vi)

- Bước 3: FE đổi ruột `src/data/index.ts` sang fetch + TanStack Query.
- Bước 4: auth (users, argon2, JWT/session, middleware chặn /api/admin/*) +
  dựng vitest+supertest+test DB.
- Bước 5: admin CRUD.
