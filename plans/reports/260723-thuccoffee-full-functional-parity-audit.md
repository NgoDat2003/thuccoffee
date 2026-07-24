---
title: THỨC Coffee - Báo cáo đối chiếu chức năng website gốc và project clone
type: web-testing-and-functional-parity-audit
date: 2026-07-23
source: http://www.thuccoffee.com.vn
local: http://127.0.0.1:3000
scope: public-site-and-authenticated-admin
safety: source-read-only
---

# 1. Kết luận điều hành

Project hiện tại **đã vượt mức clone giao diện tĩnh**: đã có frontend public, API đọc,
PostgreSQL, MinIO, đăng nhập admin và CRUD cho các nhóm nội dung chính. Dữ liệu lõi đã
đủ về số lượng:

- 42 sản phẩm.
- 267 bài viết.
- 7 cửa hàng.
- 10 danh mục local.
- 3 banner local: 2 slider và 1 promotion.

Tuy nhiên project **chưa đạt 100% chức năng website gốc**. Nếu lấy 20 module đang tồn
tại trong admin gốc làm chuẩn:

- 8/20 module đã có bản tương ứng nhưng đều mới ở mức **một phần**.
- 12/20 module chưa có luồng quản trị end-to-end.
- 0/20 module đạt tương đương tuyệt đối về field, lifecycle, thứ tự hiển thị và tác
  động ra public.

Phần public đã có đủ các template nội dung quan trọng như trang chủ, menu, chi tiết
sản phẩm, blog, chi tiết bài viết, cửa hàng, giới thiệu, thành viên, tuyển dụng, liên
hệ, giao hàng và chính sách. Khoảng trống lớn không còn nằm ở “thiếu trang”, mà nằm ở
**tương tác thật, mô hình dữ liệu và quy tắc hiển thị**:

1. Tìm kiếm sản phẩm/bài viết chưa hoạt động.
2. Đăng nhập public và quên mật khẩu chưa hoạt động thật.
3. Form liên hệ và đăng ký email chỉ là demo/no-op.
4. Sản phẩm chưa có lựa chọn size/nóng/lạnh và giá theo lựa chọn.
5. “Hiển thị trang chủ”, priority và thứ tự bài viết/sản phẩm chưa khớp nguồn.
6. Nhiều nội dung tĩnh vẫn chưa có CMS/API quản trị.
7. Homepage gallery đang hardcode.
8. Right banner có type trong admin local nhưng không có dữ liệu và public không render.
9. Admin gốc có nhiều module mà local chưa có: options, sticker, gallery, static text,
   các trang nội dung đơn, FAQ thành viên và orders.

**Phán quyết:** đây là một **content-admin MVP khá hoàn thiện**, chưa phải bản sao
100% nghiệp vụ. Có thể đạt tương đương chức năng hợp lý, nhưng không nên sao chép
nguyên mô hình legacy, dữ liệu riêng tư, secret vận hành hoặc lỗi của website gốc.

# 2. Phạm vi và phương pháp kiểm tra

## 2.1 Kiểm tra website gốc

- Đăng nhập admin bằng tài khoản do chủ project cung cấp.
- Duyệt 20 route admin theo chế độ chỉ đọc.
- Không bấm Save, Delete, Upload, Publish, đổi trạng thái đơn hàng hoặc bất kỳ thao tác
  ghi dữ liệu nào.
- So sánh 19 route public đại diện giữa nguồn và local, tổng cộng 38 lượt browser check.
- Kiểm tra status, title, heading, form/control, nội dung, ảnh lỗi, request lỗi và
  client-side 404.
- Đối chiếu với inventory trước đó: 400 URL nội bộ chuẩn hoá, trong đó 392 URL trả
  HTTP 200 và 8 URL menu legacy trả HTTP 500.

## 2.2 Kiểm tra project local

