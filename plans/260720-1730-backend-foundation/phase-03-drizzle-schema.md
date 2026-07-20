# Phase 3 — Schema Drizzle và migration

Trạng thái: Pending
Ưu tiên: P1
Phụ thuộc: Phase 2

## Bối cảnh

- Thiết kế đầy đủ 7 bảng, ràng buộc, index: `docs/database-design.md`
- Kiểu dữ liệu hiện tại: `src/data/types.ts`

## Mục tiêu

Dựng 7 bảng trong Postgres bằng Drizzle, khớp thiết kế đã chốt.

## Bảng

| Bảng | Ghi chú |
|---|---|
| `categories` | `key` UNIQUE |
| `products` | `slug` UNIQUE, `price` integer |
| `product_categories` | PK gộp, hai FK `ON DELETE CASCADE` |
| `blog_posts` | thêm `content`, `published_at` kiểu `date` |
| `stores` | `gallery` kiểu `text[]`, thêm `region` |
| `banners` | bảng mới |
| `users` | có sẵn cột `role` |

## Điểm cần chú ý

**`price` là `integer`.** Giá VNĐ không có phần lẻ. Dùng `numeric` sẽ thừa và
gây phiền khi tính toán.

**`gallery` dùng mảng Postgres**, không tách bảng. Drizzle hỗ trợ qua
`text('gallery').array()`.

**`published_at` kiểu `date` thật**, không phải chuỗi. Việc chuyển từ
`'03.06.2026'` để ở phase 4.

**Cột `is_published` mặc định `true`** để dữ liệu seed hiện ra ngay.

## File tạo mới

- `server/src/db/schema.ts` — định nghĩa 7 bảng
- `server/src/db/client.ts` — kết nối Postgres, đọc `DATABASE_URL`
- `server/drizzle.config.ts` — cấu hình sinh migration
- `server/src/db/migrations/` — SQL do Drizzle sinh

## Các bước

1. Cài `drizzle-kit` vào dev deps của `server/`.
2. Viết `schema.ts` cho 7 bảng theo `docs/database-design.md`, kèm index đã
   liệt kê ở đó.
3. Viết `client.ts` tạo pool `pg` và export instance Drizzle.
4. Viết `drizzle.config.ts` trỏ tới `schema.ts` và thư mục migration.
5. Chạy `drizzle-kit generate` sinh SQL.
6. Đọc lại SQL sinh ra, đối chiếu với tài liệu thiết kế trước khi áp dụng.
7. Chạy migration lên database local.
8. Kiểm tra bằng `psql`: `\dt` liệt kê 7 bảng, `\d products` đúng cột và kiểu.
9. Thêm script `db:generate`, `db:migrate` vào `server/package.json`.

## Todo

- [ ] Cài `drizzle-kit`
- [ ] `schema.ts` với 7 bảng
- [ ] Index theo tài liệu thiết kế
- [ ] `client.ts`
- [ ] `drizzle.config.ts`
- [ ] Sinh migration và đọc lại SQL
- [ ] Áp dụng migration
- [ ] Xác minh bằng `psql`
- [ ] Script `db:generate`, `db:migrate`

## Tiêu chí hoàn thành

- `\dt` trong psql liệt kê đúng 7 bảng.
- `slug` UNIQUE ở `products`, `blog_posts`, `stores`.
- `categories.key` UNIQUE.
- FK của `product_categories` có `ON DELETE CASCADE`.
- `stores.gallery` là `text[]`.
- `blog_posts.published_at` là `date`.
- Chạy migration lần hai không lỗi và không đổi gì.

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| SQL sinh ra khác thiết kế | Bước 6 đọc lại trước khi áp dụng |
| Kiểu mảng khai báo sai | Kiểm tra `\d stores` thấy `text[]` |
| Migration chạy hai lần gây lỗi | Drizzle theo dõi migration đã áp dụng; kiểm chứng ở tiêu chí cuối |
