# Admin Espresso Reskin — Brainstorm Chốt Quyết Định

**Ngày:** 2026-07-22
**Trạng thái:** Chốt xong — nền cho `/ck:plan`
**Nguồn thiết kế:**
- Claude Design project `e8f4a5f8-4be7-426d-9597-50d57ba85768`, bundle
  `design_handoff_admin_redesign/` (README handoff + prototype tương tác)
- Bản sao local: `plans/260722-admin-espresso-reskin/design-reference-espresso.dc.html`
  (61KB, HTML inline style, 9 view — NGUỒN CHÂN LÝ cho markup/spacing/màu,
  đọc trực tiếp khi implement từng màn)

## 1. Bối cảnh

Admin MVP vừa xong 11/11 phase (nhánh `feat/admin-shell-upload`, 2 commit
`cb8891c` + `1953b9e`, chưa merge main). Thiết kế "Espresso" là redesign
high-fidelity toàn bộ `/admin/*`: sidebar tối + canvas kem + accent đồng +
hairline dividers thay card shadow. README handoff viết ĐÍCH DANH cho repo này
(nhắc `src/components/admin/*`, `PublishSwitch` restyle 38×22, `ImageField`
dropzone, `services/admin/*.service.ts`).

README hơi cũ so với code: nó coi Stores/Banners/Settings là màn mới cần
backend — thực tế phase 9-10 đã xong cả API lẫn hooks. Vòng này thuần
**presentation**, không đụng data layer.

## 2. Quyết định đã chốt

| # | Chủ đề | Quyết định |
|---|---|---|
| 1 | Dashboard "Tổng quan" | **BỎ** — giữ `/admin` redirect products (nhất quán quyết định cũ). Sidebar bỏ mục Tổng quan; view Dashboard trong file design bỏ qua khi implement |
| 2 | Nhánh | **Rẽ từ `feat/admin-shell-upload` hiện tại** → `feat/admin-espresso-reskin` (không chờ merge main) |
| 3 | Scope UI mới | **Theo design hết**: bulk-select bar (chọn nhiều row → Hiển thị/Ẩn hàng loạt — gọi lặp PATCH publish có sẵn, KHÔNG endpoint mới), sticky save bar (thuần CSS), dropzone style dashed cho ImageField |
| 4 | Fidelity | Pixel-for-pixel theo README ("high-fidelity, colors/spacing/typography/radii final"); sample data thay bằng hooks thật đã có |
| 5 | **Drawer thay trang form** (vòng góp ý 2) | Form NGẮN (product, store, banner) chuyển từ route riêng sang **drawer trượt phải ~560px** mở tại trang list; **blog GIỮ trang riêng** (editor content dài + preview không hợp drawer). Route `/new`, `/:id` của 3 resource đó bỏ; drawer state local (không URL sync — chốt đơn giản trước, sync nếu thấy cần sau) |
| 6 | **Pagination client** (vòng góp ý 3) | Products/stores/banners phân trang **client** trong AdminTable (page size 10) — data vẫn tải hết như hiện tại, KHÔNG đổi API. Blog giữ server pagination sẵn có |
| 7 | API (vòng góp ý 1) | KHÔNG thiếu — kiểm chứng đủ 6 resource + smoke xanh; cảm giác "thiếu" do browser cache bundle cũ (chỉ thấy 2 mục sidebar). Không việc gì phải làm |

## 3. Phạm vi — 8 màn reskin (từ 9 view trong file, bỏ Dashboard)

| View trong design | Component/page hiện tại | Việc |
|---|---|---|
| Sidebar + shell | `AdminLayout/AdminSidebar/AdminTopbar` | Reskin lớn: sidebar tối 232px 2 nhóm nav ("Nội dung"/"Vận hành"), BỎ topbar — user card + logout chuyển xuống đáy sidebar; title vào từng page |
| Products list | `AdminProductsPage` | Reskin + THÊM bulk-select bar + toggle 38×22 |
| Categories | `AdminCategoriesPage` | Reskin: key thành `<code>` chip, input underline |
| Blog list | `AdminBlogPage` | Reskin + pagination plain-text "← Trước / Trang X / Y / Sau →" |
| Stores | `AdminStoresPage` | ĐỔI LAYOUT: table → 2-column card grid (ảnh 140×104, hairline) |
| Banners | `AdminBannersPage` | ĐỔI LAYOUT: tabs → flat list rows (ảnh 150×66, "{type} · Thứ tự {n}") |
| Site Settings | `AdminSettingsPage` | ĐỔI LAYOUT: 2 cột (thông tin + social trái, logo/favicon dropzone phải), sticky action bar |
| Product form | `AdminProductFormPage` | Reskin 2 cột: underlined inputs, pill checkbox categories, dropzone phải, sticky save bar |
| Blog form | `AdminBlogFormPage` | Reskin cùng pattern + card "Xuất bản" (toggle + ngày đăng) bên phải |