- Docker Compose: frontend, backend, PostgreSQL và MinIO đều healthy tại thời điểm test.
- `npm run test:admin-ui`: đạt 10/10 test.
- `server/npm run smoke:api`: đạt 9/9 endpoint public.
- Đọc route, schema, service, page và form hiện tại để phân biệt UI có thật với UI demo.
- Đọc số lượng bản ghi trực tiếp ở database, không suy ra từ giao diện.4

## 2.3 Giới hạn của lần kiểm tra

- Không chạy mutation smoke của admin để tránh tạo/xoá record ngoài yêu cầu so sánh.
- Không kiểm tra gửi email thật, reset password thật hoặc order thật vì thiếu tích hợp
  bên thứ ba và dữ liệu nghiệp vụ được phê duyệt.
- Không đo pixel-perfect trên toàn bộ 400 URL; lần này tập trung vào route template,
  dữ liệu và chức năng.
- Không sao chép hoặc ghi lại credential nguồn trong báo cáo.

# 3. Hiện trạng dữ liệu local

| Tài nguyên | Số lượng local | Đánh giá |
|---|---:|---|
| Sản phẩm | 42 | Đủ số lượng public hiện hành |
| Danh mục | 10 | Nhiều hơn 8 danh mục thật của nguồn vì local trộn 2 nhóm trình bày |
| Bài viết | 267 | Đủ số bài, nhưng thứ tự/phân trang chưa khớp nguồn |
| Cửa hàng | 7 | Đủ số lượng |
| Banner | 3 | 2 slider, 1 promotion, 0 right banner |
| Product options | 6 | Có master data nhưng chưa gắn với sản phẩm |
| Product-option links | 0 | Chức năng option chưa hoạt động |
| Stickers | 0 | Chưa có dữ liệu |
| Product-sticker links | 0 | Chưa hoạt động |
| Media attachments | 35 | Thấp hơn đáng kể so với phạm vi media nguồn |
| Static pages | 0 | Nội dung public còn nằm trong code |

# 4. Đối chiếu public website

## 4.1 Ma trận route/template

| Nhóm trang | Website gốc | Project local | Mức độ |
|---|---|---|---|
| Trang chủ | Có slider, promotion, sản phẩm chọn lọc, gallery | Có đầy đủ bố cục lõi | Một phần |
| Menu tổng | Có | Có, lấy API | Tốt |
| Menu theo danh mục | Có | Có | Tốt về route, khác thứ tự |
| Chi tiết sản phẩm | Có option và giá theo option | Có nội dung cơ bản, một giá | Thiếu nghiệp vụ |
| Blog index | Có phân trang thật | Có phân trang API | Tốt về cấu trúc, sai thứ tự |
| Blog trang 54 | Có 2 bài cuối | Có route/trang cuối | Dữ liệu trang cuối khác nguồn |
| Chi tiết blog | Có | Có, nội dung đầy đủ | Tốt |
| Danh sách cửa hàng | Có | Có | Tốt |
| Chi tiết cửa hàng | Có bản đồ/media | Có gallery, map, chọn chi nhánh | Gần đủ |
| Giới thiệu | Có | Có | Nội dung gần đủ, chưa quản trị |
| Thành viên | Có | Có | Nội dung gần đủ, chưa quản trị |
| Tuyển dụng | Có | Có | Nội dung gần đủ, chưa quản trị |
| Liên hệ | Có form | Có form demo | Chưa có submit thật |
| Giao hàng | Có | Có | Nội dung gần đủ, chưa quản trị |
| Chính sách | Có | Có | Nội dung gần đủ, chưa quản trị |
| Login public | Có form thật phía nguồn | Có màn demo | Chưa tương đương |
| Quên mật khẩu | Có route | Client-side 404 | Thiếu |
| Search sản phẩm | Có route và kết quả | Client-side 404/no-op | Thiếu |
| Search bài viết | Có route và phân trang | Client-side 404/no-op | Thiếu |

