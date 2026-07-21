# Thiết kế Database

Thiết kế cho Postgres, phục vụ backend và trang admin. Chưa triển khai — tài liệu
này để chốt trước khi viết migration.

Nguồn dữ liệu hiện tại: `src/data/*.ts` (42 sản phẩm, 10 bài viết, 7 cửa hàng,
10 danh mục).

## Phạm vi

Phạm vi này đối chiếu với menu admin thật của site gốc (Home, Thông tin website,
Website Text, Promotion/Right/Banner, Cửa Hàng, Hình ảnh, Danh mục, Menu,
Options, Sticker, Giới thiệu, Chương trình thành viên, FAQ, Tuyển dụng, Cookies,
Chuyện Của Thức, Đơn hàng) — không chỉ suy từ nội dung mặt trước.

**Đưa vào DB:** sản phẩm, danh mục, bài viết, cửa hàng, banner (nhiều loại),
tài khoản, cấu hình site, biến thể sản phẩm (options), sticker, và hai trang hay
đổi (tuyển dụng, chương trình thành viên).

**Giữ nguyên trong code:** phần còn lại của `src/data/pages.ts` (FAQ, chính sách
cookie, giới thiệu) và `src/data/category-paths.ts`. Ba trang này gần như không
đổi — đưa vào DB tốn công cho giá trị thấp. `category-paths.ts` là logic ánh xạ
URL, thuộc về code.

**Cố ý không làm — Đơn hàng.** Admin gốc có mục "Đơn hàng" nhưng bản clone không
có giỏ hàng hay thanh toán thật (xem `deviations-from-original.md`). Không thêm
`orders`, `order_items`, `customers`.

**Ảnh:** DB chỉ lưu **tên file**, ảnh vẫn nằm trong `src/assets/images/` và được
`src/lib/image-url.ts` phân giải. Không có upload trong phạm vi này — thêm ảnh
mới vẫn phải commit vào repo.

## Sơ đồ quan hệ

```
                    ┌── product_categories ──── categories
                    │
products ───────────┼── product_stickers ────── stickers
                    │
                    ├── product_option_links ── product_options
                    │
media_attachments ──┘ (owner_type = product | store | blog_post, polymorphic)

blog_posts   stores   banners   users   site_settings   static_pages
(gắn media qua owner_type; còn lại độc lập)
```

Quan hệ nhiều-nhiều:
- sản phẩm ↔ danh mục qua `product_categories` (tối đa 3 danh mục).
- sản phẩm ↔ sticker qua `product_stickers` (một sản phẩm nhiều nhãn).
- sản phẩm ↔ option qua `product_option_links`, có thuộc tính giá và số lượng.

`media_attachments` gắn với sản phẩm, cửa hàng, bài viết qua cặp
`owner_type/owner_id` — polymorphic, không có khoá ngoại cứng (xem mục bảng).

`site_settings`, `static_pages`, `banners`, `users` độc lập.

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

Sticker không phải cột ở đây. Audit admin thật cho thấy một sản phẩm mang được
nhiều sticker (10 sản phẩm có 2 nhãn), nên quan hệ là nhiều-nhiều qua bảng
`product_stickers`, không phải khoá ngoại đơn.

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
| region | text | Cho phép NULL — nhóm chi nhánh theo khu vực |
| is_published | boolean | Mặc định `true` |
| sort_order | integer | |
| created_at / updated_at | timestamptz | |

Gallery **không** còn là cột `text[]` ở đây. Audit admin thật cho thấy ảnh cửa
hàng có thứ tự, link và vai trò riêng, nên chúng nằm trong `media_attachments`
với `owner_type='store'`. Thiết kế cũ dùng `text[]` sẽ mất các thuộc tính đó.

Thêm chi nhánh mới chỉ là thêm một dòng — không cần đổi schema. Cột `region` để
nhóm theo khu vực khi cần; chỉ tách bảng `regions` nếu khu vực có thuộc tính
riêng.

### banners

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| type | text | `promotion` \| `right` \| `slider` — admin gốc tách ba mục |
| image | text | Tên file |
| alt_text | text | Mô tả cho screen reader |
| link_url | text | Cho phép NULL |
| sort_order | integer | |
| is_active | boolean | Mặc định `true` |
| created_at / updated_at | timestamptz | |

Bảng mới. Banner hiện hardcode trong `src/components/home/BannerSlider.tsx` và
`PromoBanner.tsx`, nên đổi banner phải sửa code rồi deploy lại. Bảng này cho
phép bật/tắt, đổi thứ tự, đổi link qua admin — riêng ảnh mới vẫn cần commit.

Cột `type` phản ánh ba mục riêng trong admin gốc: Promotion Banner (dải khuyến
mãi), Right Banner (banner cột phải), và Banner (slider trang chủ). Một bảng với
cột phân loại thay vì ba bảng gần giống hệt nhau.

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

