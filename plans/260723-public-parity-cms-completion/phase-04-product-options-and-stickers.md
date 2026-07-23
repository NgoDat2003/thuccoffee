---
phase: 4
title: "Product options and stickers"
status: done
priority: P1
effort: "8h"
dependencies: [2]
---

# Phase 4: Product options and stickers

## Overview

Hoàn thiện nghiệp vụ sản phẩm còn thiếu: option nóng/lạnh/size với giá theo option, sticker/badge, và admin quản trị đủ để public detail không còn một giá đơn giản.

## Requirements

- Functional: product detail hiển thị option picker/price đúng; admin gắn option và sticker cho từng sản phẩm.
- Non-functional: không làm cart/order; option chỉ ảnh hưởng hiển thị giá, chưa tạo line item.

## Architecture

DB đã có `product_options`, `product_option_links`, `stickers`, `product_stickers`.
Cần:
- seed/link dữ liệu thật cho 42 sản phẩm từ audit/source snapshot.
- API public product detail trả `options[]`, `stickers[]`, `displayPrice`.
- Admin product form quản lý M:N option/sticker theo pattern category hiện có.

## Related Code Files

- Modify: `server/src/modules/products/*`
- Create/extend: admin product options/stickers routes under `server/src/modules/admin/*` or product admin service.
- Modify: seed scripts under `server/src/db/*`
- Modify: `src/components/admin/forms/ProductForm.tsx`
- Modify: `src/pages/ProductDetailPage.tsx`
- Modify: `src/services/products.service.ts`

## Implementation Steps

1. Cập nhật schema response `products.schemas.ts` để thêm option/sticker.
2. Products service dùng join query + group JS, tránh N+1.
3. Seed 6 product options và product-option links; với dữ liệu chưa chắc thì set option theo source evidence, không bịa.
4. Seed sticker master và product_stickers nếu có source evidence; nếu thiếu, tạo admin support nhưng không seed fake.
5. Admin product form thêm section Options và Stickers, dùng primitive hiện có.
6. Product detail page thêm option picker; default chọn option sort đầu tiên hoặc base price nếu không có option.
7. Smoke kiểm tra Americano có Lạnh M/Nóng/Lạnh L nếu seed có evidence.

## Success Criteria

- [x] Public product detail không mất backward compatibility khi product không có option.
- [x] Product có option hiển thị giá theo lựa chọn.
- [x] Admin update product options/stickers phản ánh ra public sau reload/query invalidate.
- [x] Không thêm cart/order model.
- [x] FE lint/build sạch; server lint/build + smoke products sạch.

## Risk Assessment

Risk: source option data không đủ toàn bộ 42 sản phẩm. Mitigation: chỉ seed verified option; UI fallback rõ cho sản phẩm chưa có option.
Risk: admin form quá lớn. Mitigation: tách component nhỏ dưới `src/components/admin/forms/`.
