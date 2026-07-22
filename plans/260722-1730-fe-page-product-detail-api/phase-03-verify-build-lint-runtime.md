---
phase: 3
title: "Verify build/lint/runtime"
status: completed
priority: P2
effort: "1h"
dependencies: [2]
---

# Phase 3: Verify build/lint/runtime

## Overview

Chốt page mẫu: build/lint sạch, và **verify runtime thật** với backend chạy — đây là
lần đầu FE gọi API thật, nên phải chạy dev + backend và mở product thật để xác nhận
data từ DB, không chỉ type-check.

## Requirements

- Functional: mở 1 product qua trình duyệt, thấy data từ API (proxy `/api`→:8080).
- Non-functional: build/lint sạch; không đụng page/component ngoài phạm vi.

## Architecture

Đây là lần đầu interceptor unwrap + service + hook chạy runtime với backend thật
(vòng structure chỉ type-check). Cần backend `:8080` + Postgres seed sẵn.

## Related Code Files

- (Không sửa code mới; chỉ verify. Sửa nếu phát hiện lỗi runtime.)

## Implementation Steps

1. `npm run build` + `npm run lint` — sạch.
2. Khởi động backend: `cd server && npm run dev` (cần Postgres + MinIO qua compose,
   hoặc DB local đã seed). Xác nhận `GET /api/health` OK.
3. `npm run dev` (FE) → mở `http://localhost:3000/menu/<slug-thật>`:
   - Thấy skeleton chớp rồi ra data product từ API.
   - Related hiện product cùng category, không gồm product hiện tại.
   - Slug sai (`/menu/khong-ton-tai`) → redirect /menu.
   - (Tùy) tắt backend → reload → xác nhận isError → redirect /menu (không crash).
4. `git diff --stat` — xác nhận chỉ đụng: ProductDetailPage, RelatedProducts,
   ProductCard, ProductDetailSkeleton (mới), products.ts, plans/. KHÔNG đụng page khác.

## Success Criteria

- [x] `npm run build` + `npm run lint` sạch.
- [x] Runtime: product detail hiển thị data từ API; skeleton hoạt động; related đúng.
- [x] Slug sai → Navigate /menu; backend tắt → không crash.
- [x] `git diff` không chạm page/component ngoài phạm vi product.

## Risk Assessment

- **Backend/DB chưa seed → API trả rỗng.** Verify `/api/products` có data trước khi
  test page. Nếu chưa seed: `cd server && npm run db:seed` (theo README backend).
- **Proxy không hoạt động.** Kiểm `vite.config.ts` proxy `/api`→:8080 (đã có từ vòng
  structure); network tab thấy request tới `/api/products/<slug>`.
- **Runtime lỗi interceptor (lần đầu chạy thật).** Nếu unwrap sai shape, sẽ lộ ở đây —
  đây chính là lý do phase verify runtime tồn tại, không chỉ dựa build.

## Next Steps

Sau page mẫu: pattern render (hook + skeleton + Navigate) đã chốt. Vòng sau nhân bản
cho HomePage, BlogIndex, BlogDetail (date format + retry), StoreDetail. Xóa
`src/data/index.ts` khi page cuối rời.
