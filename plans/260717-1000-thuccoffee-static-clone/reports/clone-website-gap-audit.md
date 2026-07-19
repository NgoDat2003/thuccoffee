---
title: THỨC Coffee clone website gap audit
source: http://www.thuccoffee.com.vn
clone: http://127.0.0.1:4178
scanned_at: 2026-07-17
scope: Read-only comparison of local clone against the complete source baseline
---

# THỨC Coffee Clone Website Gap Audit

## Kết luận

**FAIL — clone chưa đạt source-complete.** Source có 400 path chuẩn hóa, trong đó 392 path đang trả HTTP 200. Clone chỉ đưa đúng route/record/template cơ bản cho **63/392 path**; **329 path còn thiếu hoặc xử lý sai**. Ngay cả 63 path này vẫn còn thiếu nội dung, component và visual fidelity.

Build và lint đều pass. Vấn đề chính không phải code không chạy, mà là clone đã rút gọn scope quá mạnh so với website thật.

| Chỉ số | Kết quả |
|---|---:|
| Source path chuẩn hóa | 400 |
| Source path đang hoạt động | 392 |
| Clone đúng route/record/template cơ bản | 63 |
| Source-working path thiếu hoặc sai behavior | 329 |
| Product slug đúng | 42/42 |
| Story slug đúng | 4/267 |
| Story pagination đúng | 0/54 |
| Menu category deep-link đúng | 0/10 |
| Store detail slug đúng | 7/7 |
| Asset source healthy | 462 |
| Asset local | 92 |
| Asset local được code tham chiếu | 67 |
| Asset local không dùng | 25, tổng 16.85 MB |

Chi tiết từng source path nằm trong [clone-path-parity.csv](./clone-path-parity.csv).

## P0 — Blocker lớn nhất

### 1. Footer sai cấu trúc trên toàn website

Footer hiện tại là footer generic hai cột tại `src/components/layout/Footer.tsx:8-46`, khác source ở hầu hết điểm nhận diện:

- Thiếu divider có `icon-coffee.png` ở giữa.
- Desktop dùng `md:grid-cols-2`; source là ba vùng 25% / 50% / 25%.
- Thiếu newsletter/email subscription ở cột phải.
- Link đang xếp dọc; source chia thành ba cột link.
- Social icon thiếu vòng tròn viền 35×35.
- Copyright đang căn trái, 14px, màu xám; source căn giữa, 16px, màu tối.
- Clone có “Chính sách thành viên” trong footer nhưng thiếu “Đăng Nhập”.
- Mobile clone vẫn hiện toàn bộ footer; source ẩn phần top và chỉ giữ divider + copyright.

**Ảnh hưởng:** mọi route, cả desktop và mobile.

### 2. Toàn bộ hệ thống “Chuyện của Thức” gần như chưa clone

- Source có 267 bài; local chỉ có 5 record, nhưng chỉ **4 slug khớp chính xác**.
- **263/267** source story URL bị redirect về `/chuyen-cua-thuc`.
- **54/54** path phân trang `/chuyen-cua-thuc/t1p1/` đến `t1p54/` bị route `:slug` nuốt rồi redirect về trang đầu.
- Bài local thứ năm đã bỏ emoji khỏi slug nên canonical source URL không hoạt động.
- `BlogPost` không có date, rich body, inline images hoặc sidebar metadata.
- `BlogDetailPage.tsx:22` dùng summary một dòng làm toàn bộ thân bài.
- Listing chỉ có năm card, thiếu date, “Xem Tiếp” và pagination.

**Ảnh hưởng:** 318 path thuộc story detail + pagination đang thiếu/sai; listing cũng chỉ là bản rút gọn.

### 3. Header mobile/tablet sai geometry và thiếu component

Tại `Header.tsx`, `Layout.tsx` và `MobileDrawer.tsx`:

- Clone luôn dùng header trắng cao 82px và luôn hiện logo; source mobile là bar xanh 50px, icon trắng, ẩn logo desktop.
- Clone đổi sang desktop nav ở 1024px; source đổi ở 768px. Khoảng 768–1023px đang dùng sai layout.
- Main luôn chừa 82px trên mobile thay vì 50px.
- Drawer là panel phải rộng 288px từ top; source là drawer full-width bắt đầu dưới bar 50px.
- Drawer thiếu Trang chủ, Đăng Nhập, logo mobile, email contact và search control.

**Ảnh hưởng:** mọi route ở 375px và 768–1023px.

## P1 — Route và nội dung thiếu

### 4. Menu category deep-link không hoạt động

Source có 10 category working, ví dụ `/menu/coffee-t1p1s494/`. Clone chỉ khai báo `/menu` và `/menu/:slug`. Category URL bị hiểu là product slug, lookup fail, sau đó redirect về `/menu`; trang menu lại luôn khởi tạo `san-pham-moi`.

- Category data 10 nhóm đã có và số lượng membership khớp source.
- Nhưng mọi item trong desktop dropdown đều trỏ cùng `/menu`.
- Runtime xác nhận `/menu/coffee-t1p1s494/` kết thúc ở `/menu`.

