---
type: architecture-decision-input
date: 2026-07-21
status: complete
scope: frontend-static-to-existing-database-read-api-alignment
target_plan: remaining-public-read-api-and-seed-alignment
related_plan: plans/260721-1448-backend-read-api/plan.md
supersedes_for_this_scope: plans/reports/260721-1011-thuccoffee-admin-db-gap-audit.md
---

# Báo cáo đối chiếu FE tĩnh, Database hiện tại và Public Read API còn thiếu

## 1. Mục đích

Báo cáo này là đầu vào để Claude tạo implementation plan tiếp theo. Mục tiêu duy
nhất: xác định public read API nào còn thiếu dựa trên ba nguồn đã kiểm tra:

1. Nội dung FE hiện đang đọc tĩnh từ `src/data/*.ts` hoặc hardcode trong component.
2. Schema PostgreSQL 14 bảng đang tồn tại trong `server/src/db/schema.ts`.
3. Dữ liệu thật đang nằm trong volume `thuccoffee_postgres-data` ngày 2026-07-21.

Nguyên tắc bắt buộc:

```text
FE static field -> bảng DB đã tồn tại -> seed/data đã xác minh -> API response
```

Không tạo API chỉ vì FE có một khối giao diện. Không thêm bảng để đạt full admin
parity trong plan này. Bảng hiện có nhưng chưa có dữ liệu phải được seed trước
hoặc cùng phase với API tương ứng.

## 2. Kết luận điều hành

Tám public content API hiện tại đã bao phủ categories, products, blog, stores và
banners. Phần còn lại hợp lý nhất:

1. Mở rộng `GET /api/stores/:slug` để trả ordered gallery từ
   `media_attachments`.
2. Seed ba banner FE đang hardcode; giữ nguyên `GET /api/banners`.
3. Seed public website settings rồi thêm `GET /api/site-settings`.
4. Seed đúng hai static page đã có chủ đích trong schema rồi thêm
   `GET /api/pages/:key`.
5. Giữ About, Contact, Delivery, Cookie Policy, homepage gallery, navigation,
   login/search/newsletter/cart/order ở static/UI-only scope.

Sau thay đổi, tổng public content API là 10: tám endpoint hiện có cộng hai endpoint
mới. Store gallery là thay đổi contract, không phải endpoint thứ 11.

Không đổi schema và không thêm bảng trong scope được khuyến nghị.

## 3. Nguồn bằng chứng

### 3.1 Code và tài liệu

- `src/routes.tsx`
- `src/data/index.ts`
- `src/data/types.ts`
- `src/data/pages.ts`
- `src/data/categories.ts`
- `src/data/products.ts`
- `src/data/blog.ts`
- `src/data/blog-content.ts`
- `src/data/stores.ts`
- `src/components/layout/*`
- `src/components/home/*`
- `src/pages/*`
- `server/src/db/schema.ts`
- `server/src/db/seed.ts`
- `server/src/modules/*`
- `docs/database-design.md`
- `docs/backend-architecture.md`
- `docs/deviations-from-original.md`

### 3.2 Truy vấn DB live

Postgres được bật tạm thời chỉ để chạy `SELECT`, sau đó đã stop. Không insert,
update, delete hoặc migration.

Đã kiểm tra:

- 14 bảng trong schema `public`.
- Row count từng bảng.
- Product completeness.
- Blog content completeness và date range.
- Media cardinality theo owner/role.
- Gallery count và thứ tự của từng store.
- Product-category cardinality.
- Product option catalog.

Volume dữ liệu vẫn là `thuccoffee_postgres-data`.

## 4. Snapshot Database đã xác minh

| Table | Rows | Trạng thái dữ liệu |
|---|---:|---|
| `banners` | 0 | Có schema/API, chưa seed |
| `blog_posts` | 267 | Đầy đủ listing và detail content |
| `categories` | 10 | Đầy đủ cho FE hiện tại |
| `media_attachments` | 35 | Chỉ store gallery, 7 owner |
| `product_categories` | 77 | Đầy đủ M:N cho 42 products |
| `product_option_links` | 0 | FE không dùng |
| `product_options` | 6 | Catalog có data, chưa có product link |
| `product_stickers` | 0 | FE không dùng |
| `products` | 42 | Đầy đủ cho FE hiện tại |
| `site_settings` | 0 | Có schema, chưa seed/API |
| `static_pages` | 0 | Có schema, chưa seed/API |
| `stickers` | 0 | FE không dùng |
| `stores` | 7 | Đầy đủ core fields |
| `users` | 0 | Auth chưa thuộc scope |

