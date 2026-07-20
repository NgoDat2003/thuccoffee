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

`banners` và `users` để trống ở phase này.

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

- `server/src/db/seed.ts` — đọc dữ liệu từ `../../../src/data`, ghi vào DB
- `server/src/lib/parse-date.ts` — chuyển `DD.MM.YYYY` sang `Date`

## Các bước

1. Viết `parse-date.ts` tách chuỗi theo dấu chấm, dựng `Date` theo UTC.
2. Viết `seed.ts`:
   - seed `categories` trước (products tham chiếu tới)
   - seed `products`, rồi tạo liên kết trong `product_categories`
   - seed `blog_posts` với ngày đã parse
   - seed `stores` với `gallery` là mảng
   - mọi bảng dùng upsert theo cột UNIQUE
3. Thêm script `db:seed` vào `server/package.json`.
4. Chạy seed lần một.
5. Kiểm chứng bằng SQL: đếm số bản ghi từng bảng.
6. Kiểm tra một sản phẩm nhiều danh mục có đủ liên kết.
7. Kiểm tra ngày blog parse đúng — so vài bản ghi với `blog.ts`.
8. Kiểm tra `gallery` của một cửa hàng đúng số phần tử.
9. Chạy seed lần hai, xác nhận số bản ghi không đổi.

## Todo

- [ ] `parse-date.ts`
- [ ] `seed.ts` với upsert
- [ ] Script `db:seed`
- [ ] Chạy seed lần một
- [ ] Đếm bản ghi khớp: 10 / 42 / 10 / 7
- [ ] Kiểm tra liên kết sản phẩm–danh mục
- [ ] Kiểm tra ngày blog
- [ ] Kiểm tra mảng gallery
- [ ] Chạy seed lần hai, số bản ghi không đổi

## Tiêu chí hoàn thành

- Số bản ghi khớp bảng ở trên.
- Sản phẩm thuộc nhiều danh mục có đủ dòng trong `product_categories`.
- `published_at` khớp ngày trong `blog.ts` cho cả 10 bài.
- `gallery` của cửa hàng có đúng số ảnh như dữ liệu gốc.
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
