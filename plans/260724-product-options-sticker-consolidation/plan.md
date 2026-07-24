---
title: Product options scrape va sticker consolidation
description: >-
  Cào option/giá thật cho 42 sản phẩm (18 có nhiều giá, 47 link), gộp sticker
  vào presentation category, dựng lại ô option thành lưới card động.
status: completed
priority: P1
effort: 16h
branch: feat/public-parity-cms-scope
tags:
  - feature
  - backend
  - frontend
  - database
  - admin
  - scrape
blockedBy: []
blocks: []
created: '2026-07-24T02:29:49.882Z'
createdBy: 'ck:plan'
source: skill
---

# Product options scrape va sticker consolidation

## Overview

Ba việc gắn nhau, làm chung một vòng:

1. **Cào option thật** — hiện `product_option_links` chỉ có 1 sản phẩm
   (`americano-s153t2`). Cào đủ 42 sản phẩm từ source — **đã cào xong**: 18 sản
   phẩm có nhiều mức giá, 47 option link.
2. **Bỏ bảng `stickers`** — scrape chứng minh source chỉ có 2 nhãn
   (`SẢN PHẨM MỚI`, `Yêu thích nhất`), trùng đúng presentation category đã có.
   Một sự thật đang nằm 3 nơi: `categories(kind='presentation')`,
   `products.isFeatured`, và `stickers`.
3. **Dựng lại ô option** trong admin thành lưới card động (checkbox + giá + nhãn
   + số lượng), thay list dọc hiện tại.

Nguồn evidence: probe trực tiếp source ngày 2026-07-24 (xem §Evidence).

## Evidence đã verify

Đã fetch thật từ `thuccoffee.com.vn`, không suy đoán:

| Sự thật | Cách verify |
|---|---|
| Product detail ở `/menu/:slug` (không phải `/san-pham/:slug`) | `/menu/americano-s153t2` → 200; `/san-pham/...` → 404 |
| Option nằm trong DOM `.option-item` → `.opt-name` + `.opt-price` | Cào 42/42 sản phẩm, 0 lỗi |
| **18 sản phẩm nhiều giá, 24 một giá, 47 option link** | Cào đủ 42 slug ngày 2026-07-24 |
| Giá DOM khớp 100% JSON `ITL_PriceAmount` | 47/47 link, 0 lệch |
| **14 nhãn hiển thị distinct → map về 4 loại chuẩn** | `Nóng`/`HOT`, `Lạnh (Size M)`/`Lạnh(Size M)`/`SIZE M`… |
| **`quantity` = 0 ở cả 47/47 link** → cột vô nghĩa | Nguồn không dùng; schema có `CHECK (> 0)` |
| **`DefaultName` KHÔNG phải phân loại** — là tên slot cố định của CMS | Form admin nguồn hiện slot `1 Egg`/`2 Eggs` ở SP không bán trứng; `espresso` nhãn `Nóng (size M)` nhưng `DefaultName`=`Lạnh` |
| **Không cần tài khoản admin của source** | Toàn bộ giá/option hiển thị công khai ở `/menu/<slug>`; đã cào đủ 42/42 |
| **`stickers` = 0 hàng, `product_stickers` = 0 hàng** | Query DB local 2026-07-24 → badge public hiện đang không hiển thị |
| **`san-pham-moi` 16 SP, `yeu-thich-nhat` 19 SP đã gắn sẵn** | Query DB; số 16 khớp card cào từ `/menu` |
| Trường "Chi tiết" (rich HTML) **rỗng** trên source | 10/10 sample `detail_len=0`; `class="description"` duy nhất là ô đăng ký nhận tin ở footer |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Schema migration va label](./phase-01-schema-migration-va-label.md) | Completed |
| 2 | [Scraper product options](./phase-02-scraper-product-options.md) | Completed |
| 3 | [Seed data tu scrape](./phase-03-seed-data-tu-scrape.md) | Completed |
| 4 | [Bo bang stickers sang presentation category](./phase-04-bo-bang-stickers-sang-presentation-category.md) | Completed |
| 5 | [Admin option card grid](./phase-05-admin-option-card-grid.md) | Completed |
| 6 | [Verify va smoke](./phase-06-verify-va-smoke.md) | Completed |

