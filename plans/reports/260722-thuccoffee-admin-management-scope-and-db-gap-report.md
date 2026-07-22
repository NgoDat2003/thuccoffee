# THỨC Coffee Admin — Management Scope, CRUD Screens And Database Gap Report

**Ngày lập:** 2026-07-22  
**Trạng thái:** Research brief cho bước lập implementation plan  
**Đối tượng đọc:** Claude/Codex tạo plan, người duyệt phạm vi admin  
**Không phải:** implementation plan, schema migration hay cam kết clone toàn bộ admin gốc

## 1. Mục tiêu báo cáo

Báo cáo trả lời năm câu hỏi trước khi xây admin cho project clone:

1. Admin mới cần những màn hình nào?
2. Mỗi màn quản lý dữ liệu gì và cho phép CRUD đến đâu?
3. Kiến trúc 14 bảng hiện tại đã hỗ trợ được phần nào?
4. Backend, frontend, auth, media và quy trình vận hành còn thiếu gì?
5. Nên triển khai theo phase nào để có admin dùng được sớm mà không copy mù hệ thống cũ?

Admin thật của THỨC được dùng như **catalog nghiệp vụ tham khảo**. Kiến trúc mới phải ưu tiên:

1. Những gì public frontend hiện đang đọc và hiển thị.
2. Schema, API contract và module pattern hiện tại của project.
3. Nhu cầu vận hành content thực tế của clone.
4. Bằng chứng từ admin gốc.
5. Các tính năng legacy chưa có consumer hoặc chưa xác minh.

## 2. Kết luận điều hành

Kiến trúc hiện tại **đủ làm Content Admin MVP mà không cần thiết kế lại toàn bộ database**.
MVP hợp lý gồm:

1. Đăng nhập một tài khoản admin.
2. Admin shell và điều hướng.
3. Quản lý sản phẩm và gắn danh mục.
4. Quản lý bài viết.
5. Quản lý cửa hàng và gallery.
6. Quản lý banner.
7. Quản lý 11 site settings đang được public frontend sử dụng.

Các blocker thật sự không nằm ở số lượng bảng:

- Chưa có auth route, auth middleware, user bootstrap hoặc dependency hash/token.
- Chưa có API ghi; backend hiện chỉ có public GET.
- Public response không chứa đủ ID/trạng thái để dùng lại làm admin DTO.
- Chưa chốt source of truth cho ảnh; frontend còn resolve ảnh từ bundle local.
- Chưa có sanitize HTML ở write boundary cho blog/static content.
- Chưa chốt publish/unpublish, hard delete, slug change và concurrent update.
- `db:seed` hiện có hành vi ghi đè dữ liệu; không an toàn sau khi admin đi vào sử dụng.

Không nên đặt mục tiêu “admin parity” ngay từ đầu. Orders, customers, payments, localized
text, full RBAC, audit log, options/stickers và mọi singleton page chỉ nên được bật khi có
consumer hoặc yêu cầu vận hành rõ ràng.

## 3. Nguồn bằng chứng và giới hạn

### 3.1 Nguồn chính

- `plans/reports/260721-1011-thuccoffee-admin-db-gap-audit.md`: audit admin gốc, 20 route
  quản trị quan sát được, field/cardinality và các cảnh báo không copy generic legacy model.
- `server/src/db/schema.ts`: source of truth của 14 bảng hiện tại.
- `server/src/db/seed.ts`: hành vi bootstrap/upsert/delete-recreate hiện tại.
- `server/src/index.ts` và `server/src/modules/*`: route/API thực tế.
- `src/routes.tsx`, `src/services/*`, `src/lib/api/*`: cấu trúc FE, route và data layer hiện tại.
- `docs/backend-architecture.md`, `docs/database-design.md`: quyết định kiến trúc đã chốt.
- `plans/reports/260721-1639-fe-db-read-api-alignment-report.md`: ranh giới giữa current-schema
  completion và full legacy parity.

### 3.2 Bằng chứng từ admin gốc

Audit cũ quan sát 20 route gồm settings, static text, product/category/options/stickers,
blog, stores, gallery, ba nhóm banner, sáu singleton content, membership FAQ và orders.
Snapshot audit thấy 43 products, 267 blogs và 125 media records.

Thông tin trên chỉ chứng minh **admin gốc có nghiệp vụ đó**, không chứng minh clone mới cũng
cần toàn bộ. Đặc biệt:

