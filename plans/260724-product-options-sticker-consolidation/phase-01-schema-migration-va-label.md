---
phase: 1
title: Schema migration va label
status: completed
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: Schema migration va label

## Overview

Thêm hai cột để biểu diễn đúng dữ liệu nguồn: `product_option_links.label` (nhãn
hiển thị riêng mỗi link) và `categories.badge_color` (thay `stickers.color`).
Chưa drop bảng sticker ở phase này — drop nằm ở phase 4 sau khi public/admin đã
chuyển xong, để không gãy giữa chừng.

## Requirements

- Functional: `product_option_links` lưu được nhãn hiển thị khác tên option chuẩn.
  `categories` lưu được màu badge cho hàng `kind='presentation'`.
- Non-functional: migration sinh bằng `npm run db:generate`, không viết tay SQL.
  Cột nullable để migration chạy được trên DB đang có dữ liệu.

## Architecture

Vì sao cần `label` tách khỏi `product_options.name` — evidence từ source:

```
Americano:     ITL_Name "Lạnh (Size L)"  → DefaultName "Size vừa"
Black Coffee:  ITL_Name "Lạnh (size M)"  → DefaultName "Lạnh"
Caramel Jelly: ITL_Name "SIZE M"         → DefaultName "Size nhỏ"
Chocolate:     ITL_Name "HOT"            → DefaultName "Nóng"
```

Cùng một nhãn hiển thị map sang `DefaultName` khác nhau tùy sản phẩm → không thể
gộp vào một catalog dùng chung. Mô hình:

- `product_options.name` = `DefaultName` — vocabulary chuẩn, 4 giá trị
  (`Lạnh`, `Nóng`, `Size nhỏ`, `Size vừa`). Dùng để nhóm/lọc.
- `product_option_links.label` = `ITL_Name` — chuỗi hiển thị lộn xộn của source.
  `NULL` → public fallback về `product_options.name`.

`categories.badge_color` chỉ có nghĩa khi `kind='presentation'`. Không thêm CHECK
constraint ràng buộc điều này — hàng `kind='category'` để `NULL` là đủ, thêm
constraint chỉ tạo ma sát khi admin đổi `kind`.

### ⚠ Public option picker key theo `name` — phải đổi sang `label`

`ProductDetailPage.tsx` dùng `option.name` làm **React key và state chọn**:

```tsx
const [selectedOption, setSelectedOption] = useState<string>();
const activeOption = options.find((o) => o.name === selectedOption) ?? options[0];
// ...
<button key={option.name} onClick={() => setSelectedOption(option.name)}>
```

Sau khi chuyển sang catalog 4 loại, **một sản phẩm có thể có 2 link cùng `name`**.
Ví dụ có thật trong dữ liệu cào: `black-coffee` có `Lạnh (size S)`→Size nhỏ,
`Lạnh (size M)`→Lạnh, `Lạnh (size L)`→Size vừa, `Nóng`→Nóng — 4 loại khác nhau nên
ok. Nhưng nếu mapping đổi hoặc admin gắn tay 2 nhãn cùng loại thì:
- React key trùng → cảnh báo + render sai
- Bấm nút này sáng nút kia (state so sánh theo `name`)

**Fix ở phase này:** thêm `label` vào `productOptionSchema` public và đổi
`ProductDetailPage` key/state sang `label`. Không để sang phase sau — schema đổi ở
đây thì consumer phải đổi cùng lúc, nếu không build đỏ giữa chừng.

```ts
// products.schemas.ts
export const productOptionSchema = z.object({
  name: z.string(),            // loại chuẩn — giữ để nhóm/lọc sau này
  label: z.string(),           // nhãn hiển thị; service fallback về name khi null
  price: z.number().int().nonnegative(),
});
```

Service trả `label: row.label ?? row.name` → public luôn có chuỗi để hiển thị,
`ProductDetailPage` không cần xử lý null.