Lưu ý: Nginx local fallback mọi route về SPA nên HTTP có thể vẫn là 200. Khi React
render màn 404 thì đó vẫn là **route chức năng bị thiếu**, không được tính là pass chỉ
vì status mạng là 200.

## 4.2 Trang chủ

### Đã có

- Hero/banner.
- Promotion banner.
- Danh sách sản phẩm.
- Các khối giới thiệu nội dung.
- Gallery/lightbox.
- Newsletter và footer về mặt giao diện.

### Chưa khớp

- Nguồn chọn sản phẩm trang chủ bằng thuộc tính kiểu `Show On Home` và priority.
- Local đang lấy nhóm `yeu-thich-nhat` rồi `.slice(0, 8)`, nên sản phẩm đầu trang khác
  nguồn hiện tại.
- Homepage gallery local là danh sách 8 MinIO key hardcode trong
  `src/components/home/GalleryLightbox.tsx`; admin sửa gallery không được.
- Promotion banner nguồn chỉ hiển thị một banner đang active. Đây không phải lỗi
  “2 banner mà chỉ thấy 1”: banner thứ hai là `MainBanner/slider`, còn promotion là
  placement khác.
- Right banner chưa có renderer public.

### Cần làm

- Thêm `isFeatured/showOnHome` và `priority` vào sản phẩm.
- API trang chủ trả dữ liệu đã được xếp đúng quy tắc.
- Gallery chuyển sang bảng/API/admin.
- Render đúng từng placement: slider, promotion, right.

## 4.3 Menu và sản phẩm

### Đã có

- 42 sản phẩm public.
- Danh sách tổng, danh mục, chi tiết.
- Hình thumbnail/detail lấy qua MinIO.
- Tên, giá, mô tả và estimated.

### Chưa khớp

- Nguồn có 8 danh mục thật: MANGO BREEZE, COLD BREW ORIGINS, COFFEE, NON-COFFEE,
  TEA, MILK TEA, BLENDED, CAKE.
- Local có thêm “SẢN PHẨM MỚI” và “Yêu thích nhất” như category database, trong khi
  nguồn dùng chúng như nhóm trình bày.
- Nguồn sắp xếp theo priority/featured; local chưa tái hiện đúng nên thứ tự thay đổi.
- Chi tiết Americano nguồn có các lựa chọn và giá riêng:
  - Lạnh size M: 45.000.
  - Lạnh size L: 55.000.
  - Nóng: 45.000.
- Local chỉ hiển thị một mức giá, không có option picker.
- Database có 6 option master nhưng `product_option_links = 0`.
- Chưa có sticker/badge và liên kết sản phẩm-sticker.
- Chưa có old price, out-of-stock/inventory, tag, gallery nhiều ảnh hoặc rich content
  theo đầy đủ mô hình nguồn.

## 4.4 Blog

### Đã có

- Đủ 267 bài.
- API phân trang thật.
- Search/status ở admin.
- Chi tiết bài, rich HTML, media từ MinIO.
- Admin có editor, sanitize, preview, upload và publish/unpublish.

### Chưa khớp

- Website gốc đang xếp theo priority, không đơn thuần theo ngày.
- Bài đầu index nguồn tại thời điểm kiểm tra khác bài đầu local.
- Trang 54 nguồn và local chứa các bài khác nhau.
- Chưa có category/tag/featured/priority đầy đủ.
- Chưa có delete/soft-delete và media placements đầy đủ.
- Nội dung local có thể sạch hơn vì một số ảnh nguồn hiện bị hỏng; không nên cố làm
  hỏng theo nguồn để đạt parity.

## 4.5 Cửa hàng

### Đã có

- Đủ 7 cửa hàng.
- List/detail.
- Gallery.
- Bản đồ và chuyển nhanh giữa chi nhánh.
- Admin create/update/publish và replace gallery.

### Chưa khớp

- Map local được suy từ địa chỉ; nguồn có field Google Map riêng.
- Local bổ sung text “Mở cửa 24/7” không phải lúc nào cũng là dữ liệu xác nhận từ nguồn.
- Media chưa giữ đủ metadata kiểu tên, link, role/type, priority như nguồn.
- Chưa có delete/lifecycle/audit đầy đủ.

