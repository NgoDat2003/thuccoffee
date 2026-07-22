---
title: "Nối ProductDetailPage vào API (page mẫu)"
description: ""
status: completed
priority: P2
branch: "feat/fe-product-detail-api"
tags: []
blockedBy: []
blocks: []
created: "2026-07-22T03:06:27.551Z"
createdBy: "ck:plan"
source: skill
---

# Nối ProductDetailPage vào API (page mẫu)

## Overview

Chuyển **1 page mẫu** (`ProductDetailPage`) từ đọc `src/data` tĩnh sang gọi hook
TanStack Query (`useProduct`). Chốt pattern render — loading skeleton, error→Navigate,
related tự fetch — để vòng sau nhân bản cho các page động còn lại (Home, Blog, Store).

Đây là lần **đầu tiên** FE gọi API thật; vòng structure trước chỉ dựng lớp data-layer
(type-check, chưa chạy runtime). Phase 3 verify runtime với backend thật.

Design đầy đủ: [brainstorm-summary.md](./brainstorm-summary.md).

**Quyết định type: theo BE triệt để (Mức B).** `Product` chỉ còn 1 nguồn = backend.
Xóa `interface Product` khỏi `src/data/types.ts`; data tĩnh + `index.ts` + component
đều import từ BE. Không giữ type FE lệch (tránh trả nợ vòng sau).

**Đã verify khi lập plan (không đoán):**
- 2 type `Product` chỉ khác `priceEstimated` (FE optional vs backend required); field
  này **không component nào đọc**.
- Static `products.ts`: 11/42 có `priceEstimated`, 31 thiếu → thêm `priceEstimated: false`
  (khớp DB) khi chuyển sang type BE.
- API luôn trả `priceEstimated` (`products.service.ts:62`).
- `RelatedProducts` chỉ dùng ở `ProductDetailPage` → đổi hợp đồng props an toàn.
- `Product` từ `src/data` được import ở: ProductCard, RelatedProducts, `index.ts`
  (dùng nội bộ + re-export), `products.ts` — tất cả chuyển sang BE ở Phase 1.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Type boundary & component con](./phase-01-type-boundary-component-con.md) | Pending |
| 2 | [Nối ProductDetailPage + skeleton](./phase-02-n-i-productdetailpage-skeleton.md) | Pending |
| 3 | [Verify build/lint/runtime](./phase-03-verify-build-lint-runtime.md) | Pending |

## Dependencies

<!-- Cross-plan dependencies -->

## Validation Log

### Session 1 — 2026-07-22

**Verification Results** (Standard tier, 3 phases)
- Claims checked: 6 | Verified: 6 | Failed: 0 | Unverified: 0
- `useProduct(slug)` + `useProducts(category?)` tồn tại đúng chữ ký — `products.service.ts:25,16`. ✅
- Import-path depth `../../../server/...` từ `src/components/ui/` — **verified bằng tsc probe** (exit 0). ✅
- 4 file plan sẽ sửa đều tồn tại; `ProductDetailSkeleton.tsx` chưa có (đúng, Create). ✅
- `products.ts`: 11/42 có `priceEstimated` → 31 cần thêm. ✅
- API luôn trả `priceEstimated` (`products.service.ts:62`). ✅
- `RelatedProducts` chỉ dùng ở `ProductDetailPage` → đổi props an toàn. ✅

**Decisions confirmed (khớp plan, không sửa):**
1. Lỗi API (404 + network/500) → **Navigate /menu** ở page mẫu. Retry để dành blog vòng sau.
2. Type blast → **thêm `priceEstimated: false`** cho 31 product tĩnh (khớp DB, không map layer).

### Session 2 — 2026-07-22 (thay đổi quyết định type)

Người dùng chốt **"theo BE triệt để"**: không giữ type FE `Product` lệch. Nâng Phase 1
từ Mức A (chỉ đổi component + vá data) lên **Mức B**:
- Xóa `interface Product` khỏi `src/data/types.ts`.
- `src/data/products.ts` + `src/data/index.ts` (import nội bộ + re-export) chuyển
  `Product` sang nguồn BE.
- Component vẫn đổi sang BE; vá 31 product vẫn cần (giờ là "làm đúng chuẩn BE").

Blast đã grep: `Product` từ `src/data` dùng ở ProductCard, RelatedProducts, index.ts
(2 chỗ), products.ts. Phase 1 cập nhật để chuyển hết. Lý do đổi: khớp nguyên tắc "theo
BE" người dùng đặt ra; làm gốc bây giờ rẻ hơn trả nợ từng vòng.

### Whole-Plan Consistency Sweep

Re-read plan.md + 3 phase file sau khi nâng Mức B. Phase 2/3 không nhắc type FE nên
không mâu thuẫn. Phase 1 + plan overview đã đồng bộ với Mức B. **Zero unresolved
contradictions.**
