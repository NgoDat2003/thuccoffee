---
phase: 1
title: "Checkpoint ProductDetail (không commit)"
status: completed
priority: P2
effort: "15m"
dependencies: []
---

# Phase 1: Checkpoint ProductDetail (không commit)

## Overview

Xác nhận migration ProductDetail hiện có vẫn build/lint sạch trước khi chồng các page
khác. Giữ thay đổi trên working tree; không stage, commit hoặc push trong `ck:cook`.

## Requirements

- Functional: ProductDetail migration hiện tại vẫn đầy đủ trong working tree.
- Non-functional: frontend build/lint sạch; branch đúng `feat/fe-product-detail-api`.

## Related Code Files

- ProductDetailPage, RelatedProducts, ProductCard, ProductDetailSkeleton,
  products.ts, index.ts, types.ts và plan 260722-1730.

## Implementation Steps

1. Xác nhận branch và phạm vi working tree.
2. Chạy `npm run build` và `npm run lint`.
3. Không stage/commit/push; tiếp tục Phase 2 trên cùng working tree.

## Success Criteria

- [x] ProductDetail changes còn đầy đủ trên `feat/fe-product-detail-api`.
- [x] `npm run build` + `npm run lint` sạch trước khi sang Phase 2.
- [x] Không tạo commit/push.

## Risk Assessment

- Working tree sẽ tiếp tục chứa nhiều phase; dùng `git diff --stat` và build/lint sau
  từng phase để giữ phạm vi kiểm soát được.