**Ảnh hưởng:** 10/10 working category path.

### 5. Product detail đủ slug nhưng thiếu dữ liệu/media

- 42/42 product slug đang hoạt động đúng.
- 0/42 product có description.
- 41/42 detail dùng thumbnail 450×450 thay vì source full-resolution.
- Chỉ Berry Mango có `image` full-res.
- Data model chỉ hỗ trợ một ảnh; lightbox luôn có một slide.
- 10 giá là estimate nhưng UI hiển thị như giá confirmed.
- Breadcrumb đang hiện trong khi source CSS ẩn breadcrumb.

**Ảnh hưởng:** toàn bộ 42 product detail; 41 path thiếu full-resolution primary media.

### 6. Store page và gallery sai

- `/cua-hang/` source mở selected detail 40D Lý Tự Trọng; clone lại hiển thị grid bảy store card.
- 7/7 detail slug tồn tại, nhưng mỗi detail chỉ dùng một homepage representative image.
- Source có 35 route-specific store images, năm ảnh/store; clone thiếu 30 ảnh và không dùng gallery của 40D dù năm ảnh này đã local.
- Thiếu mixed-ratio gallery và selector bảy chi nhánh.
- Map chỉ dựa vào iframe Google Maps, không có load/error/offline fallback.

**Ảnh hưởng:** `/cua-hang/` và cả bảy store detail.

### 7. Static pages là nội dung rút gọn hoặc tự viết

| Path | Gap chính |
|---|---|
| `/gioi-thieu/` | Chỉ ba paragraph; thiếu ảnh lớn và nội dung source đầy đủ. Asset `698435b6_thuc-duong41.jpg` đã local nhưng không render. |
| `/chuong-trinh-thanh-vien/` | Chỉ intro + FAQ; thiếu benefits, point rules, tiers, birthday presentation, support section và hai ảnh đã local. |
| `/tuyen-dung/` | Ba job card generic; thiếu ca làm, địa điểm chi tiết và hướng dẫn ứng tuyển. Source campaign image đang broken upstream nên không tính là asset bắt buộc tải. |
| `/lien-he/` | Form thiếu Phone; grid clone 50/50 thay vì 60/40; địa chỉ chỉ còn “TP.HCM, Việt Nam”. |
| `/delivery/` | Chỉ hotline + CTA store list; thiếu Zalo, Messenger, promotion content và ảnh `249fc9a9_post-17042023.png` dù asset đã local. |
| `/chinh-sach/` | Route tồn tại, nhưng content chỉ ở mức tối thiểu. |
| `/account/login/` | Thiếu remember-me, forgot-password link và login entry trong shared navigation. |
| `/account/forgot-password/` | Không có route/page; runtime trả local 404. |
| `/index` | Source alias về home; clone trả local 404. |
| `/search/...` | Không có search route/page; header search chỉ là icon trang trí. |

## P1 — Ảnh và asset

### Asset inventory

- Source manifest: 473 asset, 462 healthy, 11 broken.
- Local: 92 asset, tất cả non-zero, đúng magic/extension và đều có trong source manifest.
- Code tham chiếu 67 asset; **0 referenced filename bị thiếu**.
- 25 asset local không được dùng, tổng **16,846,424 bytes (55.5% dung lượng local)**.
- Vì `import.meta.glob` dùng `eager: true`, 25 asset không dùng vẫn đi vào build graph.
- Raw source coverage là 92/462 = 19.9%; 370 healthy asset chưa local. Không phải tất cả 370 đều cần cho scope hiện tại, nhưng gap actionable gồm product full-res, store gallery, story inline/sidebar và static page visuals.

### Gap ảnh cụ thể

| Khu vực | Gap |
|---|---|
| Product detail | Thiếu 41 full-resolution primary image; White Coffee cần mapping filename riêng. |
| Store detail | Thiếu 30/35 route-specific gallery image; không dùng đúng gallery năm ảnh/store. |
| Home gallery | Đúng 4/8 source images; thiếu bốn ảnh đúng dù chúng đã local, thay bằng bốn ảnh store 40D. |
| Story detail | Thiếu rich body images, sidebar thumbnails và ít nhất ba inline images của Deal-on-Day. |
| About/Membership/Delivery | Asset đúng đã local nhưng page không render. |
| Missing fallback | Resolver đổi asset thiếu thành logo, khiến lỗi ảnh có thể trông như nội dung chủ ý thay vì bị phát hiện. |

Runtime home desktop hiện có 26 `<img>` và không có broken `<img>`. Điều này chỉ chứng minh filename được render hợp lệ; không chứng minh ảnh đúng source, vì nhiều ảnh đúng đang bị thay thế hoặc không được dùng.

## P1 — Style/component fidelity dùng chung

### Desktop header/nav

- Logo 48px thay vì khoảng 70px.
- Nav 14px/gap 20px thay vì 16px/gap 35px.
- Active state thiếu underline xanh 3px.
- Menu dropdown 224px dạng list; source mega-menu rộng 1170px, bốn cột.
- Source có hotline row riêng, navigation/search row riêng; clone gom một hàng.

