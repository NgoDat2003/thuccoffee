---
phase: 2
title: "Primitives restyle"
status: completed
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Primitives restyle — Switch/Table/FormField/Dialog/Toast/ImageField

## Overview

Restyle bộ primitive dùng chung theo idiom Espresso. Props/behavior GIỮ NGUYÊN
— chỉ đổi class/markup trang trí. Đây là phase quyết định look các phase
3-5 kế thừa.

## Nguồn design

Grep trong `./design-reference-espresso.dc.html`:
- **PublishSwitch** — mọi chỗ có toggle: track `38×22` (thay 48×28 cũ), knob
  trượt `3px → 19px`, fill on = success `#4f7a5a` (hoặc copper — đối chiếu
  từng chỗ trong file), off = `#d8cdb8`.
- **AdminTable** — header KHÔNG fill nền: label 11px/700 uppercase ls .06em
  `#a8a08f`, chỉ 1px bottom rule `#e4dbcb`; row divider `#eee6d8`; bỏ mọi
  bg-stone-50; giữ sort + pagination logic, pagination restyle plain-text
  "← Trước / Trang X / Y / Sau →" (grep pagination trong view isBlog).
- **FormField** — label 12-13px/600; input mặc định chuyển sang kiểu
  UNDERLINE: không border-radius box, chỉ `border-bottom 1.5px #d8cdb8`,
  focus đổi màu bottom sang copper; textarea giữ box với border `#d8cdb8`
  radius 10-14px bg `#fffdf9`. Thêm prop `variant?: 'underline' | 'box'`
  (mặc định underline) để settings/textarea chọn box.
- **ConfirmDialog** — giữ `<dialog>` native; skin: nền kem `#f7f2ea` hoặc
  trắng ấm, nút confirm pill copper/đỏ tùy ngữ cảnh, radius theo file.
- **Toast** — pill tối `#241c15` chữ kem, hoặc theo file nếu có mẫu; giữ
  timeout/context.
- **ImageField** — dropzone dashed: `border 1.5px dashed #d8cdb8, radius 14px,
  bg #fffdf9`, icon upload stroke SVG, copy kéo-thả từ file design (view
  isProductForm có mẫu đầy đủ); giữ nguyên upload flow + preview + error.
- **StatusBadge** — dot 7px + label text thường (không pill nền) theo pattern
  "status dot+label" trong file.
- **AdminDrawer (MỚI)** — primitive drawer trượt phải cho form ngắn (quyết
  định vòng góp ý): `<dialog>` NATIVE như ConfirmDialog (focus trap + ESC +
  backdrop sẵn), style panel dính mép phải `width ~560px, height 100vh,
  bg #f7f2ea`, animation trượt (transform translate), header (title + nút X),
  body scroll, chân chứa sticky bar Hủy/Lưu. Props:
  `{ open, title, onClose, children }`. Đóng khi backdrop click/ESC — nếu
  form bên trong dirty thì consumer tự chặn (product/store/banner form không
  có unsaved guard hiện tại — GIỮ nguyên như vậy, không thêm guard mới).
- **AdminTable pagination client (MỞ RỘNG)** — prop `pagination` hiện nhận
  `{page,totalPages,onPageChange}` (server mode, blog dùng). Thêm mode client:
  prop `pageSize?: number` — có pageSize thì table tự slice rows sau sort +
  render pagination nội bộ; hai mode loại trừ nhau (có `pagination` prop thì
  bỏ qua `pageSize`).

## Requirements

- Functional: mọi props/callback/behavior giữ nguyên chữ ký; consumer hiện có
  không phải sửa gì ngoài phase 3-5 chủ động đổi.
- Non-functional: FE lint/build sạch sau phase (consumer cũ vẫn compile với
  primitive mới).

## Related Code Files

- Modify: `src/components/admin/ui/{PublishSwitch,AdminTable,FormField,ConfirmDialog,Toast,StatusBadge}.tsx`,
  `src/components/admin/ImageField.tsx`
- Read for context: file design (grep theo view), consumer hiện tại để chắc
  không vỡ chữ ký

## Implementation Steps

1. PublishSwitch 38×22 + màu mới.
2. AdminTable header/row/pagination style mới.
3. FormField variant underline/box.
4. ConfirmDialog + Toast skin.
5. ImageField dropzone dashed (đọc mẫu trong isProductForm).
6. StatusBadge dot+label.
7. FE lint/build; dev spot-check các màn hiện có (style lai cũ-mới chấp nhận
   được tạm — phase 3-5 hoàn thiện từng màn).

## Success Criteria

- [ ] 7 primitive đổi skin đúng spec, 0 thay đổi chữ ký props.
- [ ] Toggle/dialog/toast/upload hoạt động y hệt (click thử dev).
- [ ] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** FormField đổi mặc định sang underline làm form cũ xấu tạm thời
  trước khi phase 5 làm lại — chấp nhận (cùng nhánh, không merge giữa chừng).
