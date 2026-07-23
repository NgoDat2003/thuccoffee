---
phase: 6
title: "★ Verify Docker + so design"
status: completed
priority: P1
effort: "3h"
dependencies: [3, 4, 5]
---

# Phase 6: ★ Verify — regression đầy đủ + so màn với design

## Overview

Cổng cuối: chứng minh reskin KHÔNG vỡ hành vi nào đã verify (8 smoke suite là
lưới) và các màn khớp design. Reskin là presentation — smoke phải xanh y hệt
trước khi reskin, không có ngoại lệ.

## Requirements

- Functional: 8 smoke ×2 origin xanh (auth, upload, admin-products,
  admin-blog, admin-stores, admin-banners-settings, api, images); DOM flows
  cũ chạy đúng trên skin mới; bulk-select (hành vi mới duy nhất) hoạt động.
- Non-functional: Docker build sạch; public site không đổi 1 pixel (token
  admin không rò).

## Architecture

1. **Build:** FE + server lint/build; `docker compose build backend frontend`;
   up healthy.
2. **Smoke regression:** đủ 8 suite ×2 origin — pass y hệt baseline
   (46+ checks). Smoke không đụng UI nên đỏ = reskin lỡ đụng logic.
3. **DOM flows trên skin mới (agent-browser qua `:3000`):**
   - Guard redirect, login (trang login skin mới), shell sidebar tối, nav
     active, logout từ đáy sidebar.
   - Products: tạo + sửa qua DRAWER (validate lỗi field, upload, slug lock,
     lưu → drawer đóng + list cập nhật); bulk chọn 2-3 SP → Ẩn (dialog) →
     public mất → Hiển thị lại; pagination client 42 SP → 5 trang, filter đổi
     → về trang 1; URL cũ `/admin/products/1` → AdminNotFound.
   - Blog: sửa bài thật (TRANG riêng) → preview sanitized → guard dirty →
     hủy; toggle publish trong form phản ánh list.
   - Stores: card grid + drawer (kèm gallery reorder TRONG drawer → public
     đổi thứ tự → restore).
   - Banners: flat list + drawer + toggle → public đổi; xóa qua dialog.
   - Settings: đổi hotline + upload logo → public footer đổi → restore.
   - Drawer chung: ESC/backdrop đóng, focus vào drawer khi mở.
4. **So design:** screenshot từng màn (8 màn) bằng agent-browser, mở file
   `design-reference-espresso.dc.html` local trong browser chụp cùng view,
   so cạnh nhau — lệch lớn (layout/màu/typo sai hệ) thì quay lại phase tương
   ứng; lệch nhỏ pixel chấp nhận ghi nhận.
5. **Public regression sweep:** `/`, `/menu`, blog, stores — DOM + ảnh +
   MÀU (public không được ăn token admin).

## Related Code Files

- Read/verify toàn bộ; không sửa code (lỗi → quay lại phase); được sửa docs.

## Implementation Steps

1. Lint/build ×2; docker build; up; create-admin nếu volume mới.
2. 8 smoke ×2 origin.
3. DOM flows theo Architecture 3.
4. Screenshot so design 8 màn.
5. Public sweep.
6. Docs: ghi chú reskin trong backend-architecture/README nếu đáng.

## Success Criteria

- [ ] 8 smoke ×2 origin xanh — regression 0.
- [ ] DOM flows cũ + bulk-select mới đúng trên skin mới.
- [ ] 8 màn so design đạt (lệch chỉ ở mức pixel nhỏ, không sai hệ).
- [ ] Public site nguyên vẹn (DOM + ảnh + màu).
- [ ] Docker build + lint/build sạch.

## Risk Assessment

- **Rủi ro:** so design bằng mắt máy không bắt hết lệch — screenshot cả hai
  cùng viewport 1440px, so từng vùng (sidebar, header, table, form).
- **Rủi ro:** DB volume có dữ liệu test cũ — smoke tự cleanup; DOM test
  restore như các vòng trước.
