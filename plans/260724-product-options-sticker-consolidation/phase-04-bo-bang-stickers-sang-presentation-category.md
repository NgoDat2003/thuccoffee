---
phase: 4
title: Bo bang stickers sang presentation category
status: completed
priority: P1
effort: 4h
dependencies:
  - 3
---

# Phase 4: Bo bang stickers sang presentation category

## Overview

Gộp `stickers` vào presentation category. Có DROP TABLE, nhưng **rủi ro đã đo được
là 0**: query ngày 2026-07-24 cho thấy `stickers` = **0 hàng**, `product_stickers`
= **0 hàng**. Không có dữ liệu nào để mất trên môi trường local.

Vẫn giữ thứ tự an toàn: chuyển đọc/ghi sang nguồn mới trước, verify, rồi mới drop —
phòng trường hợp có DB khác ngoài local.

**Hệ quả của việc 2 bảng rỗng:** badge trên public **hiện tại đang không hiển thị
gì cả**. Không phải phase này làm hỏng — nó vốn đã không chạy. Phase này làm cho
badge hoạt động lần đầu, dựa trên dữ liệu category đã có sẵn.

Dữ liệu category đã đủ, không cần cào:

| Category | kind | Số sản phẩm |
|---|---|---|
| `san-pham-moi` | presentation | **16** |
| `yeu-thich-nhat` | presentation | **19** |

Số 16 khớp chính xác số card `SẢN PHẨM MỚI` cào từ `/menu`.

## Requirements

- Functional: public hiện badge y như trước, nhưng đọc từ
  `categories(kind='presentation')` + `badge_color`. Admin tick 1 chỗ (danh mục),
  không còn mục sticker riêng.
- Non-functional: không mất badge nào đang hiển thị. Drop chỉ chạy sau khi đếm
  xác nhận không có dữ liệu ngoài seed.

## Architecture

**Ba nơi đang giữ cùng một sự thật:**

| Nơi | Hiện trạng |
|---|---|
| `categories(kind='presentation')` | `san-pham-moi`, `yeu-thich-nhat` — đã có, là nguồn thật |
| `products.isFeatured` | derive từ category `yeu-thich-nhat` tại `seed.ts:113` |
| `stickers` + `product_stickers` | trùng lặp, sẽ bỏ |

Sau phase: **category là nguồn duy nhất**. `isFeatured` giữ lại (query
`GET /api/products?featured=true` đang dùng, `products.service.ts:172`) nhưng vẫn
derive từ category ở seed — không đổi ngữ nghĩa, không đụng vào ở phase này.

Public shape giữ nguyên tên field `stickers` để **không phải sửa
`ProductDetailPage`**, chỉ đổi nguồn dữ liệu bên dưới.

### ⚠ Không lấy được từ `product.categories` — phải query riêng

`product.categories` trong public API là **`string[]` chỉ chứa `key`**, không phải
object. Xem `products.schemas.ts:36` (`categories: z.array(z.string())`) và
`products.service.ts:133` (`product.categories.push(row.categoryKey)`).

Nên pseudocode kiểu `categories.filter(c => c.kind === ...)` **không chạy được** —
không có `kind`, không có `badgeColor` trong mảng đó.

**Cách đúng:** trong `loadProductRelations()`, thay query `stickers` bằng query
`categories` join `product_categories`, lọc ngay trong SQL:

```ts
// thay cho innerJoin stickers/productStickers
db.select({
    productId: productCategories.productId,
    label: categories.label,
    color: categories.badgeColor,
  })
  .from(productCategories)
  .innerJoin(categories, eq(categories.id, productCategories.categoryId))
  .where(and(
    inArray(productCategories.productId, productIds),
    eq(categories.kind, 'presentation'),
    isNotNull(categories.badgeColor),
  ))
  .orderBy(asc(categories.sortOrder))
```

Trả về `{ label, color }` — khớp `productStickerSchema` hiện có, nên
`ProductDetailPage.tsx:47-55` và `productSchema` **không cần sửa**.

**KHÔNG đổi `categories: z.array(z.string())` thành mảng object.** Type này dùng
chung với `src/data/products.ts` qua `ProductSeedInput`
(`products.ts:1`), và `seed.ts:112` gọi `product.categories.includes('yeu-thich-nhat')`
— đổi shape sẽ gãy cả file seed lẫn 42 record nguồn.

**Màu badge:** `stickers.color` hiện có giá trị gì thì copy sang
`categories.badge_color` tương ứng trong seed. Không bịa màu mới.

## Related Code Files