### 4.1 Product

- 42/42 published.
- 0 null price.
- 5 null description.
- 10 `price_estimated=true`.
- Documentation cũ có nơi ghi 11 estimated prices; DB live và source hiện tại là
  bằng chứng cần dùng cho plan. Cập nhật tài liệu về 10, không sửa dữ liệu để chạy
  theo số cũ.

### 4.2 Blog

- 267/267 published.
- 267/267 có `content` khác null/rỗng.
- Ngày cũ nhất: `2018-05-27`.
- Ngày mới nhất: `2026-06-06`.
- Public list API đã phân trang DB thật với page size 5.

### 4.3 Store media

- 35 rows, tất cả `owner_type='store'`, `role='gallery'`.
- 7/7 store có đúng 5 gallery images.
- Mỗi store có `sort_order` liên tục từ 0 đến 4.
- `storage_key` hiện là filename/basename, phù hợp với local `getImageUrl()` ở
  phase FE hiện tại.

### 4.4 Product options

Catalog có sáu rows:

1. Lạnh
2. Nóng
3. Size nhỏ
4. Size vừa
5. 1 Egg
6. 2 Eggs

`product_option_links` có 0 rows và FE `Product` type không có options. Không thêm
public options API trong plan này.

## 5. Đối chiếu FE static -> DB -> API

| FE area | Nguồn FE hiện tại | DB table/data | API hiện tại | Quyết định |
|---|---|---|---|---|
| Categories/menu | `categories.ts`, `category-paths.ts` | `categories`: 10 | `GET /api/categories` | API đủ; route mapping vẫn là code |
| Product list/filter | `products.ts` | `products`: 42, links: 77 | `GET /api/products?category=` | API đủ |
| Product detail | `products.ts` | `products`: 42 | `GET /api/products/:slug` | API đủ |
| Featured products | Category `yeu-thich-nhat` | 19 linked products | Existing product filter | Không thêm featured API |
| Blog list | `blog.ts` | `blog_posts`: 267 | `GET /api/blog?page=` | API đủ |
| Blog detail | `blog-content.ts` | 267 full contents | `GET /api/blog/:slug` | API đủ |
| Store list | `stores.ts` | `stores`: 7 | `GET /api/stores` | API đủ |
| Store detail | `stores.ts`, `gallery[]` | `stores`: 7, media: 35 | `GET /api/stores/:slug` | Thiếu gallery trong response |
| Hero/promo banners | Component hardcode | `banners`: 0 | `GET /api/banners` | Seed data; không thêm route |
| Header/footer/contact shell | Component/pages hardcode | `site_settings`: 0 | Chưa có | Seed rồi thêm read API |
| Membership content | `pages.ts` | `static_pages`: 0 | Chưa có | Seed rồi thêm page API |
| Careers content | `pages.ts` | `static_pages`: 0 | Chưa có | Seed rồi thêm page API |
| About | `pages.ts` | Không có row/table-specific design | Chưa có | Giữ static |
| Contact page/form | `pages.ts`, local demo form | Không có messages table | Chưa có | Giữ static/UI-only |
| Delivery | `pages.ts`, external links | Không có order model | Chưa có | Giữ static |
| Cookie policy | `pages.ts`, consent in localStorage | Không có persistence | Chưa có | Giữ static |
| Homepage gallery | 8 component-hardcoded images | Không có homepage gallery owner/data | Chưa có | Giữ static |
| Search/newsletter/login | UI shell | Không có matching data/workflow | Chưa có | Không làm API |

## 6. Quyết định kiến trúc

### 6.1 Chọn resource APIs, không chọn aggregate bootstrap API

Khuyến nghị:

```text
GET /api/site-settings
GET /api/pages/:key
```

Không tạo `/api/site-bootstrap` gom settings, banners, pages và navigation. Resource
API khớp module pattern hiện tại, cache/invalidate độc lập và tái sử dụng được cho
admin sau này.

### 6.2 Không thêm generic media API

Store gallery thuộc store detail. Query `media_attachments` trong store service,
không tạo:

```text
GET /api/stores/:slug/media
GET /api/media?owner=...
```

Generic media API làm lộ polymorphic persistence và buộc FE ghép hai request trong
khi chỉ có 35 rows.

### 6.3 Chưa chuyển FE sang MinIO URL