- Không thấy màn quản lý user/role nên không được suy luận RBAC legacy.
- Order query trong khoảng audit trả 0 record; không chứng minh commerce đang hoạt động.
- SMTP, credential, session và customer data không được xuất hoặc sao chép.
- Legacy `ItemMaster` là model generic rộng; project mới không nên copy cấu trúc đó.

## 4. Kiến trúc hiện tại

### 4.1 Stack cần giữ

- Frontend: React 19, Vite, TypeScript, React Router config-based, TanStack Query.
- Backend: Express 5, module theo resource, Zod validation, `ApiResponse<T>`.
- Database: PostgreSQL 16, Drizzle schema tập trung tại `server/src/db/schema.ts`.
- Object storage: MinIO đã có bucket/seed, chưa là runtime image source của frontend.
- Public data: products, categories, blog, stores, banners, site settings đã đọc qua API.

Admin phải là một route tree mới `/admin/*`, dùng `AdminLayout` riêng. Không nhét admin
vào public `Layout` và không dùng `/account/login` demo hiện tại làm admin login nếu chưa
thay toàn bộ contract của trang đó.

### 4.2 API hiện tại

Backend mới có health và chín public read endpoint:

```text
GET /api/health
GET /api/categories
GET /api/banners
GET /api/site-settings
GET /api/stores
GET /api/stores/:slug
GET /api/blog
GET /api/blog/:slug
GET /api/products
GET /api/products/:slug
```

Chưa có `POST`, `PUT`, `PATCH`, `DELETE`, auth guard hoặc `/api/admin/*`.

### 4.3 Phân loại 14 bảng cho admin

| Bảng | Mức sẵn sàng | Kết luận |
|---|---|---|
| `categories` | Có điều kiện | Sửa label/thứ tự được; tạo/xóa key tùy ý sẽ lệch `category-paths.ts` |
| `products` | Gần sẵn sàng | Đủ content/publish/order; thiếu admin API và chiến lược media |
| `product_categories` | Sẵn sàng | Quản lý lồng trong form product, transaction cùng product |
| `product_options` | Có schema | FE chưa dùng; hoãn khỏi MVP |
| `product_option_links` | Có schema, 0 data | FE chưa dùng; hoãn khỏi MVP |
| `stickers` | Có schema, 0 data | FE chưa dùng; hoãn; cần validation khi bật |
| `product_stickers` | Có schema, 0 data | FE chưa dùng; hoãn khỏi MVP |
| `blog_posts` | Gần sẵn sàng | Cần CRUD, draft/publish và sanitize HTML |
| `stores` | Gần sẵn sàng | Cần CRUD, gallery transaction và cleanup |
| `banners` | Gần sẵn sàng | Một bảng đủ ba type; FE hiện không có right placement |
| `users` | Schema có, feature thiếu | Chưa seed/provision user, auth API, guard hay dependency auth |
| `site_settings` | Sẵn sàng có guard | Chỉ update allow-list, validation khác nhau theo key |
| `media_attachments` | Có điều kiện | Store gallery dùng được; polymorphic owner không có FK thật |
| `static_pages` | Chưa có consumer | Bảng có nhưng seed/API/admin đều chưa có; hoãn |

## 5. Nguyên tắc quyết định phạm vi

Mỗi capability từ admin gốc được gắn một nhãn:

- **KEEP:** mô hình hiện tại phù hợp, chỉ cần hoàn thiện CRUD.
- **ADAPT:** giữ nghiệp vụ nhưng triển khai theo kiến trúc hiện tại.
- **ADD:** thiếu capability thật sự để admin vận hành.
- **DEFER:** hợp lý trong tương lai nhưng chưa tạo giá trị cho FE hiện tại.
- **REJECT:** không phù hợp hoặc tạo nợ kỹ thuật nếu sao chép.