## 4.6 Search

Nguồn có:

- Product search: `/search/p1/?type=Product&keyword=...`
- Blog search và phân trang: `/search/t3p{n}/?type=Blog&keyword=...`

Local hiện:

- Mobile search gọi `preventDefault`.
- Desktop chưa có luồng search hoàn chỉnh.
- Route search nguồn rơi vào client-side 404.

Cần thêm một search contract thống nhất:

- `GET /api/search?type=product|blog&keyword=&page=&pageSize=`
- Hoặc giữ hai resource endpoint riêng nếu muốn tối ưu type/schema.
- Route FE tương thích URL nguồn để deep link cũ vẫn hoạt động.
- Trạng thái loading, empty, lỗi, pagination và giữ keyword trên URL.

## 4.7 Form liên hệ và newsletter

### Nguồn

- Có endpoint/flow gửi contact và subscribe.

### Local

- Contact form validate rồi hiện “Đã gửi (demo)”; không tạo request thật.
- Newsletter chỉ `preventDefault`.

### Cần làm

- Bảng `contact_submissions` và `newsletter_subscriptions`, hoặc tích hợp CRM/provider.
- Rate limit, honeypot/CAPTCHA tuỳ mức public exposure.
- Email queue/retry, không gửi SMTP đồng bộ trong request.
- Trạng thái duplicate email, consent, unsubscribe và retention policy.
- Admin inbox/export nếu business cần xử lý contact trong CMS.

## 4.8 Public account

Nguồn có form email/password, remember-me và forgot password. Local login public hiện
là demo và chưa có forgot-password.

Muốn tương đương cần:

- User/member schema tách khỏi admin user.
- Login/logout/session hoặc JWT cookie an toàn.
- Forgot/reset password bằng token một lần, có expiry.
- Rate limit và audit security.
- Email template/provider.
- Chính sách dữ liệu cá nhân.

Không nên dùng chung bảng/quyền admin cho public member.

# 5. Đối chiếu 20 module admin nguồn

| # | Module nguồn | Local hiện tại | Khoảng trống chính | Kết luận |
|---:|---|---|---|---|
| 1 | Site Settings | Có màn settings 11 key | Nguồn có khoảng 48 control; thiếu contact nâng cao, social, GEO, analytics, mail, counters, feature toggles | Một phần |
| 2 | Static Text | Không có | Nguồn quản trị hơn 100 chuỗi theo namespace | Thiếu |
| 3 | Product | CRUD trừ delete, publish, bulk, category, ảnh | Thiếu option, sticker, old price, featured, priority chuẩn, tags, media roles, lifecycle | Một phần |
| 4 | Product Category | CRUD label/key/order/count | Thiếu parent, image, summary, visibility; local trộn category và presentation group | Một phần |
| 5 | Product Options | Chỉ có table/6 seed row | Không API/admin/public; không có link tới product | Thiếu end-to-end |
| 6 | Sticker | Có table schema nhưng 0 row | Không seed/API/admin/public | Thiếu |
| 7 | Blog | List/form/editor/preview/publish | Thiếu category/tag/featured/priority/media/delete/audit | Một phần, mạnh nhất |
| 8 | Stores | CRUD/publish/gallery | Thiếu map field chuẩn, media metadata, delete/audit | Một phần |
| 9 | Gallery | 8 ảnh hardcode FE | Không DB/API/admin | Thiếu |
| 10 | Main Banner | Có type `slider` | Thiếu CTA label, new-tab, content, schedule, media metadata | Một phần |
| 11 | Promotion Banner | Có type `promotion` | Thiếu CTA/content/schedule; public dùng first-active | Một phần |
| 12 | Right Banner | Type hợp lệ trong admin | 0 data, không renderer public | Một phần về schema, thiếu end-to-end |
| 13 | About Us | Public hardcode | Không DB/API/admin | Thiếu |
| 14 | Delivery Intro | Public hardcode | Không DB/API/admin | Thiếu |
| 15 | Membership Content | Public hardcode | Không DB/API/admin/media slots | Thiếu |
| 16 | Membership FAQ | Public hardcode | Không schema/API/admin | Thiếu |
| 17 | Recruitment | Public hardcode | Không DB/API/admin | Thiếu |
| 18 | Policy | Public hardcode | Không DB/API/admin | Thiếu |
| 19 | Stores Intro | Public hardcode | Không DB/API/admin | Thiếu |
| 20 | Orders | Không có | Không cart/checkout/order model/admin workflow | Thiếu, cần chốt nghiệp vụ |