Trong plan này API tiếp tục trả filename/storage key. FE hiện giải ảnh qua
`getImageUrl()` từ local bundle. MinIO canonical URL là một phase media riêng.

Không sửa `storage_key` thành URL tuyệt đối và không thêm MinIO dependency vào
public read service của phase này.

### 6.4 `static_pages.content` giữ HTML text

Schema hiện tại định nghĩa `content text` và documentation mô tả Markdown hoặc
HTML. Plan dùng sanitized HTML, không đổi sang JSONB và không thêm tables cho FAQ,
jobs hoặc page blocks.

Trade-off được chấp nhận: admin tương lai sửa một rich-content document thay vì
form structured theo từng tier/job. Full admin parity là scope khác.

## 7. Seed specification

Seed phải idempotent: rerun không tạo duplicate, dùng stable key/type + deterministic
sort order và `onConflictDoUpdate` khi có unique target phù hợp.

### 7.1 Banners

Seed đúng nội dung FE hiện sử dụng:

| type | image | alt_text | link_url | sort_order |
|---|---|---|---|---:|
| `slider` | `3eb3f0f8_cover-2-.jpg` | `Thức Coffee` | null | 0 |
| `slider` | `446135be_cover-fb.jpg` | `Thức Coffee` | null | 1 |
| `promotion` | `2e94f8cc_cover-fb.jpg` | `Ưu đãi khi đến với Thức` | `/chuong-trinh-thanh-vien` | 0 |

Không seed `right`: FE hiện không có right-banner placement. Năm right banners từ
production admin audit không được kéo vào plan FE-current-scope này.

Lưu ý schema `banners` chưa có natural unique key ngoài `id`. Claude plan phải
chọn một trong hai cách an toàn:

1. Thêm unique business key là schema change nhỏ; hoặc
2. Trong seed transaction, delete/recreate đúng seed-owned banner set theo type và
   known filenames.

Không dùng `onConflictDoUpdate` giả khi không có unique target.

### 7.2 Site settings

Seed allow-list public keys:

| key | value nguồn hiện tại |
|---|---|
| `site_title` | `Thức Coffee` |
| `brand_heading` | `THỨC COFFEE - OPEN 24/7` |
| `tagline` | `Nơi ngắm nhìn Sài Gòn chuyển mình trọn vẹn 24h.` |
| `logo_storage_key` | `151b6674_circlelogo-white-blue-jul2023.png` |
| `hotline` | `1800 6230` |
| `contact_email` | `info.thuccoffee247@gmail.com` |
| `office_address` | `40D Lý Tự Trọng, P.Sài Gòn, TP.HCM` |
| `facebook_url` | `https://www.facebook.com/ThucCoffee247` |
| `instagram_url` | `https://www.instagram.com/thuccoffee24h/` |
| `youtube_url` | empty string until valid URL is known |
| `footer_copyright` | `© 2018. All Right Reserved. Thức Coffee` |

Không seed SMTP, database credential, MinIO secret, admin credential hoặc internal
feature flags vào public settings.

Membership copy có `info@thuccoffee.com.vn`; đây là nội dung lịch sử bên trong page,
không phải canonical global email. Public shell dùng `info.thuccoffee247@gmail.com`
theo Contact và Mobile Drawer hiện tại.

### 7.3 Static pages

Chỉ seed hai keys đã được quyết định trong `docs/database-design.md`:

| key | title | source |
|---|---|---|
| `chuong-trinh-thanh-vien` | `Chính sách thành viên` | `pages.membership`, tiers, membership FAQ, support |
| `tuyen-dung` | `Tuyển dụng` | `pages.careers`, `pages.jobs` |

`content` là deterministic sanitized HTML được tạo từ source tĩnh hiện tại. Không
đưa About, Delivery, Contact hoặc Cookie Policy vào `static_pages` trong plan này.

Membership source hiện có sáu FAQ entries, trong khi production admin audit thấy
bảy. Plan dùng FE source hiện tại để giữ clone parity; câu FAQ thứ bảy chỉ được thêm
khi có source content đã xác minh và scope thay đổi.

## 8. API contracts

Tất cả response tiếp tục dùng `ApiResponse<T>` và HTTP status semantics hiện tại.

### 8.1 Store detail extension

```ts
type StoreDetail = {
  name: string;
  slug: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  gallery: string[];
};
```

Rules:

- Chỉ published store.
- Gallery chỉ `owner_type='store'`, matching owner ID, `role='gallery'`.
- Order `sort_order ASC`, sau đó `id ASC` để deterministic.
- Store có zero attachments trả `gallery: []`, không 500.
- Detail slug không tồn tại giữ `404 NOT_FOUND`.
- List store không cần gallery để tránh payload lặp.