| Capability legacy | Quyết định | Lý do |
|---|---|---|
| Login/admin access | ADD | Có bảng user nhưng chưa có feature auth |
| Products/categories | KEEP + ADAPT | Schema quan hệ hiện tại đủ tốt; không copy ItemMaster |
| Options/stickers | DEFER | Có schema nhưng không có data/consumer FE |
| Blog | KEEP + ADAPT | Cần write workflow và sanitization |
| Stores/gallery | KEEP + ADAPT | Giữ media relation, không quay lại gallery array |
| Ba module banner riêng | ADAPT | Một bảng và một màn tabs theo type là đủ |
| Site settings/website text | ADAPT | Chỉ expose 11 public settings; không làm generic arbitrary key editor |
| Generic media manager | DEFER | Chưa chốt source of truth và frontend chưa đọc MinIO |
| Singleton pages/FAQ | DEFER | Consumer/API hiện chưa có |
| Localized static text | DEFER | Clone hiện chỉ dùng tiếng Việt, chưa có nhu cầu locale |
| Orders/customers/payment | REJECT khỏi current admin | Không có cart/checkout/order model thật |
| Copy generic legacy ItemMaster | REJECT | Khó validate, khó FK, khó bảo trì |

## 6. Sơ đồ điều hướng admin đề xuất

```text
/admin/login
/admin
├── Dashboard
├── Nội dung
│   ├── Sản phẩm
│   ├── Danh mục
│   ├── Bài viết
│   ├── Cửa hàng
│   └── Banner
├── Cài đặt website
└── Tài khoản                    [phase sau nếu có nhiều user]

Deferred
├── Media library/upload
├── Options
├── Stickers
├── Static pages/FAQ
├── Localized text
└── Orders
```

Dashboard không phải blocker. Nếu cần giảm scope, route `/admin` có thể redirect thẳng
vào `/admin/products`; chưa cần aggregate dashboard API.

## 7. Ma trận màn hình, CRUD, DB và API

| Màn hình | Route FE đề xuất | CRUD/Action chính | Bảng | Trạng thái |
|---|---|---|---|---|
| Admin login | `/admin/login` | Login, logout, restore session | `users` | ADD |
| Dashboard | `/admin` | Count, quick links, recent changes | nhiều bảng | DEFER được |
| Product list | `/admin/products` | Read/filter/sort/publish/unpublish/delete | `products`, links | MVP |
| Product create | `/admin/products/new` | Create + attach categories | products + M:N | MVP |
| Product edit | `/admin/products/:id` | Read/update + categories | products + M:N | MVP |
| Category list | `/admin/categories` | Read/update label/order | `categories` | MVP giới hạn |
| Blog list | `/admin/blog` | Read/search/page/publish/unpublish/delete | `blog_posts` | MVP |
| Blog create/edit | `/admin/blog/new`, `/:id` | Create/update/preview | `blog_posts` | MVP |
| Store list | `/admin/stores` | CRUD/publish/order | `stores` | MVP |
| Store edit/gallery | `/admin/stores/:id` | Update/reorder/add/remove existing assets | stores + media | MVP giới hạn |
| Banner list | `/admin/banners` | CRUD/filter type/activate/order | `banners` | MVP |
| Site settings | `/admin/settings` | Read/update fixed settings | `site_settings` | MVP |
| Users | `/admin/users` | CRUD/activate/role | `users` | DEFER |
| Media library | `/admin/media` | List/upload/delete/select | chưa đủ model | DEFER/separate phase |
| Options | `/admin/product-options` | CRUD | option tables | DEFER |
| Stickers | `/admin/stickers` | CRUD | sticker tables | DEFER |
| Static pages | `/admin/pages` | CRUD fixed page keys | `static_pages` | DEFER |

## 8. Chi tiết từng màn MVP

### 8.1 Admin login và session

**Mục tiêu:** chỉ người được cấp quyền mới gọi được `/api/admin/*` và vào route admin.

**UI:**

- Email.
- Mật khẩu.
- Submit với loading/error rõ ràng.
- Logout trong admin shell.
- Route guard kiểm tra session; unauthenticated chuyển về `/admin/login`.

**Backend cần thêm:**

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

**Khuyến nghị:** một admin đầu tiên, password hash bằng Argon2, auth token/session đặt trong
HttpOnly cookie, `Secure` ở production, `SameSite=Lax` khi cùng domain. Không lưu bearer
token trong `localStorage`. Nếu frontend/backend dev khác origin thì CORS phải dùng allow-list
và credentials; không dùng wildcard.

**Khoảng trống hiện tại:** `server/package.json` chưa có `argon2`, `jsonwebtoken` hoặc thư
viện session; schema `users` cũng chưa có user seed. Claude phải chọn một cơ chế và ghi rõ
threat model, expiry, cookie flags, CSRF boundary và bootstrap user.

