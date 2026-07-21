---
phase: 4
title: "Seed dữ liệu và kiểm chứng"
status: completed
priority: P1
dependencies: [3]
---

# Phase 4 — Seed dữ liệu và kiểm chứng

Trạng thái: Pending
Ưu tiên: P1
Phụ thuộc: Phase 3

## Bối cảnh

- Nguồn dữ liệu: `src/data/products.ts`, `blog.ts`, `stores.ts`, `categories.ts`
- Quy tắc slug: `docs/database-design.md`

## Mục tiêu

Đổ toàn bộ dữ liệu hiện có vào database, kiểm chứng bằng SQL.

## Số lượng cần khớp

| Bảng | Số bản ghi |
|---|---|
| `categories` | 10 |
| `products` | 42 |
| `blog_posts` | 10 |
| `stores` | 7 |
| `product_categories` | tổng số cặp sản phẩm–danh mục |
| `media_attachments` | ảnh gallery của 7 cửa hàng (owner_type=`store`) |
| `product_options` | 6 (catalog gốc) |

Để trống ở phase này: `banners`, `users`, `product_option_links`, `stickers`,
`product_stickers`, `site_settings`, `static_pages`. Chúng chỉ có dữ liệu khi
admin nhập qua giao diện sau — trừ catalog option seed 6 dòng gốc để sẵn.

Gallery cửa hàng **không** còn là cột mảng. Mỗi ảnh trong `gallery` của dữ liệu
gốc trở thành một dòng `media_attachments` với `owner_type='store'`,
`owner_id` = id cửa hàng, `storage_key` = tên file, `sort_order` theo thứ tự
trong mảng gốc.

## Hai việc phải xử lý

**Ngày tháng.** `blog.ts` lưu `'03.06.2026'` dạng `DD.MM.YYYY`. Cột
`published_at` là kiểu `date`. Cần hàm parse riêng — `new Date('03.06.2026')`
cho kết quả sai vì JavaScript hiểu là `MM.DD.YYYY` hoặc trả `Invalid Date`.
Kiểm tra cả 10 bản ghi sau khi seed.

**Chạy lại nhiều lần.** Seed phải dùng upsert theo `slug` (với `categories` là
`key`), không phải insert thuần. Chạy lần hai không được tạo bản ghi trùng và
không được lỗi.

## Giữ nguyên slug hiện có

Slug trong dữ liệu có hậu tố từ site gốc (`-s153t2`, `-s92t2`). Seed giữ
nguyên, không sinh lại — đổi slug là làm chết link đang chạy.

## File tạo mới

- `server/src/db/seed.ts` — đọc dữ liệu từ `src/data`, ghi vào DB
- `server/src/lib/parse-date.ts` — chuyển `DD.MM.YYYY` sang `Date`

## Import dữ liệu đúng cách

Import thẳng từ từng file gốc, **không qua `src/data/index.ts`**:

```ts
import { products } from '../../../src/data/products';
import { blogPosts } from '../../../src/data/blog';
```

`index.ts` kéo theo `pages.ts` (ngoài phạm vi) và các helper. Các file data gốc
(`products.ts`, `blog.ts`, `stores.ts`, `categories.ts`) chỉ import type, không
dính `import.meta.glob` hay `getImageUrl` — đã kiểm tra, nên Node đọc được trực
tiếp. Nếu về sau có file data thêm import từ `src/lib`, seed sẽ gãy; khi đó tách
riêng phần dữ liệu thuần.

## Các bước

1. Viết `parse-date.ts` tách chuỗi theo dấu chấm, dựng `Date` theo UTC.
2. Viết `seed.ts`:
   - seed `categories` trước (products tham chiếu tới)
   - seed `products`, rồi tạo liên kết trong `product_categories`
   - seed `blog_posts` với ngày đã parse
   - seed `stores`, rồi tách mỗi ảnh gallery thành một dòng `media_attachments`
     (`owner_type='store'`, `sort_order` theo thứ tự mảng gốc)
   - seed 6 dòng catalog `product_options`
   - mọi bảng dùng upsert theo cột UNIQUE
3. Thêm script `db:seed` vào `server/package.json`.
4. Chạy seed lần một.
5. Kiểm chứng bằng SQL: đếm số bản ghi từng bảng.
6. Kiểm tra một sản phẩm nhiều danh mục có đủ liên kết.
7. Kiểm tra ngày blog parse đúng — so vài bản ghi với `blog.ts`.
8. Kiểm tra `media_attachments` của một cửa hàng đúng số ảnh và đúng thứ tự.
9. Chạy seed lần hai, xác nhận số bản ghi không đổi.

## Todo

- [x] `parse-date.ts`
- [x] `seed.ts` với upsert
- [x] Script `db:seed`
- [x] Chạy seed lần một
- [x] Đếm bản ghi khớp: 10 / 42 / 10 / 7
- [x] Kiểm tra liên kết sản phẩm–danh mục
- [x] Kiểm tra ngày blog
- [x] Kiểm tra `media_attachments` của cửa hàng (số ảnh + thứ tự)
- [x] Seed 6 catalog option
- [x] Chạy seed lần hai, số bản ghi không đổi

## Tiêu chí hoàn thành

- Số bản ghi khớp bảng ở trên.
- Sản phẩm thuộc nhiều danh mục có đủ dòng trong `product_categories`.
- `published_at` khớp ngày trong `blog.ts` cho cả 10 bài.
- `media_attachments` của cửa hàng có đúng số ảnh và đúng thứ tự như dữ liệu gốc.
- Slug giữ nguyên hậu tố gốc.
- Chạy seed lần hai không tạo bản ghi mới, không lỗi.

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| `new Date()` hiểu sai `DD.MM.YYYY` | Hàm parse riêng, kiểm tra cả 10 bản ghi |
| Seed lần hai nhân đôi dữ liệu | Upsert theo cột UNIQUE, kiểm chứng ở bước 9 |
| Thiếu liên kết sản phẩm–danh mục | Đếm và đối chiếu với dữ liệu gốc |
| Ký tự tiếng Việt bị hỏng | Postgres mặc định UTF-8; kiểm tra một bản ghi có dấu |

## Sau phase này

Dữ liệu đã ở trong database nhưng frontend vẫn đọc từ `src/data/*.ts`. Hai
nguồn cùng tồn tại cho tới khi API sẵn sàng ở giai đoạn sau. Các file trong
`src/data/` chưa xoá — chúng vẫn là nguồn seed.