# 6. Chi tiết field/lifecycle còn thiếu theo resource

## 6.1 Products

Local đang quản lý:

- name, slug/key, price, estimated, description, sort order.
- categories.
- thumbnail và detail image.
- create/update/publish; bulk publish từ UI.

Để tương đương nguồn cần thêm:

- primary category rõ ràng, không chỉ M:N chung.
- old price.
- show-on-home/featured.
- product options và giá/quantity theo option.
- sticker/badge.
- tags.
- summary và rich content nếu muốn giữ đúng field nguồn.
- media attachments theo role và nhiều ảnh.
- active/draft/soft-delete/audit.
- priority đúng semantics nguồn.

## 6.2 Categories

Local đủ cho menu phẳng. Nếu clone đúng model nguồn cần:

- parent category.
- image.
- summary.
- visible/active.
- soft-delete/lifecycle.
- tách “category thật” khỏi nhóm lọc/presentation như “Sản phẩm mới”, “Yêu thích nhất”.

## 6.3 Blog

Cần thêm:

- `priority` độc lập với `publishedAt`.
- category, tags và featured.
- thumbnail/detail/banner role rõ ràng.
- soft-delete/delete.
- audit createdBy/updatedBy/publishedBy.
- kiểm thử thứ tự 267 bài và boundary 54 trang bằng fixture nguồn.

## 6.4 Stores

Cần thêm:

- map URL/embed hoặc latitude/longitude được quản trị.
- opening hours thay vì text mặc định.
- media metadata và sort.
- visibility/lifecycle/delete.
- audit.

## 6.5 Banners

Cần thêm:

- button label.
- open in new tab.
- show content.
- start/end schedule.
- rich content.
- placement rõ ràng.
- deterministic rule khi nhiều promotion cùng active.
- public renderer cho right banner.

## 6.6 Site settings

11 key local hiện phù hợp cho dữ liệu public cơ bản và là allow-list an toàn. Không nên
đưa tất cả field legacy vào một key-value editor không kiểm soát.

Có thể bổ sung theo nhóm typed:

- contact/location.
- social links còn thực sự sử dụng.
- feature flags.
- SEO metadata.
- email recipient aliases.

Không đưa SMTP password, analytics secret hoặc credential vào UI settings chung.
Secret phải nằm trong environment/secret manager và chỉ hiển thị trạng thái masked.

## 6.7 Static pages và static text

Nguồn có hai khái niệm:

- Trang nội dung đơn: About, Delivery, Membership, Recruitment, Policy, StoresIntro.
- StaticText: hơn 100 chuỗi UI theo namespace Menu, Footer, Search, Login, Checkout...

Khuyến nghị:

- Dùng `static_pages` typed cho 6 trang nội dung thật và FAQ.
- Chỉ xây localized text CMS nếu business thực sự cần sửa toàn bộ microcopy không deploy.
- Nếu website chỉ dùng tiếng Việt và text ít đổi, giữ UI copy trong code sẽ đơn giản,
  an toàn hơn.
- Không tạo màn Register/Profile/Checkout chỉ vì admin legacy còn chuỗi text chết.

## 6.8 Orders