**Provision admin:** dùng command/bootstrap riêng lấy email/password từ env hoặc interactive
input. Không hardcode credential và không đặt credential thật trong `db:seed`.

### 8.2 Admin shell

**Bố cục:** sidebar, top bar, tên user, logout, breadcrumb, content outlet, mobile drawer.

**Yêu cầu:**

- Route tree `/admin/*` là sibling của public route tree.
- Dùng `AdminLayout`; không render public header/footer.
- Có unauthorized, forbidden, loading và not-found state riêng.
- Reuse `QueryProvider`, API error normalization, Toast và Tailwind token hiện có.
- Admin service/hook tách khỏi public service khi response contract khác nhau.

Không có table/form/dialog component library trong dependency hiện tại. Plan phải chốt
tự xây component nhỏ bằng Tailwind hay thêm một UI/form dependency; không được giả định
shadcn, React Hook Form hoặc data grid đã tồn tại.

### 8.3 Product list

**Cột:** thumbnail, tên, slug, giá, giá ước tính, categories, trạng thái publish, thứ tự,
updated time, actions.

**Bộ lọc:** search theo name/slug, category, published/unpublished. Với 42 records có thể
page đơn giản, nhưng admin API vẫn nên định nghĩa limit/page ổn định thay vì trả public DTO.

**Actions:** xem public page, sửa, publish/unpublish, xóa vĩnh viễn nếu policy cho phép.

**Admin API đề xuất:**

```text
GET    /api/admin/products
GET    /api/admin/products/:id
POST   /api/admin/products
PUT    /api/admin/products/:id
PATCH  /api/admin/products/:id/publish
DELETE /api/admin/products/:id            [chỉ khi hard-delete được duyệt]
```

Admin response phải có `id`, `isPublished`, `sortOrder`, timestamps và category IDs; không
dùng nguyên public `Product` response vì public contract cố ý ẩn dữ liệu quản trị.

### 8.4 Product create/edit

**Field hiện có thể quản lý:**

- `name`, `slug`.
- `price`, `priceEstimated`.
- `thumb`, `image`.
- `description`.
- `isPublished`, `sortOrder`.
- `categoryIds[]` từ bảng categories.

**Validation/invariant:**

- Tên và slug không rỗng; slug unique.
- Giá là integer không âm hoặc null theo schema hiện tại.
- Khi `priceEstimated=false`, plan phải chốt có bắt buộc price hay không.
- Category ID phải tồn tại; không nhận category key lạ.
- Ảnh phải theo asset strategy được duyệt.
- Create/update product và replace category links phải chạy trong một transaction.
- Không loop query theo từng category hoặc product.

Options/stickers không đưa vào form MVP vì link tables hiện không có data và public FE không
render chúng. Chỉ thêm sau khi public Product contract và UI sản phẩm có consumer.

### 8.5 Category management

MVP chỉ cho:

- Xem `key`, `label`, `sortOrder`.
- Sửa `label`.
- Sắp xếp lại.

Không cho tạo/xóa/đổi `key` tùy ý vì public router còn phụ thuộc
`src/data/category-paths.ts`. Category mới vẫn có thể xuất hiện từ API nhưng route có thể
rơi về `/menu`, tạo trải nghiệm không nhất quán.

Nếu business yêu cầu full category CRUD, phase đó phải đồng thời chuyển category route
resolution sang dữ liệu DB/API và chốt redirect cho key cũ.

### 8.6 Blog list

**Cột:** cover, title, slug, published date, status, updated time, actions.

**Bộ lọc:** title/slug search, status, date range. 267 posts bắt buộc server pagination và
index-friendly sort; không tải toàn bộ chỉ để lọc client-side.

**Actions:** preview, edit, publish/unpublish, delete theo policy.

```text
GET    /api/admin/blog
GET    /api/admin/blog/:id
POST   /api/admin/blog
PUT    /api/admin/blog/:id
PATCH  /api/admin/blog/:id/publish
DELETE /api/admin/blog/:id                [optional]
```

### 8.7 Blog editor

**Field:** title, slug, cover, summary, content, publishedAt, isPublished.

`content` đang là HTML text. Admin editor phải có preview và backend phải sanitize theo
allow-list trước khi lưu hoặc publish. Không chỉ sanitize phía frontend. Plan phải xác định
tag/attribute/protocol được phép; loại bỏ script, event handler và URL nguy hiểm.

