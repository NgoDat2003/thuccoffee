# Phase 3 — Schema Drizzle và migration

Trạng thái: Pending
Ưu tiên: P1
Phụ thuộc: Phase 2

## Bối cảnh

- Thiết kế đầy đủ 14 bảng, ràng buộc, index: `docs/database-design.md`
- Kiểu dữ liệu hiện tại: `src/data/types.ts`

## Mục tiêu

Dựng 14 bảng trong Postgres bằng Drizzle, khớp thiết kế đã chốt.

## Bảng

| Bảng | Ghi chú |
|---|---|
| `categories` | `key` UNIQUE |
| `products` | `slug` UNIQUE, `price` integer; sticker qua bảng nối, không phải cột |
| `product_categories` | PK gộp `(product_id, category_id)`, hai FK CASCADE |
| `product_options` | catalog dùng chung, `name` + `sort_order` |
| `product_option_links` | PK gộp, `price_amount` + `quantity`; FK option RESTRICT |
| `stickers` | `label` + `color` |
| `product_stickers` | PK gộp, nhiều-nhiều sản phẩm ↔ sticker |
| `blog_posts` | thêm `content`, `published_at` kiểu `date` |
| `stores` | thêm `region`; gallery chuyển sang `media_attachments` |
| `banners` | thêm cột `type` (promotion/right/slider) |
| `site_settings` | key-value, `key` là PK |
| `media_attachments` | polymorphic `owner_type`/`owner_id`, `storage_key` |
| `static_pages` | chỉ tuyển dụng + chương trình thành viên, `key` UNIQUE |
| `users` | có sẵn cột `role` |

Chỉ 8 bảng có dữ liệu seed từ `src/data` (categories, products,
product_categories, blog_posts, stores, banners, users, và media_attachments cho
gallery cửa hàng). `product_options`, `product_option_links`, `stickers`,
`product_stickers`, `site_settings`, `static_pages` để trống lúc seed — chúng
chỉ có dữ liệu khi admin nhập qua giao diện sau; catalog option có thể seed 6
dòng gốc.

## Điểm cần chú ý

**`price` là `integer`.** Giá VNĐ không có phần lẻ. Dùng `numeric` sẽ thừa và
gây phiền khi tính toán.

**Gallery cửa hàng dùng `media_attachments`**, không phải `text[]`. Ảnh có thứ
tự, link, vai trò riêng — mảng làm mất các thuộc tính đó.

**`media_attachments` polymorphic** — `owner_type`/`owner_id` không có khoá ngoại
cứng (Postgres không hỗ trợ). Toàn vẹn xử lý ở tầng service. `storage_key` giờ là
tên file, sau chuyển thành object key MinIO mà không migrate.

**`published_at` kiểu `date` thật**, không phải chuỗi. Việc chuyển từ
`'03.06.2026'` để ở phase 4.

**Cột `is_published` mặc định `true`** để dữ liệu seed hiện ra ngay.

## File tạo mới

- `server/src/db/schema.ts` — định nghĩa 14 bảng
- `server/src/db/client.ts` — kết nối Postgres, đọc `DATABASE_URL`
- `server/drizzle.config.ts` — cấu hình sinh migration
- `server/src/db/migrations/` — SQL do Drizzle sinh

## Các bước

1. Cài `drizzle-kit` vào dev deps của `server/`.
2. Viết `schema.ts` cho 14 bảng theo `docs/database-design.md`, kèm index đã
   liệt kê ở đó.
3. Viết `client.ts` tạo pool `pg` và export instance Drizzle.
4. Viết `drizzle.config.ts` trỏ tới `schema.ts` và thư mục migration.
5. Chạy `drizzle-kit generate` sinh SQL.
6. Đọc lại SQL sinh ra, đối chiếu với tài liệu thiết kế trước khi áp dụng.
7. Chạy migration lên database local.
8. Kiểm tra bằng `psql`: `\dt` liệt kê 14 bảng, `\d products` đúng cột và kiểu.
9. Thêm script `db:generate`, `db:migrate` vào `server/package.json`.

## Todo

- [ ] Cài `drizzle-kit`
- [ ] `schema.ts` với 14 bảng
- [ ] Index theo tài liệu thiết kế
- [ ] `client.ts`
- [ ] `drizzle.config.ts`
- [ ] Sinh migration và đọc lại SQL
- [ ] Áp dụng migration
- [ ] Xác minh bằng `psql`
- [ ] Script `db:generate`, `db:migrate`

## Tiêu chí hoàn thành

- `\dt` trong psql liệt kê đúng 14 bảng.
- `slug` UNIQUE ở `products`, `blog_posts`, `stores`.
- `categories.key` UNIQUE.
- FK của `product_categories`, `product_stickers` có `ON DELETE CASCADE`.
- `product_option_links.option_id` FK có `ON DELETE RESTRICT`.
- `media_attachments` có cột `owner_type`, `owner_id`, `storage_key` (không có
  FK cứng cho owner).
- `blog_posts.published_at` là `date`.
- Chạy migration lần hai không lỗi và không đổi gì.

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| SQL sinh ra khác thiết kế | Bước 6 đọc lại trước khi áp dụng |
| Kiểu mảng khai báo sai | Kiểm tra `\d stores` thấy `text[]` |
| Migration chạy hai lần gây lỗi | Drizzle theo dõi migration đã áp dụng; kiểm chứng ở tiêu chí cuối |