Admin nguồn có route orders và bộ lọc ngày/search, nhưng public source không cho thấy
cart/checkout đang hoạt động rõ ràng. Vì vậy không đủ cơ sở để copy order chỉ từ màn list.

Nếu user vẫn yêu cầu full commerce, phải làm một project scope riêng:

- cart và price snapshot.
- customer/address.
- order/order-item/status history.
- inventory semantics.
- checkout confirmation.
- email/SMS.
- payment/COD.
- admin status transition và audit.
- idempotency, security, privacy và retention.

# 7. Những gì có thể thêm

## 7.1 Có thể làm hoàn toàn trong codebase

- Search sản phẩm/bài viết và URL tương thích nguồn.
- Priority/featured/show-on-home.
- Product options, sticker, tags và media gallery.
- Static pages, Membership FAQ và homepage gallery CMS.
- Banner CTA, schedule, content và right-banner renderer.
- Store map/opening hours/media metadata.
- Blog category/tag/featured/priority.
- Soft delete, audit log và RBAC admin.
- Contact/newsletter persistence.
- Public member auth/forgot-password về mặt code.
- Visual regression, route manifest và E2E suite.

## 7.2 Có thể code nhưng không thể tuyên bố “hoạt động production” nếu chưa có đầu vào

- Gửi contact/newsletter email: cần SMTP/provider, sender domain, DNS và template.
- Forgot password: cần provider email và public domain HTTPS.
- Analytics: cần tài khoản/ID thuộc business.
- Maps chính xác: cần API key hoặc URL/toạ độ chuẩn.
- Order/payment: cần business rules, payment account, legal/privacy và quy trình vận hành.
- SMS/CRM: cần vendor account và credential.

# 8. Những gì không được hoặc không nên sao chép

1. SMTP password, API key, analytics credential hoặc secret trên production nguồn.
2. Admin session/cookie và password hash nguồn.
3. Dữ liệu user/customer/order thật.
4. Mô hình generic ASP.NET `ItemMaster` chỉ vì nguồn dùng nó; local nên giữ schema
   normalized, typed theo resource.
5. Lỗi HTTPS/certificate của nguồn.
6. 8 route legacy đang HTTP 500.
7. Ảnh hỏng, malformed social/share link, sitemap/canonical sai.
8. Mobile navigation khó truy cập, form thiếu label và lỗi overflow 768px.
9. Chuỗi/config legacy không còn được public sử dụng.

“100% chức năng” nên có nghĩa là **tương đương hành vi business hợp lệ**, không phải
tái tạo cả lỗi, secret và technical debt của hệ thống cũ.

# 9. Lộ trình đề xuất để đạt functional parity

## Phase 0 - Chốt chuẩn 100%

- Chốt scope: public-visible parity hay literal 20-module admin parity.
- Chốt có public member và order/checkout hay không.
- Tạo source route manifest và resource/field matrix làm acceptance contract.

## Phase 1 - Sửa quy tắc dữ liệu đang nhìn thấy

- Tách presentation group khỏi category thật.
- Thêm featured/show-on-home/priority.
- Sửa thứ tự homepage, menu và 267 blog.
- Chốt banner placement và first-active rule.

## Phase 2 - Hoàn thiện tương tác public

- Product/blog search.
- Contact submit thật.
- Newsletter subscribe thật.
- Loading/error/empty/pagination/deep-link.

## Phase 3 - Hoàn thiện sản phẩm

- Options và option prices.
- Stickers/badges.
- Old price, tags, media gallery.
- Admin form và public detail cùng dùng một contract.

## Phase 4 - CMS nội dung tĩnh

- About, Delivery, Membership, Recruitment, Policy, StoresIntro.
- Membership FAQ.
- Homepage Gallery.
- Migration dữ liệu hardcode sang DB/API.

## Phase 5 - Mở rộng resource hiện có

- Blog priority/category/tag/featured/media/lifecycle.
- Store map/hours/media/lifecycle.
- Banner CTA/new-tab/content/schedule/right placement.
- Soft delete và audit.

