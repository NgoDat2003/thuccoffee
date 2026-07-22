---
phase: 3
title: "Store"
status: completed
priority: P2
effort: "2h"
dependencies: [1]
---

# Phase 3: Store

## Overview

Chuyển StoreListPage, StoreDetailPage, StoreLocator, BranchSelector, StoreCard sang
`useStores()`/`useStore(slug)`. Store detail có gallery (API trả `StoreDetail`).

## Requirements

- Functional: list + detail store từ API; gallery hiện; BranchSelector list từ API.
- Non-functional: loading/error; build/lint sạch.

## Architecture

`useStores()` → `Store[]` (list, KHÔNG gallery); `useStore(slug)` → `StoreDetail`
(có `gallery`). Type BE: `Store`, `StoreDetail` (`stores.schemas.ts`).

- **StoreListPage**: hiện `stores[0]` + `StoreDetailView`. `StoreDetailView` cần gallery
  → list không có. Chốt: `useStores()` lấy slug đầu → `useStore(slug)` cho gallery đầy đủ.
  Loading→skeleton.
- **StoreDetailPage**: `getStoreBySlug` → `useStore(slug)`; skeleton; 404→Navigate
  /cua-hang. BranchSelector cần list → `useStores()`.
- **StoreLocator** (Home): stateful `selectedIndex` trên `stores` → `useStores()`,
  giữ state. Selected chỉ cần list-shape.
- **BranchSelector**: list chi nhánh → `useStores()`.
- **StoreCard**: đổi type sang BE `Store`.

## Related Code Files

- Modify: `src/pages/StoreListPage.tsx`, `src/pages/StoreDetailPage.tsx`.
- Modify: `src/components/home/StoreLocator.tsx`, `src/components/store/BranchSelector.tsx`,
  `src/components/store/StoreCard.tsx`.
- Create: store skeleton (inline hoặc component).

## Implementation Steps

1. Đọc `StoreDetailPage`/`StoreDetailView`, `BranchSelector`, `StoreCard`, `StoreLocator`
   để biết field dùng + `Store` type FE.
2. StoreDetailPage: `useStore(slug)` + `useStores()` (BranchSelector); skeleton; 404.
3. StoreListPage: `useStores()` → slug đầu → `useStore` cho gallery; skeleton.
4. StoreLocator/BranchSelector/StoreCard: `useStores()`, type BE.
5. `npm run build` + `npm run lint`; runtime verify (/cua-hang, /cua-hang/:slug).

## Success Criteria

- [x] Store list + detail từ API; gallery hiện ở detail.
- [x] BranchSelector + StoreLocator list từ `useStores()`.
- [x] Slug sai → Navigate /cua-hang; loading→skeleton.
- [x] `npm run build` + `npm run lint` sạch.

## Risk Assessment

- **List không có gallery, detail có.** `useStores()` trả `Store[]` (không gallery);
  gallery chỉ ở `useStore(slug)`. StoreListPage gọi cả hai.
- **StoreDetailView dùng chung list+detail.** Xác định props cần gallery; không phá StoreListPage.
- **StoreLocator state.** Giữ `selectedIndex`; chỉ đổi nguồn data.