Không cho publish khi title, slug, cover, summary hoặc content bắt buộc đang rỗng. Draft có
thể nới validation hơn published record nếu plan định nghĩa draft workflow rõ ràng.

### 8.8 Store list và form

**List fields:** image, name, region, address, phone, hours, publish status, sort order.

**Form fields:** name, slug, address, phone, hours, image, region, isPublished, sortOrder.

```text
GET    /api/admin/stores
GET    /api/admin/stores/:id
POST   /api/admin/stores
PUT    /api/admin/stores/:id
PATCH  /api/admin/stores/:id/publish
DELETE /api/admin/stores/:id               [optional]
```

### 8.9 Store gallery

Gallery dùng `media_attachments` với `ownerType='store'`, `ownerId`, `role='gallery'` và
`sortOrder`. Không chuyển về `text[]`.

MVP có thể cho chọn asset đã tồn tại, remove attachment và drag/reorder. Backend phải:

- Verify store owner tồn tại.
- Không tin `ownerType/ownerId` do browser gửi tùy ý.
- Replace/reorder gallery trong transaction.
- Dùng deterministic order `sortOrder ASC, id ASC`.
- Cleanup attachments khi xóa store.
- Trả gallery rỗng là `[]`, không 500.

`media_attachments` là polymorphic relation không có FK parent thật; integrity phải được
enforce trong service cho đến khi có thiết kế media lớn hơn.

### 8.10 Banner management

Một màn `/admin/banners`, dùng tabs/filter theo `type`:

- `slider`.
- `promotion`.
- `right` chỉ bật khi public FE có placement tương ứng.

**Cột/form:** type, image, alt text, link URL, sort order, active state.

```text
GET    /api/admin/banners
GET    /api/admin/banners/:id
POST   /api/admin/banners
PUT    /api/admin/banners/:id
PATCH  /api/admin/banners/:id/active
DELETE /api/admin/banners/:id
```

Không tạo ba bảng hoặc ba backend module gần giống nhau chỉ để khớp menu legacy. Không cho
tạo `right` banner nếu public frontend chưa có vị trí render; nếu vẫn cho tạo phải hiển thị
cảnh báo “chưa có consumer”.

### 8.11 Site settings

Một màn settings chia section:

**Brand:** `site_title`, `brand_heading`, `tagline`, `logo_storage_key`.  
**Contact:** `hotline`, `contact_email`, `office_address`.  
**Social:** `facebook_url`, `instagram_url`, `youtube_url`.  
**Footer:** `footer_copyright`.

```text
GET /api/admin/site-settings
PUT /api/admin/site-settings
```

Backend chỉ query/update allow-list 11 keys. Không nhận arbitrary key-value payload. Validate
email, URL, hotline và storage key theo từng field; empty YouTube URL vẫn hợp lệ. Không đưa
SMTP password, DB credential, MinIO secret hoặc feature secret vào bảng/public response.

## 9. Media strategy bắt buộc chốt trước khi làm form ảnh

### 9.1 Hướng khuyến nghị cho MVP

Giữ behavior đang chạy:

- `products.thumb/image` là nguồn ảnh sản phẩm.
- `blog_posts.cover` là ảnh blog.
- `stores.image` là ảnh đại diện cửa hàng.
- `banners.image` là ảnh banner.
- `media_attachments` chỉ quản lý store gallery.
- Admin phase đầu chỉ chọn asset đã tồn tại trong bundle/repo.

Lý do: public FE đang resolve filename bằng `getImageUrl()` và `import.meta.glob`. Upload một
object mới lên MinIO không tự làm Vite bundle biết ảnh đó. Đây là asset picker giới hạn,
không phải media manager thật.

### 9.2 Nếu bắt buộc upload ảnh ngay

Phải tạo phase media riêng, tối thiểu gồm:

1. Chuyển public FE sang URL/object key MinIO hoặc media URL do API trả.
2. Chuẩn hóa basename hiện tại thành relative object key.
3. Chốt direct image columns hay media attachments là canonical.
4. Thêm upload API có auth, MIME/size/magic-byte validation.
5. Tạo unique object key an toàn, không nhận path tùy ý từ browser.
6. Xử lý delete, orphan object, object đang được tham chiếu và rollback DB/object storage.
7. Không cấp MinIO credential cho browser và không public quyền write bucket.

Không trộn media migration vào CRUD content MVP nếu chưa chấp nhận scope/risk trên.

## 10. Delete, publish, slug và concurrency