**Lưu ý PK:** `PRIMARY KEY (product_id, option_id)` vốn đã chặn 2 link cùng loại
trong cùng sản phẩm. Nên ca trùng chỉ xảy ra nếu PK bị đổi — không nằm trong scope.
Đổi key sang `label` là để đúng ngữ nghĩa (hiển thị cái gì thì key theo cái đó).

## Related Code Files

- Modify: `server/src/db/schema.ts` — thêm 2 cột
- Create: `server/src/db/migrations/0005_*.sql` (sinh tự động bởi `db:generate`)
- Modify: `server/src/modules/products/products.schemas.ts` — `productOptionSchema.label`
- Modify: `server/src/modules/products/products.service.ts` — select + fallback `label`
- Modify: `server/src/modules/products/products.admin.service.ts` — select thêm `label`
- Modify: `server/src/modules/products/products.admin.schemas.ts` — `optionLinks[].label`
- Modify: `src/pages/ProductDetailPage.tsx` — key/state theo `label` thay vì `name`
- Modify: `server/src/modules/categories/categories.schemas.ts` — `badgeColor`

## Implementation Steps

1. `server/src/db/schema.ts`:
   ```ts
   // trong productOptionLinks
   label: text('label'),          // nhãn hiển thị của nguồn; NULL → dùng productOptions.name

   // trong categories
   badgeColor: text('badge_color'),  // màu badge, chỉ dùng cho kind='presentation'
   ```
2. Chạy `cd server && npm run db:generate` → sinh `0005_*.sql`. **Không sửa tay
   file SQL.** Đọc lại file sinh ra để chắc chỉ có 2 `ALTER TABLE ADD COLUMN`.
3. Chạy `npm run db:migrate` trên DB local, xác nhận không lỗi.
4. `products.schemas.ts`: thêm `label: z.string()` vào `productOptionSchema`.
   **Không dùng `.optional()`** — service luôn fallback nên public luôn có giá trị;
   optional sẽ đẩy việc xử lý null xuống mọi consumer.
5. Mở rộng contract đọc: `products.service.ts` select thêm `label`, trả
   `label: row.label ?? row.name`. `products.admin.service.ts` trả `label` thô
   (admin cần biết đang null để hiện placeholder).
6. `ProductDetailPage.tsx`: đổi `key`, `setSelectedOption`, và so sánh `activeOption`
   từ `option.name` sang `option.label`.
7. Mở rộng schema Zod admin: `optionLinks[]` nhận thêm
   `label: z.string().trim().max(120).nullable().optional()`.
8. `categories.schemas.ts`: thêm `badgeColor` vào shape trả về + input admin.
9. `cd server && npm run lint && npm run build`; root `npm run lint && npm run build`.

## Success Criteria

- [ ] `npm run db:generate` sinh đúng 1 migration, chỉ chứa 2 ADD COLUMN.
- [ ] `npm run db:migrate` chạy sạch trên DB đang có dữ liệu (không mất row).
- [ ] `GET /api/products/americano-s153t2` trả `options[].label` — với data cũ
      (`label` NULL) thì fallback ra `name`, không trả null.
- [ ] Trang chi tiết Americano vẫn chọn được option, giá đổi đúng theo lựa chọn.
- [ ] `categories: z.array(z.string())` **không đổi** — `src/data/products.ts` và
      `seed.ts:112` vẫn build được.
- [ ] server + FE lint/build sạch.

## Risk Assessment

**Risk:** `db:generate` sinh thêm thay đổi ngoài ý muốn nếu `schema.ts` đã lệch
với migration hiện có.
**Mitigation:** đọc file SQL sinh ra trước khi migrate; nếu có statement lạ thì
dừng và điều tra, không migrate bừa.

**Risk:** thêm cột vào select làm gãy type ở FE (import type trực tiếp từ server).
**Mitigation:** cột optional/nullable; chạy FE `npm run build` cuối phase để bắt sớm.