### site_settings

Cấu hình toàn site dạng key-value: hotline, email, giờ mở cửa, link mạng xã hội,
text footer/header. Tương ứng hai mục admin "Thông tin website" và "Website Text".

| Cột | Kiểu | Ghi chú |
|---|---|---|
| key | text | PK — ví dụ `hotline`, `facebook_url`, `footer_copyright` |
| value | text | Giá trị, cho phép rỗng |
| updated_at | timestamptz | |

Key-value thay vì mỗi cấu hình một cột, vì danh sách cấu hình sẽ thay đổi và
không đáng migrate schema mỗi lần thêm một trường.

### product_options và product_option_links

Biến thể sản phẩm — tương ứng mục admin "Options". Audit admin thật cho thấy đây
là **catalog dùng chung**: có 6 option (`Lạnh`, `Nóng`, `Size nhỏ`, `Size vừa`,
`1 Egg`, `2 Eggs`), và mỗi sản phẩm *liên kết* tới các option đó kèm thuộc tính
riêng (giá cộng thêm, số lượng). Không phải mỗi sản phẩm sở hữu option riêng.

`product_options` — catalog, một dòng mỗi option:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| name | text | Ví dụ `Size vừa` |
| sort_order | integer | |

`product_option_links` — nối sản phẩm với option, mang thuộc tính:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| product_id | integer | FK → products, ON DELETE CASCADE |
| option_id | integer | FK → product_options, ON DELETE RESTRICT |
| price_amount | integer | Giá cộng thêm, VNĐ; mặc định `0` |
| quantity | integer | Mặc định `1` |
| sort_order | integer | |

PK gộp `(product_id, option_id)`. `RESTRICT` phía option để không xoá nhầm option
đang được sản phẩm dùng. Bản clone chưa có giỏ hàng thật nên bảng link để trống
lúc seed; catalog có thể seed 6 option gốc.

### stickers và product_stickers

Nhãn dán sản phẩm — tương ứng mục admin "Sticker" (MỚI, HOT, BÁN CHẠY).

`stickers`:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| label | text | Chữ trên nhãn |
| color | text | Mã màu nền, ví dụ `#e11d48` |
| created_at / updated_at | timestamptz | |

`product_stickers` — nhiều-nhiều:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| product_id | integer | FK → products, ON DELETE CASCADE |
| sticker_id | integer | FK → stickers, ON DELETE CASCADE |
| sort_order | integer | |

PK gộp `(product_id, sticker_id)`. Là nhiều-nhiều vì audit cho thấy một sản phẩm
mang được nhiều nhãn — 10 sản phẩm có 2 sticker, 15 có 1.

### media_attachments

Ảnh gắn với nhiều loại nội dung: gallery cửa hàng, ảnh blog, ảnh sản phẩm. Audit
admin thật cho thấy mỗi ảnh có thứ tự, link, và vai trò — không chỉ là tên file,
nên `text[]` làm mất thông tin.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| owner_type | text | `store` \| `blog_post` \| `product` |
| owner_id | integer | ID bản ghi thuộc `owner_type` |
| storage_key | text | Tên file (giai đoạn này) hoặc object key (khi chuyển MinIO) |
| role | text | `gallery` \| `cover` \| `detail`; cho phép NULL |
| link_url | text | Cho phép NULL — ảnh có thể trỏ tới URL |
| sort_order | integer | Thứ tự hiển thị |
| created_at / updated_at | timestamptz | |

**Đánh đổi cần biết:** `owner_type/owner_id` là quan hệ polymorphic — Postgres
**không** ép được khoá ngoại kiểu này. Ràng buộc toàn vẹn (ảnh trỏ tới bản ghi
tồn tại) phải xử lý ở tầng service, không phải ở database. Chấp nhận vì nó gộp ba
loại ảnh vào một bảng thay vì ba bảng gần giống hệt nhau; nếu sau này cần FK
nghiêm ngặt thì tách bảng theo từng loại.

`storage_key` là chìa khoá để tương thích hai giai đoạn:

| Giai đoạn | `storage_key` chứa | Frontend phân giải |
|---|---|---|
| Hiện tại | tên file (`americano.jpg`) | qua `getImageUrl()`, ảnh trong repo |
| Sau (MinIO) | object key trong bucket | presigned URL từ MinIO |

Cùng schema, chỉ đổi cách phân giải khi làm upload — không migrate cột. MinIO là
mã nguồn mở, tự host qua container (như Postgres), không tốn phí; đây là cách dự
án QA/QC lưu ảnh.

Cột `stores.gallery text[]` bị bỏ, thay bằng các dòng `media_attachments` có
`owner_type='store'`.

### static_pages