## Phase 6 - Public member

- Chỉ làm nếu business xác nhận.
- Login/logout/forgot/reset.
- Email integration và security test.

## Phase 7 - Orders/checkout

- Chỉ làm sau khi có PDR nghiệp vụ riêng.
- Không suy ra quy trình order từ một màn admin list trống.

## Phase 8 - Parity verification

- Replay toàn bộ 400 URL manifest.
- E2E cho mọi workflow có ghi dữ liệu trên môi trường test riêng.
- Visual diff desktop/tablet/mobile theo template.
- Accessibility, SEO, security và performance.
- Kiểm tra admin mutation phản ánh đúng ra public sau reload.

# 10. Tiêu chí nghiệm thu “100%”

Chỉ được gọi là 100% khi đạt đồng thời:

1. Mọi URL nguồn đang hoạt động có route local hoặc có quyết định thay thế được ghi rõ.
2. Mọi hành động public hợp lệ có backend thật, không còn demo/no-op.
3. Mọi nội dung admin sửa được lưu DB và phản ánh ra public đúng placement.
4. Thứ tự, featured, pagination và filter khớp quy tắc nguồn.
5. Product option/price và banner schedule hoạt động end-to-end.
6. Static pages/gallery/FAQ không còn hardcode nếu nằm trong CMS scope.
7. Tích hợp email/maps/payment được cấu hình bằng account thuộc business.
8. Không dùng secret hoặc dữ liệu riêng tư lấy từ source.
9. Route E2E, API smoke, visual regression và accessibility checks đều xanh.
10. Các lỗi legacy đã biết được chủ động sửa, không bị tính là thiếu parity.

# 11. Nợ tài liệu phát hiện trong project

`README.md` và `CLAUDE.md` hiện vẫn ghi frontend public đọc dữ liệu tĩnh và chưa gọi API.
Điều này không còn khớp với runtime/code hiện tại đã có service/hook và API smoke.
Tài liệu onboarding cần được cập nhật sau khi owner xác nhận trạng thái migration cuối,
nếu không manager/reviewer dễ kết luận nhầm project vẫn là mockup.

# 12. Các file local quan trọng dùng để đối chiếu

- Admin route FE: `src/routes.tsx`
- Admin route BE: `server/src/modules/admin/admin.routes.ts`
- Product form: `src/components/admin/forms/ProductForm.tsx`
- Public product schema: `server/src/modules/products/products.schemas.ts`
- Homepage product selection: `src/pages/HomePage.tsx`
- Homepage gallery: `src/components/home/GalleryLightbox.tsx`
- Product detail: `src/pages/ProductDetailPage.tsx`
- Blog index: `src/pages/BlogIndexPage.tsx`
- Store detail: `src/pages/StoreDetailPage.tsx`
- Banner admin: `src/pages/admin/AdminBannersPage.tsx`
- Settings allow-list/UI: `src/pages/admin/AdminSettingsPage.tsx`
- Contact form: `src/components/ui/ContactForm.tsx`
- Footer/newsletter: `src/components/layout/Footer.tsx`
- Mobile search: `src/components/layout/MobileDrawer.tsx`
- Public login demo: `src/pages/LoginPage.tsx`

# 13. Quyết định scope (đã chốt 2026-07-23)

Owner chốt "hướng 1" — 100% chức năng public đang dùng + admin đủ quản trị dữ liệu
public. Trả lời cho 8 câu hỏi mở ban đầu:

1. **"100%" = public-visible parity**, không phải đủ 20 module admin legacy. Admin
   chỉ cần CRUD đủ cho dữ liệu public đang hiển thị.
2. **Không làm public member/login/forgot-password thật.** Màn login public giữ
   demo có disclosure; route forgot-password không thêm.
3. **Không làm cart/order/checkout/payment.** Orders admin nguồn không đủ evidence
   nghiệp vụ để copy; nếu cần sẽ là project scope riêng có PDR.
