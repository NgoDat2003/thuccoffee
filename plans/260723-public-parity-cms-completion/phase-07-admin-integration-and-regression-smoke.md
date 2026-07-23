---
phase: 7
title: "Admin integration and regression smoke"
status: done
priority: P1
effort: "5h"
dependencies: [3, 4, 5, 6]
---

# Phase 7: Admin integration and regression smoke

## Overview

Khép kín vòng admin → DB → public cho mọi resource mới/mở rộng từ phase 2–6, và nâng lưới smoke/test hiện có để phủ chúng. Đây là phase "nối dây": không thêm nghiệp vụ mới, chỉ đảm bảo mọi mutation admin phản ánh đúng ra public và có regression test chặn tái phát.

## Requirements

- Functional: admin sửa product option/sticker/featured, static page, FAQ, gallery, banner schedule, store map, blog priority — public phản ánh đúng sau reload/invalidate; submissions (contact/newsletter) xem được trong admin nếu đã làm inbox, hoặc ít nhất query được qua DB có docs.
- Non-functional: smoke chạy được trên stack Compose local với `ADMIN_EMAIL`/`ADMIN_PASSWORD` như 8 suite hiện có; không phá byte-identity gate 267 bài blog.

## Architecture

Mở rộng lưới regression hiện có thay vì tạo hệ thống mới:
- 8 suite `server/scripts/smoke-*.ts` hiện tại giữ nguyên contract; thêm suite mới cho search/submissions, static pages/FAQ/gallery, options/stickers.
- `npm run test:admin-ui` (vitest) thêm test cho form/section admin mới (options, stickers, pages, gallery, banner schedule).
- `npm run test:admin-e2e` (Playwright) thêm flow admin-sửa → public-thấy cho ít nhất 1 resource mỗi nhóm.
- Query invalidation: mọi admin mutation mới phải invalidate đúng `queryKeys` của service public tương ứng.

## Related Code Files

- Create: `server/scripts/smoke-search-submissions.ts`, `server/scripts/smoke-pages-gallery.ts`, `server/scripts/smoke-options-stickers.ts` (tên khớp pattern `smoke-*.ts` hiện có).
- Modify: `server/package.json` (script `smoke:*` mới).
- Modify: test admin-ui hiện có + test mới cho form/section mới.
- Modify: Playwright e2e specs cho flow admin → public.
- Modify: `README.md` (bảng smoke suite), `docs/local-environment-and-ci.md` nếu CI cần chạy thêm.

## Implementation Steps

1. Rà lại toàn bộ mutation admin thêm ở phase 2–6, liệt kê cặp (mutation, public endpoint bị ảnh hưởng, queryKey cần invalidate); sửa chỗ thiếu invalidate.
2. Viết smoke search/submissions: search product/blog trả kết quả, contact tạo record, newsletter idempotent với duplicate email.
3. Viết smoke pages/gallery: admin update static page/FAQ/gallery → GET public trả nội dung mới.
4. Viết smoke options/stickers: admin gắn option/sticker → public product detail trả `options[]`/`stickers[]` đúng.
5. Bổ sung smoke banner schedule (expired/future ẩn khỏi public) và blog priority ordering vào suite banners/blog hiện có nếu hợp hơn là tạo suite mới.
6. Thêm vitest cho form admin mới; thêm Playwright e2e tối thiểu 1 flow/nhóm resource.
7. Cập nhật README bảng smoke và script; kiểm tra CI vẫn xanh với suite mới (suite admin cần env, giữ pattern hiện tại: chạy local/manual nếu CI không có stack).
8. Chạy toàn bộ: FE lint/build, server lint/build, 8+3 smoke suite, admin-ui vitest, admin-e2e trên Compose.

## Success Criteria

- [x] Mọi admin mutation mới có smoke hoặc e2e assert tác động public tương ứng.
- [x] Smoke suite mới chạy sạch trên stack Compose local; suite cũ không regress (kể cả byte-identity 267 bài).
- [x] `npm run test:admin-ui` và `npm run test:admin-e2e` xanh.
- [x] README/docs liệt kê đủ suite mới và cách chạy.
- [x] FE lint/build sạch; server lint/build sạch.

## Risk Assessment

Risk: smoke mới ghi dữ liệu làm bẩn DB dev. Mitigation: theo pattern suite hiện có — tạo record test có prefix/slug riêng và cleanup cuối suite.
Risk: e2e flaky trên Compose. Mitigation: giữ e2e tối thiểu, assert qua API trước rồi mới assert UI.