## Scope Contract

**In scope:**
- Cào option (nhãn hiển thị, loại chuẩn, giá, thứ tự) cho 42 sản phẩm.
- Mapping 14 nhãn hiển thị → 4 loại chuẩn, viết tay trong seed.
- Thêm `product_option_links.label`, thêm `categories.badge_color`.
- Drop `stickers` + `product_stickers`; gỡ admin page/service/route sticker.
- Dựng lại ô option admin thành lưới card động.

**Out of scope (đã chốt ở brainstorm):**
- `products.detail_html` / rich text cho sản phẩm — source rỗng, YAGNI. Để vòng sau.
- Cart/checkout/payment.
- Tách seed bootstrap-once khỏi dev-reset (nợ kỹ thuật riêng, không giải ở đây).
- Sửa `z.coerce.boolean()` footgun (việc riêng, xem §Nợ liên quan).

## Quyết định đã chốt

| Quyết định | Lý do |
|---|---|
| Giữ catalog 4 loại chuẩn + `label` riêng mỗi link (admin nhập 3 ô: chọn loại + giá + tên) | User chốt: muốn giữ khả năng lọc/báo cáo theo loại sau này. Khác CMS gốc (gốc chỉ 2 ô) nhưng public hiển thị y hệt. |
| Gán `option_id` **suy từ `label`**, không từ `DefaultName` | `DefaultName` là tên slot CMS, không phải phân loại — dùng nó sẽ tạo dữ liệu sai. Mapping 14 nhãn viết tay trong seed. |
| Bỏ bảng `stickers`, dùng presentation category + `badge_color` | Chỉ 2 nhãn tồn tại, đã model sẵn, và bảng đang rỗng hoàn toàn. |
| Không thêm `detail_html` | 10/10 sample rỗng trên source. |
| Lưới card động theo `optionCatalog`, không cứng 6 slot | 6 slot là giới hạn CMS cũ, không phải nghiệp vụ. |
| Ẩn ô `quantity` khỏi form, giữ cột DB = 1 | Nguồn trả 0 ở cả 47/47 link → không mang thông tin. |
| Tick option thì bắt buộc giá > 0; validate cả FE lẫn backend | 47/47 link nguồn đều có giá thật. Chỉ validate FE là hở. |

### Quyết định đã đảo trong quá trình brainstorm

| Từng chốt | Đảo thành | Vì sao |
|---|---|---|
| "Sửa 3 chỗ `DefaultName` sai trên nguồn" | **Không có lỗi nào để sửa** | Hiểu sai `DefaultName`. Nó là tên slot cố định, không phải phân loại — ảnh form admin nguồn chứng minh. |
| "Cào sticker cho toàn bộ sản phẩm" | **Không cào** | DB đã có sẵn `san-pham-moi` 16 + `yeu-thich-nhat` 19; chỉ thiếu 2 giá trị màu. |

## Dependencies

Không phụ thuộc plan nào đang mở.

**Nhánh:** làm tiếp trên `feat/public-parity-cms-scope` (không rẽ nhánh mới).
Quyết định của user 2026-07-24. Lý do hợp lệ: task này là phần dở dang của chính
vòng parity đó — `product_option_links` mới có 1/18 sản phẩm, `stickers` seed rỗng.
Nhánh đang sạch và đã đồng bộ `origin`.

Đánh đổi: nhánh sẽ gom 2 vòng việc, PR to hơn, khó revert riêng phần option nếu
cần. Chấp nhận vì hai vòng cùng chủ đề.

**Ghi chú bookkeeping:** `260721-1651-public-read-api-completion` và
`260722-1830-fe-full-api-migration` còn `status: in-progress` với phase "Pending",
nhưng việc chúng mô tả (site-settings module, FE gọi API) đã xong và được ghi
nhận hoàn thành trong `260723-public-parity-cms-completion` + README. Đây là
drift trạng thái, không phải việc còn tồn. Không block plan này. Nên đóng lại
trong một pass dọn riêng.

## Red-team review (2026-07-24)

Soi plan đối chiếu code thật, không chỉ đọc lại plan. Tìm được **3 lỗi chặn** —
đều đã sửa vào phase tương ứng.

