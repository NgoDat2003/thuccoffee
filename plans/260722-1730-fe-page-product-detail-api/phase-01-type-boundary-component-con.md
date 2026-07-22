---
phase: 1
title: "Type boundary & component con"
status: completed
priority: P2
effort: "1h"
dependencies: []
---

# Phase 1: Type boundary & component con

## Overview

**Theo BE triệt để (Mức B):** `Product` chỉ còn **một nguồn type = backend**. Xóa
`interface Product` khỏi `src/data/types.ts`; mọi nơi (data tĩnh, index.ts, component)
đều import `Product` từ BE. Data tĩnh chỉ là dữ liệu tạm, hình dạng luôn theo BE.
Đây là bước nền để ProductDetail truyền data API xuống component con mà không lệch type,
đồng thời không để lại type FE lệch trả nợ vòng sau.

## Requirements

- Functional: `Product` chỉ import từ BE ở mọi call-site; `ProductCard`/`RelatedProducts`,
  `src/data/products.ts`, `src/data/index.ts` đều dùng type BE. HomePage + MenuPage
  (còn đọc tĩnh) vẫn build sạch.
- Non-functional: không đổi hành vi render; build/lint sạch.

## Architecture

**Đã verify (không đoán):**
- 2 type `Product` chỉ khác 1 field: FE `priceEstimated?: boolean` (optional) vs
  backend `priceEstimated: boolean` (**bắt buộc**). Còn lại giống hệt.
- **`priceEstimated` KHÔNG được component nào đọc** — `grep` cho thấy chỉ xuất hiện
  trong `src/data/*`. `ProductCard` chỉ đọc `slug`, `thumb`, `name`, `price`.
- API luôn trả `priceEstimated` (`products.service.ts:62`, validate bởi `productSchema`).
- Static: chỉ 11/42 product có `priceEstimated`; 31 product thiếu (dựa optional FE type).

**Call-site của `Product` từ `src/data` (đã grep, phải chuyển hết):**
- `src/components/ui/ProductCard.tsx:2` — `import type { Product } from '../../data'`.
- `src/components/menu/RelatedProducts.tsx:3` — tương tự.
- `src/data/index.ts:6` — dùng nội bộ cho `getProductBySlug`/`getRelatedProducts`.
- `src/data/index.ts:16` — **re-export** `Product` cho ai import từ `'../data'`.
- `src/data/products.ts:1` — chính data tĩnh.

**Blast khi type BE bắt buộc `priceEstimated`:** data tĩnh 31/42 product thiếu field
→ lỗi TS. Xử lý: bổ sung `priceEstimated: false` cho 31 mục. Đây là **làm cho đúng
chuẩn BE** (DB mặc định false), không phải vá tạm.

**Điểm cần cẩn thận:** `src/data/index.ts` vẫn tồn tại (page khác còn dùng), nên phải
đổi import `Product` của nó sang BE luôn — không được để nó trỏ vào type FE đã xóa.
Re-export dòng 16 giữ tên `Product` nhưng nguồn đổi sang BE, để các import `from '../data'`
hiện có không gãy.

## Related Code Files

- Modify: `src/data/types.ts` — **xóa** `interface Product`. Giữ `BlogPost`, `Store`,
  `Category` (chưa chuyển vòng này).
- Modify: `src/data/products.ts` — `import type { Product }` từ BE thay vì `./types`;
  thêm `priceEstimated: false` cho 31 product thiếu.
- Modify: `src/data/index.ts` — đổi `import type { ..., Product }` (dòng 6) và
  re-export (dòng 16) sang nguồn BE.
- Modify: `src/components/ui/ProductCard.tsx` — import `Product` từ
  `../../../server/src/modules/products/products.schemas`.
- Modify: `src/components/menu/RelatedProducts.tsx` — import type tương tự (BE).

## Implementation Steps

1. Xóa `interface Product` khỏi `src/data/types.ts` (giữ các interface khác).
2. `src/data/products.ts`: đổi dòng 1 `import type { Product } from './types'` →
   `from '../../server/src/modules/products/products.schemas'`. Thêm `priceEstimated: false`
   cho 31 product thiếu; giữ `true` ở 11 mục. Không đổi field khác.
3. `src/data/index.ts`: dòng 6 tách `Product` ra import từ BE; dòng 16 re-export
   `Product` từ BE (`export type { Product } from '../../server/...'`), giữ
   `BlogPost/Store/Category` từ `./types`.
4. `ProductCard.tsx` + `RelatedProducts.tsx`: import `Product` từ BE
   (`../../../server/src/modules/products/products.schemas`). Verify độ sâu đường dẫn.
5. `npm run build` + `npm run lint`.

## Success Criteria

- [x] `interface Product` **không còn** trong `src/data/types.ts`.
- [x] `Product` mọi nơi (`products.ts`, `index.ts`, `ProductCard`, `RelatedProducts`)
      import từ BE — không call-site nào còn lấy `Product` từ `./types`.
- [x] Mọi product trong `src/data/products.ts` có `priceEstimated` (true/false).
- [x] HomePage + MenuPage (đọc tĩnh, import từ `'../data'`) build sạch.
- [x] `npm run build` + `npm run lint` sạch; render không đổi.

## Risk Assessment

- **Đường dẫn import type sai độ sâu.** Verify bằng build sau khi sửa; `verbatimModuleSyntax`
  xóa type-only import nên không leak runtime (đã chứng minh ở vòng structure).
- **Sửa nhầm field khác khi thêm priceEstimated.** Chỉ thêm 1 dòng/product, không đụng
  price/slug/categories.
