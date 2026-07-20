# Thiết kế Database

Thiết kế cho Postgres, phục vụ backend và trang admin. Chưa triển khai — tài liệu
này để chốt trước khi viết migration.

Nguồn dữ liệu hiện tại: `src/data/*.ts` (42 sản phẩm, 10 bài viết, 7 cửa hàng,
10 danh mục).

## Phạm vi

**Đưa vào DB:** sản phẩm, danh mục, bài viết, cửa hàng, banner, tài khoản.

**Giữ nguyên trong code:** `src/data/pages.ts` (FAQ, hạng thành viên, tin tuyển
dụng, chính sách cookie) và `src/data/category-paths.ts`. Nội dung trong
`pages.ts` có cấu trúc lồng nhau, mỗi mục một hình dạng khác nhau, và gần như
không đổi — bình thường hóa sẽ tốn thêm 4–5 bảng cho giá trị không tương xứng.
`category-paths.ts` là logic ánh xạ URL, thuộc về code.

**Ảnh:** DB chỉ lưu **tên file**, ảnh vẫn nằm trong `src/assets/images/` và được
`src/lib/image-url.ts` phân giải. Không có upload trong phạm vi này — thêm ảnh
mới vẫn phải commit vào repo.

## Sơ đồ quan hệ

```
categories ──┐
             ├── product_categories ──── products
             │
blog_posts   stores   banners   users
(độc lập)
```

Chỉ có một quan hệ nhiều-nhiều: một sản phẩm thuộc nhiều danh mục (tối đa 3
trong dữ liệu hiện tại). Các bảng còn lại độc lập.

## Bảng

### categories

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| key | text | UNIQUE — khớp `categories[].key`, dùng trong URL |
| label | text | Tên hiển thị, có dấu tiếng Việt |
| sort_order | integer | Thứ tự hiển thị |

### products

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| name | text | |
| slug | text | UNIQUE, dùng cho route `/menu/:slug` |
| price | integer | VNĐ, không có phần lẻ |
| price_estimated | boolean | Mặc định `false`; 11 sản phẩm hiện là `true` |
| thumb | text | Tên file ảnh nhỏ |
| image | text | Tên file ảnh đầy đủ |
| description | text | Cho phép NULL |
| is_published | boolean | Mặc định `true` |
| sort_order | integer | |
| created_at / updated_at | timestamptz | |

`price` dùng `integer` thay vì `numeric` vì giá VNĐ luôn nguyên. Tránh cả lỗi
làm tròn lẫn chi phí của kiểu thập phân.

### product_categories

| Cột | Kiểu | Ghi chú |
|---|---|---|
| product_id | integer | FK → products, ON DELETE CASCADE |
| category_id | integer | FK → categories, ON DELETE CASCADE |

PK gộp `(product_id, category_id)`. Xoá sản phẩm thì liên kết tự mất; xoá danh
mục cũng vậy — sản phẩm không bị xoá theo.

### blog_posts

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| title | text | |
| slug | text | UNIQUE, route `/chuyen-cua-thuc/:slug` |
| cover | text | Tên file ảnh bìa |
| summary | text | Tóm tắt hiển thị ở danh sách |
| content | text | Cho phép NULL — nội dung bài đầy đủ |
| published_at | date | |
| is_published | boolean | Mặc định `true` |
| created_at / updated_at | timestamptz | |

Cột `content` là mới. Dữ liệu hiện tại không có nội dung bài — `BlogDetailPage`
đang dùng lại `summary` làm phần thân. Thêm cột ngay từ đầu để sau này viết bài
dài không phải migrate.

`published_at` dùng kiểu `date` thật, không phải chuỗi `'03.06.2026'` như hiện
tại. Sắp xếp theo chuỗi sẽ sai thứ tự thời gian. Bước seed cần parse
`DD.MM.YYYY`, và frontend format lại khi hiển thị.

### stores

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| name | text | |
| slug | text | UNIQUE, route `/cua-hang/:slug` |
| address | text | |
| phone | text | Kiểu text, không phải số — có khoảng trắng và số 0 đầu |
| hours | text | Ví dụ `Mở cửa 24/7` |
| image | text | Ảnh đại diện |
| gallery | text[] | Mảng tên file, hiện nhiều nhất 5 ảnh mỗi cửa hàng |
| region | text | Cho phép NULL — nhóm chi nhánh theo khu vực |
| is_published | boolean | Mặc định `true` |
| sort_order | integer | |
| created_at / updated_at | timestamptz | |

