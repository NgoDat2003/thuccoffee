---
title: "Admin Espresso reskin — 8 màn theo design handoff"
description: "Reskin toàn bộ /admin/* theo thiết kế Espresso (sidebar tối, canvas kem, accent đồng, hairline). Presentation-only — data layer bất biến. Bỏ Dashboard."
status: completed
priority: P1
branch: "feat/admin-espresso-reskin"
tags: [admin, reskin, design, espresso, ui]
blockedBy: []
blocks: []
created: "2026-07-22T15:46:08.051Z"
createdBy: "ck:plan"
source: skill
---

# Admin Espresso reskin — 8 màn theo design handoff

## Overview

Reskin toàn bộ admin theo bản thiết kế "Espresso" (nguồn:
`plans/reports/260722-admin-espresso-reskin-brainstorm.md`). **NGUỒN CHÂN LÝ
markup/spacing/màu là file `./design-reference-espresso.dc.html`** trong thư
mục plan này (61KB, 9 view, inline style) — mỗi phase implement màn nào PHẢI
đọc đúng view đó trong file trước khi viết code, KHÔNG tự chế theo README tóm
tắt. Presentation-only: hooks/services/API/invalidation giữ nguyên tuyệt đối
(mọi luồng đã verify ở plan admin trước — 8 smoke suite là lưới regression).

## Quyết định đã chốt (từ brainstorm — không bàn lại)

| Chủ đề | Chốt |
|---|---|
| Dashboard | BỎ — `/admin` giữ redirect products; sidebar KHÔNG có mục "Tổng quan"; view Dashboard trong file design bỏ qua |
| Nhánh | `feat/admin-espresso-reskin` rẽ từ `feat/admin-shell-upload` |
| Bulk-select | LÀM — bar tối hiện khi ≥1 row check; Hiển thị/Ẩn hàng loạt = `Promise.all` lặp PATCH publish sẵn có, KHÔNG endpoint mới |
| Sticky save bar | LÀM — thuần CSS, form/drawer container thêm padding-bottom |
| **Drawer form** | Product/store/banner form chuyển sang DRAWER trượt phải ~560px mở tại list (route `/new`, `/:id` của 3 resource bỏ); BLOG giữ trang riêng. Drawer state local, không URL sync |
| **Pagination client** | Products/stores/banners phân trang client trong AdminTable page size 10 (API giữ nguyên trả hết); blog giữ server pagination |
| Token | Prefix `--color-admin-*` trong `@theme` main.css — tách khỏi token public |
| Fidelity | Pixel-for-pixel; sample data trong prototype thay bằng hooks thật |
| Icons | Inline SVG copy từ file design (stroke 1.8, 17px) — không thêm icon lib |
| Login page | Không có trong design — reskin tối thiểu cùng token (nền kem, nút copper) |

## Đọc file design theo view

File dùng `sc-if value="{{ isX }}"` phân view. Mốc grep để nhảy đúng đoạn:
`isDashboard` (BỎ QUA) → `isProducts` → `isCategories` → `isBlog` → `isStores`
→ `isBanners` → `isSiteSettings` → `isProductForm` → `isBlogForm`. Sidebar +
shell nằm đầu file (dòng ~20-86).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Tokens + shell sidebar tối](./phase-01-tokens-shell-sidebar-toi.md) | Completed |
| 2 | [Primitives restyle](./phase-02-primitives-restyle.md) | Completed |
| 3 | [List pages: products bulk-select + categories + blog](./phase-03-list-pages-products-bulk-select-categories-blog.md) | Completed |
| 4 | [Layout-mới pages: stores grid + banners flat + settings 2 cột](./phase-04-layout-moi-pages-stores-grid-banners-flat-settings-2-cot.md) | Completed |
| 5 | [Blog form page + sticky save bar](./phase-05-forms-product-blog-sticky-save-bar.md) | Completed |
| 6 | [★ Verify Docker + so design](./phase-06-verify-docker-so-design.md) | Completed |

## Ràng buộc xuyên suốt (mọi phase)

- KHÔNG đổi: props/behavior của hooks, handlers, query keys, invalidation,
  guard, dialog logic, routes path. Chỉ đổi markup + class + token.
- KHÔNG box-shadow card — hairline divider (`border-admin-*`).
- Chữ tiếng Việt giữ nguyên dấu; copy text lấy từ file design.
- Sau mỗi phase: FE lint/build sạch; spot-check dev màn vừa đổi.

## Rủi ro chung

| Rủi ro | Giảm thiểu |
|---|---|
| Reskin vỡ hành vi đã verify | Không đụng logic; phase 6 chạy lại đủ 8 smoke + DOM flows |
| Dịch inline style → Tailwind lệch pixel | Đọc file design từng view; giá trị lẻ (34px, 232px, 13px…) dùng arbitrary value `[...]` thay vì ép vào scale gần nhất |
| Token admin đè public | Prefix riêng `--color-admin-*`; grep xác nhận không trùng tên token cũ |
| Sticky bar che nội dung | padding-bottom form container ≥ chiều cao bar |

## Dependencies

- **BlockedBy:** plan `260722-admin-shell-upload` (completed — code nền đã có
  trên nhánh cha).
- **Blocks:** không.
