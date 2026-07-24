---
phase: 6
title: Verify va smoke
status: completed
priority: P1
effort: 2h
dependencies:
  - 5
---

# Phase 6: Verify va smoke

## Overview

Sửa smoke suite đang assert vào thứ plan này xóa, verify vòng admin→public đầu
cuối, cập nhật docs. Không thêm feature.

## Requirements

- Functional: toàn bộ smoke suite xanh; vòng admin sửa option → public phản ánh.
- Non-functional: docs khớp trạng thái mới; không để assert cũ "sửa cho xanh" mà
  mất ý nghĩa kiểm tra.

## Architecture

**`smoke-options-stickers.ts` sẽ đỏ ở 3 chỗ — đã xác định chính xác:**

| Dòng | Assert hiện tại | Vì sao gãy | Sửa thành |
|---|---|---|---|
| ~131 | `option.name === 'Lạnh Size L' && price === 55000` | Tên này bị xóa, chuyển thành `label` | `option.label === 'Lạnh (Size L)' && price === 55000` |
| ~138 | `data.length >= 8` options | Catalog co còn đúng 4 | `=== 4` + assert đủ 4 tên chuẩn |
| ~141-159 | `POST /api/admin/stickers` → attach → public | Route/bảng biến mất | Thay bằng: gắn presentation category có `badgeColor` → public hiện badge |
| ~17, ~24 | type local `options: {name, price}[]`, `optionLinks: {optionId, name, price}[]` | Thiếu `label` | Thêm `label` vào cả hai |
| ~102-103 | `payload.optionLinks = ...` (không có `label`), `stickerIds` | Shape đổi | Bỏ `stickerIds`; map thêm `label` |

Đây là **sửa assert cho đúng nghiệp vụ mới**, không phải nới lỏng để qua bài.
Mỗi thay đổi phải giữ nguyên ý định kiểm tra ban đầu.

### Thêm case mới (không có sẵn, phải viết)

Phase 5 thêm ràng buộc giá > 0 — phải có test, nếu không thì ràng buộc đó không
được bảo vệ:

- `POST/PUT` product với `optionLinks: [{optionId, price: 0}]` → **PHẢI trả 400**,
  không phải 200 và không phải 500. Verify DB không có link nào giá 0.

Suite khác cần rà: `smoke-admin-products.ts` (payload có `stickerIds`),
`smoke-api.ts` (shape public sản phẩm giờ có `options[].label`).

## Related Code Files

- Modify: `server/scripts/smoke-options-stickers.ts`
- Modify: `server/scripts/smoke-admin-products.ts` (nếu có `stickerIds`)
- Modify: `docs/database-design.md` — bảng mới, bỏ 2 bảng cũ
- Modify: `docs/backend-architecture.md` — module sticker biến mất
- Modify: `docs/deviations-from-original.md` — ghi quyết định gộp sticker,
  và quyết định không làm `detail_html`
- Modify: `README.md` — nếu có nhắc mục sticker trong admin

## Implementation Steps

1. `grep -rn "stickerIds\|/admin/stickers\|Lạnh Size" server/scripts/` — liệt kê
   hết chỗ gãy trước khi sửa.
2. Sửa 3 assert trong `smoke-options-stickers.ts` theo bảng §Architecture.
3. Thay case sticker bằng case category: tạo/tick presentation category có
   `badgeColor` → GET public → assert badge có `label` + `color` đúng.
4. Chạy lần lượt, không chạy gộp để biết cái nào đỏ:
   ```bash
   cd server
   npm run smoke:api
   npm run smoke:admin-products
   npm run smoke:options-stickers
   ```
5. Verify thủ công vòng admin→public:
   - Mở admin → sản phẩm Americano → đổi giá option `Lạnh (Size L)` 55000 → 57000
   - Lưu → reload trang public `/menu/americano-s153t2` → thấy 57000
   - Đổi lại về 55000
6. Verify badge: bỏ tick `SẢN PHẨM MỚI` ở 1 sản phẩm → public mất badge → tick lại.
7. Cập nhật docs (4 file ở §Related Code Files).
8. Chạy full: FE `npm run lint && npm run build`; server `npm run lint && npm run build`;
   `npm run test:admin-ui`.
9. Chạy nốt các smoke còn lại để chắc không vạ lây:
   `smoke:auth`, `smoke:upload`, `smoke:images`, `smoke:search-submissions`,
   `smoke:pages-gallery`, `smoke:admin-blog`, `smoke:admin-stores`,
   `smoke:admin-banners-settings`.

## Success Criteria

- [x] 11 smoke suite đều xanh.
- [x] `npm run test:admin-ui` xanh (vitest, 10/10).
- [x] FE lint/build + server lint/build sạch.
- [x] Vòng admin→public verify: option round-trip (đổi giá → lưu → public phản
      ánh), badge category giữ nguyên qua smoke `options-stickers`.
- [x] Docs khớp: `database-design.md:57` từng nói `sản phẩm ↔ sticker qua
      product_stickers` — mâu thuẫn với chính dòng 100 của cùng file nói bảng đó
      không còn. Đã sửa dòng 57.
- [x] `deviations-from-original.md` đã có 2 quyết định (gộp sticker vào category,
      không làm `detail_html`) từ trước — không cần sửa thêm.

### Việc phát sinh ngoài kế hoạch gốc — tìm được qua code review, không phải qua
đọc lại plan

1. **Bug 500 thay vì 400 khi trùng `optionId`** — `products.admin.schemas.ts`
   thiếu ràng buộc unique trên `optionLinks[].optionId`. Payload trùng
   `optionId` pass qua Zod, chạm `PRIMARY KEY (product_id, option_id)` ở DB,
   error handler không map ra 400 → rơi 500. Verify bằng repro thật: request
   PUT với 2 link cùng `optionId` → 500 trước fix, 400 sau fix (kèm
   `field: "optionLinks.1.optionId"`). Data Americano không bị ảnh hưởng
   (transaction rollback đúng cả trước và sau fix).
   Fix: thêm `.superRefine()` chặn trùng `optionId` trước khi tới DB.
2. **Bỏ tick option làm mất giá/nhãn đã nhập** — `ProductOptionFields.tsx` xóa
   hẳn phần tử khỏi mảng khi untick, thay vì giữ và chỉ ẩn UI (lệch với chính
   spec đã ghi ở phase 5: "tick tắt thì giữ giá trị trong state"). Thêm field
   `ticked: boolean` vào `OptionLinkDraft`; `ProductForm` lọc theo `ticked` khi
   validate và khi submit, không còn xóa dữ liệu khi untick.

## Risk Assessment

**Risk (cao):** sửa assert cho xanh mà mất ý nghĩa kiểm tra — đúng thứ
`development-rules.md` cấm ("DO NOT ignore failing tests just to pass the build").
**Mitigation:** mỗi assert sửa phải giữ nguyên ý định gốc. Case sticker không xóa
mà **thay bằng** case category tương đương. Ghi lý do đổi ngay trong comment test.

**Risk:** smoke cần `ADMIN_EMAIL`/`ADMIN_PASSWORD` và stack Compose chạy.
**Mitigation:** dựng stack + `create-admin` trước khi chạy; nếu chưa có thì báo
rõ là chưa chạy được, không báo "pass".

**Risk:** docs sót chỗ nhắc sticker.
**Mitigation:** `grep -rn "sticker" docs/ README.md` cuối phase.