### 10.1 Delete policy

Schema content hiện có `isPublished` nhưng không có `deletedAt`. Khuyến nghị MVP:

- Editor chỉ publish/unpublish.
- Hard delete chỉ admin và phải confirm rõ.
- Nếu chưa cần xóa vĩnh viễn, bỏ `DELETE` khỏi MVP để tránh broken links.

Nếu business cần restore/audit, bổ sung soft delete và audit thành phase riêng; không giả lập
soft delete bằng cách dùng lẫn `isPublished` với “đã xóa”.

### 10.2 Slug change

Slug là public URL. Đổi slug hiện tại sẽ làm URL cũ 404 vì chưa có redirect table. Plan phải
chọn một trong hai:

1. MVP khóa slug sau create; hoặc
2. Cho đổi slug và thêm redirect mapping/301 behavior.

Không silently đổi slug theo title mỗi lần edit.

### 10.3 Concurrent update

Ít nhất gửi `updatedAt` từ form và update có điều kiện; nếu record đã đổi thì trả `409
CONFLICT` thay vì ghi đè âm thầm. Với một admin có thể defer, nhưng contract nên được Claude
đánh giá trước khi mở role editor.

## 11. Seed và lifecycle production

`server/src/db/seed.ts` hiện phù hợp bootstrap/dev nhưng không phù hợp “sync production” sau
khi admin sửa content:

- Categories, products, blog, stores, options và settings bị upsert/ghi đè.
- Product-category links bị xóa rồi tạo lại.
- Store gallery bị xóa rồi tạo lại.
- Toàn bộ banners bị xóa rồi seed lại.
- Admin user không được seed.

Trước go-live admin phải tách rõ:

1. Migration: chỉ thay schema.
2. Bootstrap seed: chỉ chạy một lần trên DB trống.
3. Demo/dev reset seed: được phép phá dữ liệu, không dùng production.
4. Admin provision: command riêng, không hardcode password.
5. Source import về sau: job có dry-run/conflict policy, không overwrite content admin mặc định.

Đây là acceptance criterion bắt buộc, không phải cleanup tùy chọn sau khi admin hoàn tất.

## 12. Admin API contract chung

- Mọi body/query/params validate bằng Zod trong module resource.
- Admin DTO tách public DTO; admin response có ID, state, order và timestamps.
- Response có body tiếp tục dùng `ApiResponse<T>`; delete thành công trả `204` không body.
- HTTP status đúng nghĩa: `400`, `401`, `403`, `404`, `409`, `422` nếu project chọn.
- List lớn có server pagination/filter/sort allow-list.
- Không gán lại `req.query` trong Express 5.
- Write route chạy sau auth guard; role policy chạy sau authentication.
- Transaction cho aggregate write: product + categories, store + gallery.
- Trả validation details theo field để admin form map lỗi.
- Log không chứa password, auth token, raw secret hoặc full HTML content.

## 13. Frontend data flow admin

Giữ pattern hiện tại:

```text
Admin Page/Form
  -> admin resource hook
  -> src/services/admin/*.service.ts
  -> src/lib/api client
  -> /api/admin/*
```

Sau mutation thành công phải invalidate đúng public và admin query keys liên quan. Ví dụ sửa
product phải invalidate admin product list/detail và public products list/detail. Không gọi
axios trực tiếp trong page component.

Frontend admin cần các primitive tối thiểu:

- Protected route/session provider hoặc query.
- Admin layout/sidebar/breadcrumb.
- Data table/list state.
- Form field/error components.
- Confirm dialog.
- Publish status badge/switch.
- Pagination/filter/search.
- Loading, empty, error và retry state.
- Unsaved changes guard cho editor dài.

## 14. Phạm vi deferred

### 14.1 Options và stickers

Chỉ bật khi public product type/UI dùng chúng. Khi bật cần:

- Option catalog CRUD.
- Product-option assignment, price amount, quantity, order.
- Sticker CRUD, unique/active/color validation.
- Product-sticker M:N assignment.
- Public API/FE rendering và test.

### 14.2 Static pages và FAQ

`static_pages` có schema nhưng 0 consumer API trong scope hiện tại. Membership/Careers và
các trang ít đổi vẫn là code/static data. Chỉ xây admin khi chấp nhận chuyển các page đó sang
DB và chọn content model: sanitized HTML document hay structured fields.