`gallery` dùng mảng Postgres thay vì bảng riêng. Ảnh gallery không có thuộc tính
nào ngoài tên file và luôn được đọc/ghi nguyên khối, nên tách bảng chỉ thêm JOIN
mà không được gì.

Thêm chi nhánh mới chỉ là thêm một dòng — không cần đổi schema. Cột `region` để
nhóm theo khu vực khi cần; chỉ tách bảng `regions` nếu khu vực có thuộc tính
riêng.

### banners

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| image | text | Tên file |
| alt_text | text | Mô tả cho screen reader |
| link_url | text | Cho phép NULL |
| sort_order | integer | |
| is_active | boolean | Mặc định `true` |
| created_at / updated_at | timestamptz | |

Bảng mới. Banner hiện hardcode trong `src/components/home/BannerSlider.tsx` và
`PromoBanner.tsx`, nên đổi banner phải sửa code rồi deploy lại. Bảng này cho
phép bật/tắt, đổi thứ tự, đổi link qua admin — riêng ảnh mới vẫn cần commit.

### users

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| email | text | UNIQUE |
| password_hash | text | bcrypt hoặc argon2 — không bao giờ lưu plaintext |
| role | text | `admin` \| `editor`, mặc định `admin` |
| created_at / updated_at | timestamptz | |

Giai đoạn đầu chỉ có một tài khoản. Cột `role` để sẵn vì thêm cột sau tốn hơn
thêm ngay. Phân quyền chi tiết hơn (editor chỉ sửa được cửa hàng cụ thể) cần
bảng riêng — chưa có nhu cầu, chưa làm.

## Index

Ngoài PK và UNIQUE mặc định:

| Bảng | Index | Lý do |
|---|---|---|
| products | `is_published` | Lọc bài đã xuất bản ở mọi truy vấn công khai |
| blog_posts | `published_at DESC` | Danh sách blog sắp xếp theo ngày |
| blog_posts | `is_published` | Như trên |
| product_categories | `category_id` | Lọc sản phẩm theo danh mục |
| stores | `is_published` | |
| banners | `is_active, sort_order` | Truy vấn banner đang bật |

Dữ liệu chỉ vài chục dòng nên index chưa ảnh hưởng tốc độ. Khai báo sẵn để không
phải quay lại khi dữ liệu lớn hơn.

## Ràng buộc

- `slug` UNIQUE ở cả ba bảng có route — trùng slug là hỏng routing.
- `categories.key` UNIQUE — dùng trong URL danh mục.
- FK của `product_categories` đều `ON DELETE CASCADE`.
- `price >= 0`.
- `users.email` UNIQUE.

## Cố ý không làm

| Thứ | Lý do |
|---|---|
| Bảng `permissions` chi tiết | Một người dùng, cột `role` đủ |
| Bảng `regions` riêng | Một cột `text` đủ cho tới khi khu vực có thuộc tính riêng |
| Upload ảnh, bảng `media` | Ngoài phạm vi; ảnh nằm trong repo |
| `pages.ts` vào DB | Cấu trúc lồng nhau, gần như không đổi |
| Soft delete (`deleted_at`) | Chưa có nhu cầu khôi phục |
| Lịch sử phiên bản nội dung | Git đã là lịch sử cho dữ liệu seed |

## Câu chưa chốt

- Slug do admin nhập tay hay tự sinh từ tiêu đề? Ảnh hưởng validate ở form.
- Khi đổi slug của bài đã xuất bản, có cần giữ redirect từ slug cũ không? Nếu
  có thì cần thêm bảng ánh xạ.
- Phân trang blog hiện là giả: `BLOG_PAGE_COUNT` là 54 trong khi chỉ có 10 bài
  thật, và `getBlogPage()` lặp lại chúng để khớp số trang của site gốc (quyết
  định có chủ ý, đã được duyệt trước đó). Khi chuyển sang DB, hành vi này phải
  bỏ — số trang tính từ số bài thật. Cần xác nhận việc trang blog rút từ 54
  xuống còn vài trang là chấp nhận được.