| # | Lỗi | Bằng chứng | Sửa ở |
|---|---|---|---|
| 1 | Giả định `product.categories` là mảng object có `kind`/`badgeColor`. Thực tế là **`string[]` chỉ chứa key** → pseudocode không chạy | `products.schemas.ts:36` `categories: z.array(z.string())`; `products.service.ts:133` push `row.categoryKey` | phase 4 — query riêng, lọc trong SQL ✅ |
| 2 | Public option picker key/state theo `option.name`. Sau đổi mô hình, `name` là loại chuẩn dùng chung → key sai ngữ nghĩa | `ProductDetailPage.tsx:17,30,66-70` | phase 1 — `label` vào schema, key theo `label` ✅ |
| 3 | Bắt giá > 0 nhưng schema là `price.nonnegative()` (cho phép 0), smoke chưa có case test | `products.admin.schemas.ts:22` | phase 5 `.min(1)` + phase 6 case 400 ✅ |

**Lưu ý:** `ck plan check` tìm-thay chuỗi `Phase N` trên toàn file, không chỉ bảng
phases — nên bảng này từng bị ghi đè thành "Completed". Đã viết thường (`phase N`)
để tránh lặp lại.

**Bẫy đã tránh:** không đổi `categories: z.array(z.string())` sang mảng object.
Type này chia sẻ với `src/data/products.ts` qua `ProductSeedInput`, và `seed.ts:112`
gọi `.includes('yeu-thich-nhat')` — đổi shape sẽ gãy cả seed lẫn 42 record nguồn.

## Nợ liên quan (không giải trong plan này)

- `npm run db:seed` ghi đè nội dung admin đã sửa — plan này thêm data vào seed nên
  làm footprint đó rộng hơn. Chưa giải quyết.
- `z.coerce.boolean()` trong `products.schemas.ts`: `?featured=false` coerce
  thành `true`. Đã ghi nhận từ review 260723, chưa verify đã sửa chưa.

## Risks

| Risk | Mitigation |
|---|---|
| ~~Drop bảng mất dữ liệu sticker~~ → **rủi ro = 0** | Đã verify `stickers` 0 hàng, `product_stickers` 0 hàng. Phase 4 vẫn giữ bước đếm phòng DB khác. Cần user xác nhận không có env nào ngoài local. |
| Giá source có thể đã đổi từ lúc audit tháng 7 | Coi scrape là snapshot/seed, không phải chân lý. Ghi ngày cào vào file data. Cảnh báo chỗ lệch `products.price`, không tự sửa. |
| ~~Scrape bị chặn/timeout~~ → **đã cào xong** | 42/42 thành công, HTML thô đã cache. |
| Mapping 14 nhãn sai → 2 nhãn cùng SP map về 1 loại → vi phạm PK | Phase 2 bước 6 kiểm tra xung đột PK trước khi xuất. Hiện 0 xung đột. |
| Nhãn mới xuất hiện trên source chưa có trong mapping | Phase 2 dừng hẳn và báo, không đoán bừa. |
| `isFeatured` vs `yeu-thich-nhat` category vs sticker — 3 nơi cùng 1 sự thật | Phase 4 chốt: category là nguồn, `isFeatured` derive từ nó (đã đúng ở `seed.ts:113`), sticker biến mất. |
| Badge cần màu mới nhưng `stickers` rỗng nên không có màu cũ để copy | Phase 4 lấy từ design token trong `main.css`; không có token rõ thì hỏi user, không bịa hex. |

## Success Criteria (toàn plan)

- [ ] **18 sản phẩm** có option đúng giá/nhãn/thứ tự như source; **47 link**; **24**
      sản phẩm một giá không có link nào.
- [ ] `product_options` còn đúng **4** hàng.
- [ ] `stickers` + `product_stickers` không còn; public hiện đúng badge (lần đầu
      hoạt động — trước đó rỗng nên không hiện gì).
- [ ] Admin sửa option round-trip: đổi giá/nhãn → lưu → public phản ánh.
- [ ] Tick option để giá 0 → chặn ở FE; gọi API trực tiếp → 400, không vào DB.
- [ ] FE lint/build + server lint/build sạch.
- [ ] `smoke:options-stickers` + `smoke:admin-products` + `smoke:api` xanh.