### 14.3 Users và RBAC

Một admin không cần màn users. Khi có editor thứ hai, mới bổ sung `isActive`, password reset,
admin/editor policy và có thể audit. Không tự thêm roles/permissions tables khi chỉ có hai
role cố định.

### 14.4 Orders

Không thuộc admin clone hiện tại. Chỉ mở lại khi có cart, checkout, order creation, customer
contract, status workflow và dữ liệu thật. Không tạo màn order chỉ để giống menu legacy.

## 15. Schema/API gap theo mức ưu tiên

### P0 — chặn admin MVP

- Auth mechanism và secure user bootstrap.
- Admin write modules/routes/schemas/services.
- Admin-specific list/detail contracts.
- HTML sanitizer policy.
- Media behavior giới hạn rõ ràng.
- Seed tách bootstrap/dev/production lifecycle.
- Delete/publish/slug policy.

### P1 — nên có trong MVP hoàn chỉnh

- `users.is_active` nếu có hơn một tài khoản.
- Optimistic concurrency bằng `updatedAt` hoặc version.
- Admin pagination/filter/search.
- Preview content và unsaved changes guard.
- Cache invalidation public/admin.

### P2 — chỉ thêm khi có yêu cầu

- Media assets/library/upload/transform.
- Slug redirects.
- Soft delete và audit logs.
- Full RBAC.
- Static pages/FAQ/localized texts.
- Options/stickers public behavior.
- Orders/customers/payment.

## 16. Lộ trình implementation khuyến nghị

### Phase 0 — Decision gate và baseline

- Chốt auth cookie/session contract.
- Chốt asset picker có sẵn hay upload thật.
- Chốt delete và slug policy.
- Chốt một admin hay admin/editor.
- Tách seed lifecycle trước khi data được admin chỉnh.
- Verify FE/BE lint/build và public read API baseline.

### Phase 1 — Auth foundation

- Auth dependencies/env validation.
- Admin bootstrap command.
- Login/logout/me.
- Auth middleware và role guard tối thiểu.
- Security tests: wrong password, expired session, unauthenticated/forbidden.

### Phase 2 — Admin shell

- `/admin/login`, route guard, `AdminLayout`.
- Navigation, session state, logout, error boundary.
- Shared table/form/dialog primitives.

### Phase 3 — Products và categories

- Chốt CRUD pattern trên product trước.
- Admin product list/detail/write API.
- Product-category transaction.
- Category label/order management giới hạn.
- Public/admin cache invalidation và smoke tests.

### Phase 4 — Blog

- Server pagination/search/status filter.
- Editor, preview, sanitization, publish workflow.
- Conflict/slug policy test.

### Phase 5 — Stores và gallery

- Store CRUD.
- Gallery attachment/reorder/cleanup transaction.
- Owner-integrity tests.

### Phase 6 — Banners và settings

- Banner tabs/type validation/active ordering.
- Allow-listed settings form và backend validation.
- Verify public shell reflects updates.

### Phase 7 — Media hoặc deferred capabilities

- Chỉ chạy nếu scope được duyệt riêng.
- Không gộp upload, RBAC, pages, options/stickers và orders thành một phase lớn.

## 17. Yêu cầu đối với implementation plan Claude tạo tiếp theo

Claude phải tạo plan theo vertical slice chạy được, không chỉ liệt kê component. Mỗi phase
phải ghi:

1. Exact files tạo/sửa.
2. Route và request/response schema cụ thể.
3. Service method, query shape và transaction boundary.
4. Auth/role requirement.
5. Validation và error semantics.
6. Query key/invalidation phía frontend.
7. Loading/error/empty/form feedback phía UI.
8. Unit/integration/smoke/runtime verification.
9. Rollback boundary.
10. Nội dung cố ý không làm trong phase.

Plan không được:

- Dùng public DTO cho admin CRUD mà thiếu ID/state.
- Xây CRUD trước auth.
- Cho category key tùy ý nhưng không sửa routing.
- Bật upload MinIO trong form mà public FE không render được object mới.
- Rerun seed production sau khi admin sửa dữ liệu.
- Bịa UI library, form library hoặc dependency auth đang tồn tại.
- Copy 20 legacy modules thành 20 bảng/module mới.
- Tuyên bố full admin parity khi chưa có orders/media/localized content/RBAC tương ứng.

## 18. Acceptance criteria cho toàn chương trình admin MVP