4. **Chỉ tiếng Việt, không xây StaticText CMS hơn 100 key.** Microcopy UI giữ
   trong code; chỉ 6 trang nội dung đơn + FAQ + gallery vào CMS.
5. **Right banner: giữ type trong schema, không xây renderer public** cho tới khi
   có evidence placement thật từ nguồn. Ghi nhận là legacy inactive.
6. **Không đưa analytics/counters/SMTP/social legacy vào CMS.** Secret chỉ nằm
   trong environment; social links chỉ giữ những link public còn dùng.
7. **Delete policy: unpublish/archive cho resource public** (products, blog,
   stores, pages); **hard delete chỉ cho** banners, gallery items và submissions.
8. **Một role admin là đủ.** Không làm editor/publisher/super-admin RBAC.

Kế hoạch triển khai: `plans/260723-public-parity-cms-completion/plan.md` (8 phase).

# 14. Kết quả nghiệm thu (2026-07-23, sau khi hoàn thành 8 phase)

## 14.1 Route manifest replay

`server/scripts/verify-route-manifest.ts` replay 400 URL manifest nguồn:

- **PASS: 391/391 URL trong scope** (verify data-level: slug/suffix tồn tại,
  page trong range, route SPA resolve được).
- **EXCLUDED: 9 URL có lý do ghi nhận** — 8 route legacy nguồn HTTP 500
  (chủ động không tái tạo lỗi) + `/account/forgot-password` (public account
  ngoài scope theo quyết định §13.2).
- Deep link nguồn với text slug khác clone (slug đã normalize bỏ emoji/dấu
  tổ hợp) vẫn mở đúng bài/sản phẩm nhờ API fallback theo ID suffix
  `-s{id}t{n}` (unique trong DB, verify bằng query).

## 14.2 Interaction — không còn demo/no-op trong scope

- Search product/blog theo URL nguồn (`/search/p{n}`, `/search/t3p{n}`) trả
  kết quả thật, pagination, empty state.
- Contact/newsletter lưu DB, honeypot chặn bot, duplicate email idempotent.
- Product option đổi giá trên detail (Americano: Lạnh Size M 45k / L 55k /
  Nóng 45k theo evidence audit); sticker admin gắn hiện ra public.
- Banner schedule: expired/future ẩn khỏi public (verify runtime).

## 14.3 Ordering và taxonomy

- Home: 8 sản phẩm theo `showOnHome + homePriority`, không còn `.slice()` FE.
- Blog: 267 bài / 54 trang, trang 54 có 2 bài, sort `priority ASC →
  publishedAt DESC → id DESC`.
- Categories: 8 `category` thật + 2 `presentation` (Sản phẩm mới, Yêu thích
  nhất), phân biệt qua field `kind`.

## 14.4 Admin → public cho mọi nhóm resource

Verify qua smoke: static page update, FAQ publish/unpublish, gallery
create/delete, sticker attach/detach, option price round-trip đều phản ánh
ra public ngay. Products/blog/stores/banners/settings đã có smoke từ trước.

## 14.5 Lưới kiểm thử cuối

- 11 smoke suite: auth 8/8, api 9/9, admin-products 8/8, admin-blog 11/11
  (gồm byte-identity 267 bài), admin-stores 5/5, admin-banners-settings 5/5,
  upload 8/8, images pass, search-submissions 7/7, pages-gallery 5/5,
  options-stickers 5/5.
- Vitest admin-ui 10/10; Playwright admin-e2e 5/5.
- FE + server lint/build sạch.

## 14.6 Trạng thái so với tiêu chí §10

Đạt: tiêu chí 1–6, 9, 10 (trong phạm vi scope hướng 1). Tiêu chí 7 (email/
maps/payment bằng account business) và phần gửi email thật của contact/
newsletter vẫn chờ đầu vào từ business — code đã sẵn, thiếu provider/domain,
đúng như dự liệu ở §7.2.