- Modify: `server/src/db/seed.ts` — seed `badgeColor` cho 2 presentation category; bỏ seed sticker
- Modify: `server/src/db/schema.ts` — xóa `stickers`, `productStickers`
- Create: `server/src/db/migrations/0006_*.sql` (drop, sinh tự động)
- Modify: `server/src/modules/products/products.service.ts` — đổi nguồn sticker
- Modify: `server/src/modules/products/products.admin.service.ts` — bỏ join sticker
- Modify: `server/src/modules/products/products.admin.schemas.ts` — bỏ `stickerIds`
- Modify: `server/src/modules/admin/admin.routes.ts` — bỏ route sticker
- Delete: `server/src/modules/stickers/` (2 file)
- Delete: `src/pages/admin/AdminStickersPage.tsx`
- Delete: `src/services/admin/stickers.service.ts` (giữ phần options nếu chung file — xem bước 1)
- Modify: `src/routes.tsx`, `src/components/admin/AdminSidebar.tsx` — bỏ mục sticker

## Implementation Steps

1. **Đọc `src/services/admin/stickers.service.ts` trước.** File này export cả
   `useAdminProductOptions` lẫn `useAdminStickers`. Chỉ xóa phần sticker; phần
   options phải giữ (phase 5 dùng). Cân nhắc đổi tên file thành
   `product-options.service.ts` cho đúng nội dung còn lại.
2. **Đếm trước khi drop** — chạy trên mọi DB sẽ migrate:
   ```sql
   SELECT count(*) FROM product_stickers;   -- local: 0 (đã verify 2026-07-24)
   SELECT id, label, color FROM stickers;   -- local: 0 hàng
   ```
   Local đã xác nhận 0/0. Nếu DB nào khác ra khác 0 → có người nhập tay →
   **DỪNG, hỏi user.**
3. Đặt `badgeColor` cho `san-pham-moi` và `yeu-thich-nhat`.
   **`stickers` rỗng nên không có màu cũ để copy** — phải chọn màu mới. Lấy từ
   design token đang có trong `src/styles/main.css` (`@theme`), không hardcode hex
   lạ. Nếu không có token phù hợp thì hỏi user chọn màu, đừng tự bịa.
4. Đổi `products.service.ts`: bỏ join `stickers`/`productStickers`, dựng mảng
   `stickers` từ categories như §Architecture. Giữ nguyên tên field public.
5. Đổi `products.admin.service.ts` + `products.admin.schemas.ts`: bỏ `stickerIds`
   khỏi input/output admin.
6. Gỡ FE: `AdminStickersPage`, route, mục sidebar, phần sticker trong service.
7. **Verify public trước khi drop:** chạy stack, mở `/menu` và trang chi tiết
   một sản phẩm nhóm "SẢN PHẨM MỚI" → badge vẫn hiện đúng chữ + đúng màu.
8. Chỉ khi bước 7 xanh: xóa 2 bảng khỏi `schema.ts` → `npm run db:generate` →
   đọc SQL sinh ra (phải là 2 DROP TABLE) → `npm run db:migrate`.
9. `cd server && npm run lint && npm run build`; FE `npm run lint && npm run build`.

## Success Criteria

- [ ] Đếm `product_stickers` khớp seed đã biết; không có dữ liệu nhập tay.
- [ ] Public badge hiện đúng label + màu, verify bằng mắt trước khi drop.
- [ ] `stickers` + `product_stickers` không còn trong `schema.ts` và trong DB.
- [ ] Admin không còn mục sticker; tick danh mục presentation là đủ để badge hiện.
- [ ] `grep -ri "sticker" src/ server/src/` chỉ còn khớp ở tên field public
      `stickers` (cố ý giữ) — không còn bảng/route/page.
- [ ] FE + server lint/build sạch.

## Risk Assessment

**Risk (đã hạ từ CAO xuống THẤP):** DROP TABLE không hoàn tác.
**Trạng thái:** local đã verify `stickers` = 0 hàng, `product_stickers` = 0 hàng
→ không có gì để mất. Bước 2 vẫn giữ để chặn trường hợp DB khác. Chỉ cần user xác
nhận không có môi trường nào ngoài stack Compose local.

**Risk:** không có màu cũ để copy (bảng rỗng) → badge hiện trong suốt/mất chữ.
**Mitigation:** bước 3 phải chọn màu từ design token trong `main.css`. Bước 7
verify bằng mắt trước khi drop. Đây là màu **mới**, không phải khôi phục màu cũ —
cần user duyệt nếu không có token rõ ràng.

**Risk:** xóa nhầm `useAdminProductOptions` khi dọn service sticker → phase 5 gãy.
**Mitigation:** bước 1 đọc file trước, tách rõ phần giữ/phần bỏ.

**Risk:** admin tick category `kind='category'` (không phải presentation) rồi
tưởng có badge.
**Mitigation:** chỉ category có `badgeColor` mới sinh badge — hàng thường để NULL
nên không hiện. Hành vi này ghi vào docs ở phase 6.