### Auth

- User chưa login không gọi được mọi `/api/admin/*`.
- Login sai không tiết lộ email có tồn tại hay không.
- Cookie/token có expiry, logout làm session không còn dùng được.
- Credential không nằm trong source, seed hoặc log.

### Products/categories

- Create/update product và category links atomic.
- Slug/price/category validation đúng.
- Publish/unpublish phản ánh lên public API sau cache invalidation.
- Category management không tạo route bị mồ côi.

### Blog

- 267 posts quản lý bằng server pagination.
- HTML nguy hiểm bị loại trước khi lưu/publish.
- Preview và public detail dùng content hợp lệ.
- Slug conflict trả `409`, không ghi đè record khác.

### Stores/gallery

- Gallery order deterministic.
- Attachment không thể gắn nhầm owner tùy ý.
- Xóa/reorder transaction không để orphan DB row.
- Store không có gallery trả `[]`.

### Banners/settings

- Inactive banner không xuất hiện ở public GET.
- Sort order ổn định theo type.
- Settings chỉ đọc/ghi đúng 11 allow-listed keys.
- Secret không thể được tạo/đọc qua settings API.

### Quality/operations

- FE lint/build pass.
- Backend lint/build pass.
- Focused API integration tests pass.
- Auth negative tests pass.
- Seed lifecycle được tách và documented.
- Không tự start/restart background service ngoài bước verify được cho phép.

## 19. Risk register

| Risk | Tác động | Giảm thiểu |
|---|---|---|
| Admin sửa xong bị seed ghi đè | Mất content production | Tách bootstrap/dev seed trước go-live |
| Upload MinIO nhưng FE dùng local glob | Ảnh mới không hiển thị | MVP asset picker hoặc phase media migration riêng |
| Dùng raw HTML không sanitize | Stored XSS public website | Sanitize server write boundary + tests |
| Đổi/xóa slug tùy ý | Broken public links/SEO | Khóa slug hoặc redirect mapping |
| Hard delete nhầm | Mất dữ liệu, orphan object | Unpublish mặc định, confirm/role/transaction |
| Category key mới không có route | Menu dẫn sai trang | Giới hạn CRUD hoặc DB-driven route mapping |
| Reuse public response cho admin | Thiếu ID/state, logic vòng vo | Admin-specific DTO |
| Polymorphic media không FK | Attachment mồ côi/gắn sai | Owner verification và cleanup trong service |
| Cookie/CORS sai | Login dev/production lỗi hoặc CSRF | Chốt same-origin, credentials và cookie policy ở Phase 0 |
| Làm full legacy parity sớm | Scope lớn, nhiều màn không có consumer | MVP theo vertical slice, deferred rõ ràng |

## 20. Các quyết định còn mở

Các câu hỏi này không ngăn việc Claude nghiên cứu, nhưng phải được chốt trước phase liên quan:

1. Admin MVP chỉ có một `admin`, hay có cả `editor` ngay từ đầu?
2. Phase đầu chỉ chọn ảnh có sẵn hay bắt buộc upload ảnh mới?
3. Xóa content là unpublish, hard delete, hay soft delete?
4. Có cho đổi slug sau khi publish không; nếu có thì redirect URL cũ thế nào?
5. Category admin chỉ sửa label/order hay được tạo key mới?
6. Blog HTML allow-list gồm tag/attribute nào?
7. Có cần dashboard thật hay `/admin` redirect vào products?
8. Membership/Careers có chuyển vào `static_pages` trong vòng admin này không?
9. Bao giờ options/stickers có consumer ở public product detail?
10. Có yêu cầu audit ai sửa gì và restore version trong MVP không?

## 21. Phán quyết cuối cùng

Admin gốc nên được dùng để **không bỏ sót nghiệp vụ**, không dùng làm blueprint database hay
danh sách bắt buộc phải copy. Với clone hiện tại, hướng đúng là Content Admin MVP trên 7 khu
vực: auth, products/categories, blog, stores/gallery, banners và site settings.

Schema 14 bảng không phải blocker chính. Phần cần thiết kế kỹ trước khi cook là auth contract,
admin DTO/write API, media boundary, sanitization, publish/delete/slug policy và seed lifecycle.
Nếu các quyết định này được chốt trong plan, phần còn lại có thể triển khai theo resource
module hiện tại mà không cần rewrite backend hoặc mở rộng thành full commerce CMS.