### 8.2 Site settings

```text
GET /api/site-settings
```

```ts
type PublicSiteSettings = {
  siteTitle: string;
  brandHeading: string;
  tagline: string;
  logoStorageKey: string;
  hotline: string;
  contactEmail: string;
  officeAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  footerCopyright: string;
};
```

Rules:

- Service query đúng allow-list keys, không `SELECT *` rồi trả toàn bộ.
- Map key-value rows thành typed object camelCase.
- Missing required key là configuration error; plan phải chọn fail-fast lúc startup
  hoặc trả explicit internal error. Khuyến nghị seed + schema parse ở request và
  trả `500 INTERNAL_ERROR`, không silently fabricate content.
- Empty `youtube_url` là hợp lệ; FE phải hide link thay vì render `href='#'`.

### 8.3 Static page detail

```text
GET /api/pages/:key
```

Allowed keys:

```text
chuong-trinh-thanh-vien
tuyen-dung
```

```ts
type PublicStaticPage = {
  key: 'chuong-trinh-thanh-vien' | 'tuyen-dung';
  title: string;
  content: string;
  updatedAt: string;
};
```

Rules:

- Param schema allow-list hai key, không nhận arbitrary string.
- Existing allowed key trả `200`.
- Allowed key chưa có row trả `404 NOT_FOUND`.
- Unknown key trả `400 BAD_REQUEST` nếu validation enum chặn; plan phải giữ cách này
  nhất quán trong schema và smoke test.
- `updatedAt` là ISO datetime.
- Content được sanitize trước khi seed/write; public GET không tự sanitize lại mỗi
  request.

## 9. Không triển khai trong plan này

- Schema mới hoặc bảng mới.
- Admin CRUD.
- Admin authentication/session/JWT.
- Public/member authentication.
- Cart, checkout, payments, orders, customers.
- Contact submission persistence.
- Newsletter subscription persistence.
- Search endpoint.
- Homepage gallery API.
- Generic media API.
- Product options/stickers public API.
- Product thứ 43 từ production admin.
- FAQ thứ bảy từ production admin.
- Five right banners từ production admin.
- Full localization/static-text system.
- MinIO URL migration hoặc runtime upload.
- About/Delivery/Contact/Cookie API.

## 10. Existing code touchpoints cho Claude plan

### Backend

- `server/src/index.ts`: mount hai modules mới.
- `server/src/db/seed.ts`: seed banners/settings/pages; giữ idempotency.
- `server/src/db/schema.ts`: read-only baseline; không đổi trừ khi plan chứng minh
  cần unique banner seed key.
- `server/src/modules/stores/stores.schemas.ts`: detail schema có gallery.
- `server/src/modules/stores/stores.service.ts`: join/query media only for detail.
- `server/src/modules/stores/stores.routes.ts`: response detail unchanged envelope.
- `server/src/modules/banners/*`: endpoint đã có, chỉ verify seed/type filtering.
- New `server/src/modules/site-settings/` with schemas/service/routes.
- New `server/src/modules/pages/` with schemas/service/routes.
- `server/scripts/smoke-api.ts`: add new endpoint and gallery assertions.
- `docs/backend-architecture.md`: update endpoint list and data state.
- `docs/database-design.md`: correct snapshot counts/seed state only; do not reopen
  full parity schema in this plan.

### Frontend future integration touchpoints

Không nhất thiết sửa FE trong backend plan, nhưng Claude phải ghi dependency cho
phase kế tiếp:

- `src/data/index.ts` hiện export raw arrays và sync helpers.
- `src/components/home/BlogCarousel.tsx` đọc `blogPosts` trực tiếp.
- `src/components/home/StoreLocator.tsx` đọc `stores` trực tiếp.
- `src/pages/BlogDetailPage.tsx` đọc `blogPosts` trực tiếp.
- `src/pages/StoreDetailPage.tsx` đọc `stores` cho selector.
- Category components và `DesktopNav` đọc `categories` trực tiếp.
- `BlogPagination` dùng `BLOG_PAGE_COUNT=54` hardcode.
- Header/Footer/MobileDrawer dùng hardcoded website settings.
- BannerSlider/PromoBanner dùng hardcoded images.
- Membership/Careers đọc `pages` sync.

