---
phase: 1
title: "Tokens + shell sidebar tối"
status: completed
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1: Tokens + shell — sidebar tối, bỏ topbar

## Overview

Nền của toàn bộ reskin: 18 token `--color-admin-*` vào `@theme`, AdminLayout
đổi sang sidebar tối cố định 232px + canvas kem, BỎ AdminTopbar (user card +
logout chuyển xuống đáy sidebar), title chuyển vào từng page (các page đã có
sẵn `<h1>` riêng — phase sau restyle).

## Nguồn design

`./design-reference-espresso.dc.html` dòng ~20-86 (aside + khung main).
Spec chính: aside `width:232px, bg #1c150f, padding 28px 14px, sticky top-0
h-screen`; brand 34px circle copper chữ "T" + eyebrow 10px copper + "Quản trị"
16px/700 kem; 2 nhóm nav có group label 10.5px/700 uppercase `#6b5f4f`
("Nội dung": Sản phẩm, Danh mục, Bài viết — KHÔNG có Tổng quan; "Vận hành":
Cửa hàng, Banner, Cài đặt website); item `padding 10px, radius 9px, gap 11px,
14px/600`, active `bg #2b2219 color #c8793a`, inactive `transparent #b7ac98`;
icon SVG 17px stroke 1.8 COPY NGUYÊN VĂN từ file (6 icon: cup, layers,
document, pin, image, sliders — bỏ icon grid của Dashboard); đáy: divider
`#2b2219`, avatar 30px `bg #2b2219 color copper` chữ cái đầu email, email
12.5px/600 kem truncate, role 11.5px `#6b5f4f`, nút logout 26px icon-only
border `#2b2219`.

Main: `flex-1 min-w-0`, content `padding 44px 48px 70px, max-width 1180px`.

## Requirements

- Functional: guard + logout + NavLink active + mobile drawer giữ nguyên hành
  vi; role hiển thị từ `useMe` data (map 'admin' → "Quản trị viên").
- Non-functional: token prefix không đụng token public; FE lint/build sạch.

## Related Code Files

- Modify: `src/styles/main.css` (18 token `--color-admin-*` vào `@theme`),
  `src/components/admin/AdminLayout.tsx` (canvas kem, bỏ Topbar, padding main
  mới), `src/components/admin/AdminSidebar.tsx` (viết lại theo spec — nav
  groups + icons + user card đáy)
- Delete: `src/components/admin/AdminTopbar.tsx` (logout/user chuyển vào
  sidebar; grep import trước khi xóa)
- Read for context: file design dòng 20-86, `src/services/auth.service.ts`
  (useMe/useLogout)

## Implementation Steps

1. Thêm 18 token vào `@theme` (giá trị trong brainstorm §4 / README handoff —
   đối chiếu lại với hex trong file design nếu lệch thì file design thắng).
2. Viết lại AdminSidebar: 2 nhóm nav (không Tổng quan), icon SVG copy từ file,
   NavLink active style, user card + logout đáy. Mobile: giữ cơ chế drawer
   hiện có, chỉ đổi skin.
3. AdminLayout: bỏ Topbar import/render, canvas `bg-admin-bg`, main padding
   theo spec.
4. Xóa AdminTopbar.tsx.
5. Login page: reskin tối thiểu (nền kem, nút copper) — cùng lượt vì cùng token.
6. FE lint/build; dev spot-check: login → shell mới, nav active đúng, logout,
   drawer mobile.

## Success Criteria

- [ ] Sidebar tối 232px đúng spec, 6 mục 2 nhóm, KHÔNG có Tổng quan.
- [ ] User email + role + logout ở đáy sidebar hoạt động; AdminTopbar đã xóa
      sạch (grep 0 reference).
- [ ] Guard/drawer/NavLink behavior không đổi.
- [ ] Token `--color-admin-*` không trùng/đè token cũ.
- [ ] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** trang public vô tình ăn token admin — prefix riêng + grep
  `admin-` chỉ xuất hiện trong components/pages admin.
- **Rủi ro:** xóa Topbar sót import — tsc bắt.