Chỉ cho trang hay đổi: Tuyển dụng và Chương trình thành viên. FAQ, chính sách
cookie, giới thiệu vẫn ở `src/data/pages.ts`.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | serial | PK |
| key | text | UNIQUE — `tuyen-dung`, `chuong-trinh-thanh-vien` |
| title | text | |
| content | text | Markdown hoặc HTML |
| updated_at | timestamptz | |

Chỉ hai trang này vào DB vì nội dung của chúng thay đổi thường xuyên (tin tuyển
dụng mới, bậc thành viên điều chỉnh). Các trang còn lại gần như tĩnh nên giữ
trong code rẻ hơn.

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

Audit admin thật gợi ý "admin parity" khoảng 20 bảng. Phần lớn nằm ngoài mục
tiêu của dự án này (clone + admin sửa nội dung), nên cố ý bỏ:

| Thứ | Lý do |
|---|---|
| `orders`, `order_items`, `customers` | Admin gốc có "Đơn hàng" nhưng clone không bán hàng; query 2020→nay trả 0 đơn |
| Upload ảnh thật (MinIO/S3) | Giai đoạn sau. Giờ ảnh trong repo, `storage_key` đã thiết kế sẵn để chuyển MinIO không phải migrate |
| `localized_texts` (18 namespace) | Chỉ `vi-VN`, không đa ngôn ngữ; text hiện ở `pages.ts` và component |
| `audit_logs`, `created_by`/`updated_by` mọi bảng | Một người dùng, chưa cần truy vết ai sửa gì |
| Soft delete (`deleted_at`) mọi bảng | Chưa có nhu cầu khôi phục |
| `tags`, `product_tags`, `blog_tags` | Chưa có nhu cầu lọc theo tag |
| 6 singleton page + `faqs` vào DB | Chỉ 2 trang hay đổi vào DB; còn lại giữ `pages.ts` |
| `roles`, `permissions`, `user_roles` (RBAC) | Một tài khoản, cột `role` đủ |
| Bảng `regions` riêng | Một cột `text` đủ cho tới khi khu vực có thuộc tính riêng |
| Category `parent_id` phân cấp | Danh mục phẳng đủ dùng; admin thật có phân cấp nhưng clone chưa cần |

Nếu sau này cần bất kỳ mục nào, thêm được vì schema hiện tại không cản — đây là
quyết định phạm vi, không phải giới hạn kỹ thuật.

## Quy tắc sinh slug

Slug tự sinh từ tiêu đề khi tạo bản ghi mới, admin sửa lại được nếu muốn.

Các bước chuẩn hóa:

1. Bỏ dấu tiếng Việt. Xử lý `Đ`/`đ` thành `d` **trước** khi chạy
   `normalize('NFD')` — `Đ` là chữ cái riêng, không phải `D` mang dấu, nên bước
   khử dấu Unicode thông thường sẽ bỏ sót nó.
2. Chuyển thường, thay khoảng trắng và ký tự không phải chữ/số bằng `-`.
3. Gộp nhiều `-` liên tiếp, cắt `-` ở đầu và cuối.

Ví dụ: `THỨC COFFEE — 40D Lý Tự Trọng!` → `thuc-coffee-40d-ly-tu-trong`

**Chống trùng phải làm ở backend**, không phải ở form. Nếu slug đã tồn tại thì
thêm hậu tố tăng dần (`ca-phe-sua-2`). Sinh slug ở frontend rồi gửi lên không
đủ — hai người tạo cùng lúc vẫn có thể trùng, nên bước kiểm tra cuối cùng phải
nằm cạnh ràng buộc UNIQUE của database.

**Sửa tiêu đề không tự đổi slug** của bản ghi đã xuất bản. Đổi slug là làm chết
mọi link đã chia sẻ. Chỉ đổi khi admin chủ động yêu cầu.

Slug trong dữ liệu hiện tại có hậu tố lấy từ site gốc (`-s153t2`, `-s92t2`).
Bước seed giữ nguyên chúng để không phá link đang chạy; chỉ bản ghi tạo mới mới
dùng slug tự sinh.

## Câu chưa chốt

- Khi admin chủ động đổi slug của bài đã xuất bản, có cần giữ redirect từ slug
  cũ không? Nếu có thì cần thêm bảng ánh xạ slug cũ → bản ghi.
- Phân trang blog hiện là giả: `BLOG_PAGE_COUNT` là 54 trong khi chỉ có 10 bài
  thật, và `getBlogPage()` lặp lại chúng để khớp số trang của site gốc (quyết
  định có chủ ý, đã được duyệt trước đó). Khi chuyển sang DB, hành vi này phải
  bỏ — số trang tính từ số bài thật. Cần xác nhận việc trang blog rút từ 54
  xuống còn vài trang là chấp nhận được.