## 4. Design tokens (từ README — nguồn cuối là file .dc.html)

Thêm vào `@theme` block `src/styles/main.css` (giữ `--font-sans: Roboto`):
prefix đề xuất `--color-admin-*` để không đụng token public site
(public đang dùng `--color-primary` v.v. — admin token tách riêng, tránh
reskin admin làm lệch màu public).

ink `#241c15` · ink-soft `#3a2f24` · muted `#7d7364` · muted-2 `#a8a08f` ·
bg `#f7f2ea` · surface `#fffdf9` · border `#e4dbcb` · border-soft `#eee6d8` ·
border-input `#d8cdb8` · sidebar `#1c150f` · sidebar-hover `#2b2219` ·
sidebar-muted `#6b5f4f` · sidebar-text `#b7ac98` · accent `#c8793a` ·
accent-strong `#b5652d` · success `#4f7a5a` · ink-dark `#1c150f`

Type: title 34px/900/-0.02em; eyebrow 13px/700 uppercase accent-strong hoặc
11px/700 uppercase ls .08em muted-2; body 14–14.5px; table header 11px/700
uppercase ls .06em muted-2. Radii: pill 9999px, ảnh 8–14px, dropzone 14px.
KHÔNG box-shadow card — hairline divider 1/1.5px.

## 5. Ràng buộc kỹ thuật

- **Data layer bất biến**: hooks/services/API/invalidation giữ nguyên — mọi
  luồng đã verify (46+ smoke, DOM) không được regression.
- `PublishSwitch` restyle track 38×22 (từ 48×28), knob 3px→19px, fill
  copper/green — giữ nguyên props/behavior.
- `ImageField` restyle dropzone dashed 14px + icon + copy kéo-thả — giữ nguyên
  upload flow (`useUploadImage`).
- Icons: inline SVG stroke 1.8 từ file design (không thêm icon lib).
- Bulk publish: `Promise.all` lặp `usePublishProduct` per id (42 records max —
  đủ; KHÔNG endpoint bulk mới, YAGNI).
- Login page (`AdminLoginPage`) không có trong design — reskin tối thiểu theo
  cùng token cho đồng bộ (nền kem, nút copper), không phá layout.
- Tiếng Việt giữ nguyên dấu.

## 6. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Reskin làm vỡ hành vi đã verify (guard, dialog, invalidate) | Đổi style/markup, KHÔNG đổi logic hooks/handlers; phase verify cuối chạy lại đủ 8 smoke + DOM flows |
| Token admin đè token public | Prefix `--color-admin-*` riêng |
| File design 61KB inline style — dịch tay sang Tailwind dễ lệch | Đọc file theo TỪNG VIEW khi làm màn đó (grep goToX làm mốc), so screenshot design vs implement bằng agent-browser |
| Stores/Banners/Settings đổi layout — không chỉ đổi màu | Tính đủ effort; card grid stores + flat list banners viết mới phần render, giữ nguyên hooks |
| Sticky save bar che nội dung cuối form | padding-bottom cho form container |

## 7. Ngoài scope

- Dashboard + endpoint aggregate (quyết định #1).
- Đổi data layer, API, schema — không đụng.
- Reskin public site — không đụng.
- Icon library mới — không thêm.

## 8. Bước tiếp theo

`/ck:plan` với report này. Đề xuất phase: tokens+shell (sidebar mới, bỏ topbar)
→ primitives restyle (Switch/Table/FormField/Toast/Dialog/ImageField) →
list pages (products+bulk-select, categories, blog) → layout-mới pages
(stores grid, banners flat, settings 2-col) → forms (product, blog, sticky bar)
→ verify Docker (8 smoke regression + DOM so design).
