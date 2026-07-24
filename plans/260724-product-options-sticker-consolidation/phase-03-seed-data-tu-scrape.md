---
phase: 3
title: Seed data tu scrape
status: completed
priority: P1
effort: 2h
dependencies:
  - 2
---

# Phase 3: Seed data tu scrape

## Overview

Đưa data cào được vào `seed.ts`, thay `productOptionLinkSeed` hiện chỉ có 1 sản
phẩm. Giữ nguyên cấu trúc seed đang có — không đổi kiến trúc seed ở phase này.

## Requirements

- Functional: chạy `npm run db:seed` xong, 18 sản phẩm có option đúng như source (47 link);
  `product_option_links.label` có giá trị.
- Non-functional: seed vẫn idempotent (chạy 2 lần ra cùng kết quả). Không seed
  giá trị chưa verify.

## Architecture

`seed.ts` hiện có (dòng 30-43):

```ts
const optionCatalog = ['Lạnh','Nóng','Size nhỏ','Size vừa','1 Egg','2 Eggs',
                       'Lạnh Size M','Lạnh Size L'];
const productOptionLinkSeed = { 'americano-s153t2': [...] };  // 1 sản phẩm
```

Đổi thành: import từ `product-options-scraped.ts`, bỏ hardcode.

**`optionCatalog` sẽ co lại** từ 8 xuống ~4 tên (`Lạnh`, `Nóng`, `Size nhỏ`,
`Size vừa`) — vì `Lạnh Size M` / `Lạnh Size L` từng là workaround cho việc thiếu
cột `label`, giờ chuyển thành `label` của link. `1 Egg` / `2 Eggs` giữ lại **chỉ
khi** scrape thật sự thấy (sản phẩm egg-coffee); nếu không thấy thì bỏ — không
seed option không có sản phẩm nào dùng.

`productOptions` có `UNIQUE(name)` và link tham chiếu `onDelete: 'restrict'` →
xóa option đang có link sẽ lỗi. Thứ tự bắt buộc: xóa link trước, rồi mới xóa
option mồ côi.

**Giá gốc `products.price`:** scrape báo lệch thì **không tự sửa**. `products.price`
là giá hiển thị mặc định, option là giá theo lựa chọn — hai thứ khác nhau. Ghi
danh sách lệch vào output phase 2, để người xem quyết định riêng.

## Related Code Files

- Modify: `server/src/db/seed.ts` (dòng ~30-43 và block seed option ~208-238)
- Read: `server/src/db/seed-data/product-options-scraped.ts`

## Implementation Steps

1. `seed.ts`: bỏ `optionCatalog` + `productOptionLinkSeed` hardcode, import từ
   `product-options-scraped.ts`.
2. Block seed option (hiện ~dòng 208): thêm `label` vào values:
   ```ts
   return {
     productId: productRow.id,
     optionId,
     label: link.label,
     priceAmount: link.price,
     quantity: 1,     // nguồn trả 0 cho cả 47/47 → không mang thông tin.
                      // Hardcode 1; schema có CHECK (quantity > 0).
     sortOrder,
   };
   ```
   **Lưu ý:** đã verify `ITL_Quantity = 0` ở toàn bộ 47 link. Cột này nguồn không
   dùng. Insert thẳng 0 sẽ vi phạm `CHECK (quantity > 0)` và fail seed.
3. Dọn option mồ côi: sau khi seed link xong, xóa hàng `product_options` không
   còn link nào trỏ tới. Thứ tự: link trước, option sau.
4. Bỏ throw `Option link seed: không thấy sản phẩm ${productSlug}` thành cảnh báo
   nếu scrape có slug không khớp DB — hoặc giữ throw nếu muốn chặt. Chọn throw
   (fail loud) cho nhất quán với code hiện có.
5. Chạy `npm run db:seed` trên DB local sạch, kiểm tra bằng SQL — **con số kỳ vọng
   đã verify từ scrape, lệch là sai**:
   ```sql
   SELECT count(DISTINCT product_id) FROM product_option_links;   -- PHẢI = 18
   SELECT count(*) FROM product_option_links;                     -- PHẢI = 47
   SELECT count(*) FROM product_options;                          -- PHẢI = 4
   SELECT po.name, count(*) FROM product_option_links pol
     JOIN product_options po ON po.id = pol.option_id
     GROUP BY po.name;   -- Size vừa 15, Nóng 13, Lạnh 11, Size nhỏ 8
   ```
6. `cd server && npm run lint && npm run build`.

## Success Criteria

- [ ] `npm run db:seed` chạy sạch, không vi phạm CHECK constraint.
- [ ] Chạy `db:seed` 2 lần liên tiếp ra cùng số row (idempotent).
- [ ] `product_options` còn đúng 4 hàng; tên thừa (`Lạnh Size M`, `Lạnh Size L`,
      `1 Egg`, `2 Eggs`) biến mất.
- [ ] 18 sản phẩm có option, 47 link — khớp SQL ở bước 5.
- [ ] Americano có đúng 3 link, label `Lạnh (Size M)`/`Lạnh (Size L)`/`Nóng`,
      giá 45000/55000/45000.
- [ ] `black-coffee-s145t2` có đúng 4 link (35k/39k/49k/39k) — sản phẩm nhiều
      option nhất, dễ lộ lỗi mapping.
- [ ] `GET /api/products/americano-s153t2` trả đủ 3 option kèm label.
- [ ] 24 sản phẩm một giá không có link nào.

## Risk Assessment

**Risk:** `quantity: 0` từ source vi phạm `CHECK (quantity > 0)` → seed fail giữa chừng.
**Mitigation:** map `0 → 1` ở bước 2. Đã ghi rõ vì đây là lỗi chắc chắn xảy ra
nếu insert thẳng.

**Risk:** xóa option mồ côi gặp FK `onDelete: 'restrict'`.
**Mitigation:** xóa link trước, option sau. Seed chạy trong transaction — fail thì
rollback sạch, không để DB nửa vời.

**Risk:** `db:seed` ghi đè option admin đã tự gắn tay.
**Mitigation:** không giải được trong phase này (nợ đã ghi ở plan.md). Chỉ chạy
seed khi dựng môi trường, không chạy thường xuyên.