Vì vậy câu cũ “chỉ đổi ruột `src/data/index.ts`, pages không sửa” không hoàn toàn
đúng. FE async migration cần query/cache/loading/error handling và sửa raw-array
consumers; không được giấu việc này trong backend-only phase.

## 11. Recommended implementation order cho plan generator

Claude nên tạo plan theo thứ tự dễ kiểm chứng:

1. Baseline validation: build/lint/smoke hiện tại, confirm dirty worktree ownership.
2. Seed extension: banners, site settings, two static pages.
3. Store detail gallery contract and query.
4. Site-settings module.
5. Pages module.
6. Smoke and focused integration tests.
7. Documentation/count correction.
8. Optional separate phase: FE consumes APIs; không trộn nếu plan được yêu cầu
   backend-only.

Mỗi phase phải ghi exact files, response schema, SQL/query shape, failure semantics,
verification command và rollback boundary.

## 12. Acceptance criteria

### Data

- Existing counts preserved: 10 categories, 42 products, 77 category links,
  267 blogs, 7 stores, 35 store media, 6 options.
- `banners` có đúng three seed-owned rows: two slider, one promotion.
- `site_settings` có đúng public seed keys đã định nghĩa; rerun không duplicate.
- `static_pages` có đúng two rows; rerun không duplicate.
- Không seed users, stickers, product links hoặc order data.

### API

- Existing eight content endpoints vẫn pass.
- `GET /api/stores/:slug` trả đúng five ordered gallery entries cho mọi seeded store.
- `GET /api/stores` không bị phình payload bởi gallery.
- `GET /api/site-settings` chỉ trả allow-listed public fields.
- `GET /api/pages/chuong-trinh-thanh-vien` trả full non-empty HTML.
- `GET /api/pages/tuyen-dung` trả full non-empty HTML.
- Page key invalid/missing có status và error envelope đúng contract.
- Không N+1 trên list endpoints.

### Quality

- Backend lint pass.
- Backend build pass.
- Seed rerun pass hai lần liên tiếp.
- Smoke API pass dynamic slugs, không hardcode store/blog/product slug trong test.
- `git diff --check` pass.
- Không tự start service hoặc set restart policy.

## 13. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Seed banner không có unique business key | Rerun duplicate rows | Add stable key or deterministic delete/recreate seed-owned rows |
| HTML page làm giảm structured component control | Membership/careers khó edit theo field | Chấp nhận trong current scope; structured CMS là future plan |
| Raw HTML unsafe | Stored XSS khi admin CRUD xuất hiện | Sanitize at write/seed boundary; define allow-list before CRUD |
| Global settings trả cả internal keys | Lộ secret/config | Public allow-list query + response schema |
| Store gallery query gắn sai owner | Wrong images/data leak | Filter owner type, owner id, role; deterministic order |
| FE async migration bị đánh giá thiếu | Pages break dù API pass | Separate explicit FE integration phase; inventory raw consumers |
| Admin audit data bị trộn vào clone data | Scope/data drift | Current FE + current DB are source of truth for this plan |
| Docs ghi estimated price 11 | False validation failure | Use DB/source count 10 and correct docs |

## 14. Quan hệ với báo cáo admin audit cũ

`plans/reports/260721-1011-thuccoffee-admin-db-gap-audit.md` vẫn hữu ích nếu mục tiêu
sau này là full production-admin parity. Nó không phải scope cho plan public read
API hiện tại.

Không kéo các đề xuất sau từ audit cũ vào plan này:

- 20-30 table full CMS/admin schema.
- Orders/RBAC/audit logs/soft delete/localized texts.
- Full production media relationship import.
- 43rd product, 7th FAQ, five right banners.
- Category hierarchy/primary category redesign.

Nếu Claude dùng cả hai báo cáo, báo cáo hiện tại có quyền ưu tiên cho
`remaining-public-read-api-and-seed-alignment`.

## 15. Runtime và working-tree state khi viết báo cáo

- Postgres được start tạm để query read-only và đã stop.
- User đã start frontend/backend containers riêng; báo cáo không stop chúng.
- Backend cần Postgres chạy mới phục vụ DB read endpoint được.
- Working tree đang dirty từ backend read API work; Claude không được revert hoặc
  overwrite edits ngoài scope.
- Chưa commit.

## 16. Unresolved questions

Không có câu hỏi chặn plan.

Hai quyết định đã chốt cho plan generator:

1. Chọn existing-schema completion, không full admin parity.
2. `static_pages.content` giữ sanitized HTML text, không đổi JSONB/new tables.