### Page tokens và spacing

- `main.css` chưa đặt source body background `#f5f5f5`, text `#292929`, 16px/24px, weight 400.
- Nhiều page dùng `py-10` = 40px, source section padding chuẩn là 30px.
- `Container` 1170px + gutter 15px là phần đang đúng.

### Shared title/card/carousel

- `SectionTitle` luôn căn giữa; source title block căn trái, 24px/500 uppercase xanh, subtitle italic 18px.
- `ProductCard` sai mobile image size, info panel, name color/hover, price size và text truncation.
- Hero bị bọc trong 1170px container và thêm top padding; source là full-bleed.
- Hero clone cố định 300/450px; source desktop là viewport trừ header 82px.
- Carousel arrows/dots dùng một behavior chung, không khớp từng source carousel.
- Story carousel thiếu autoplay 8000ms.

### Component dùng chung khác

- Floating order là pill chữ xanh; source dùng `icon-delivery.png` trong circle 60×60, bottom 130px, có ring animation.
- Breadcrumb đang hiện ở product/story/store detail nhưng source ẩn.
- Cookie banner thiếu link “Xem chính sách sử dụng cookie” và alignment khác.
- Newsletter/search bị loại có chủ ý trong plan cũ, nhưng vẫn là gap nếu mục tiêu hiện tại là clone visual/source-complete.

## Route-by-route status

| Route family | Source working | Clone status | Severity |
|---|---:|---|---|
| `/` | 1 | Route đủ sáu section chính; hero, gallery, typography, spacing và shared layout sai | High |
| `/menu/` | 1 | Listing chạy; default category cố định | Medium |
| `/menu/{category}/` | 10 | 0/10; redirect về default menu | High |
| `/menu/{product}/` | 42 | 42/42 slug; detail content/media thiếu | High |
| `/chuyen-cua-thuc/` | 1 | Chỉ năm card, thiếu metadata/pagination | Critical |
| `/chuyen-cua-thuc/t1p{n}/` | 54 | 0/54; redirect về listing | Critical |
| `/chuyen-cua-thuc/{story}/` | 267 | 4/267 slug; body chỉ là summary | Critical |
| `/cua-hang/` | 1 | Sai template | High |
| `/cua-hang/{store}/` | 7 | 7/7 slug; thiếu gallery/selector | High |
| `/gioi-thieu/` | 1 | Partial | Medium |
| `/chuong-trinh-thanh-vien/` | 1 | Partial | High |
| `/tuyen-dung/` | 1 | Partial | Medium |
| `/lien-he/` | 1 | Partial | Medium |
| `/delivery/` | 1 | Partial | Medium |
| `/chinh-sach/` | 1 | Minimal | Low |
| `/account/login/` | 1 | Partial | High |
| `/account/forgot-password/` | 1 | 404 | High |

Tám source path lịch sử đang HTTP 500 không được tính vào 392 working path và không nên được clone thành lỗi 500.

## Runtime verification

- Local Vite server: `http://127.0.0.1:4178`.
- `/menu/coffee-t1p1s494/` runtime redirect thành `/menu`.
- `/chuyen-cua-thuc/t1p2/` runtime redirect thành `/chuyen-cua-thuc`.
- `/account/forgot-password/` giữ URL nhưng render title `404 - Thức Coffee - Open 24/7` và H1 `404`.
- `/index/` và route bất kỳ render local 404.
- Home rendered text có dấu tiếng Việt đúng; output PowerShell mojibake không phải lỗi UI.
- `npm run lint`: pass.
- `npm run build`: pass, 174 modules transformed.
- Screenshots: [desktop full page](./clone-audit-screenshots/home-desktop-full.png), [mobile full page](./clone-audit-screenshots/home-mobile-full.png).

Playwright không có trong dependency nên phần browser runtime dùng `agent-browser`; không cài thêm package trong lúc audit.

## Thứ tự sửa đề xuất

1. Sửa shared shell trước: footer, mobile/tablet header, desktop header, global tokens, full-bleed hero.
2. Sửa router/canonical paths: 10 menu categories, 54 story pages, 267 story slugs, forgot-password, `/index`, search.
3. Mở rộng data model: rich story, date/media/sidebar, product descriptions/gallery, store galleries.
4. Gắn các asset đã local nhưng chưa dùng; sau đó tải/mapping 41 product full-res và 30 store gallery images.
5. Rebuild từng static page theo source content/component thay vì text summary.
6. Thêm host rewrite cho SPA deep links (`_redirects`, `vercel.json`, hoặc cấu hình tương đương theo host).
7. Chạy visual regression tại 1440px, 768px và 375px sau mỗi nhóm template.

## Unresolved questions

- Acceptance target là plan rút gọn 14 route cũ hay clone toàn bộ 392 source-working path? Hai chuẩn này khác nhau rất lớn.
- Search và `/index` có cần giữ đúng behavior source hay chỉ cần route read-only?
- Newsletter/search từng được plan cũ cho phép bỏ; với yêu cầu clone hiện tại, chúng nên được phục hồi visual shell hay đầy đủ interaction?
