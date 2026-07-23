---
phase: 8
title: "Full parity verification"
status: done
priority: P1
effort: "6h"
dependencies: [7]
---

# Phase 8: Full parity verification

## Overview

Nghiệm thu cuối theo tiêu chí "100% public đang dùng" đã chốt ở phase 1. Replay manifest URL nguồn trên local, xác nhận không còn demo/no-op trong scope, kiểm tra ordering/pagination/placement khớp rule, và chốt báo cáo parity cuối. Phase này chỉ verify + sửa lỗi phát hiện, không thêm feature mới.

## Requirements

- Functional: mọi URL nguồn hợp lệ có route local hoạt động hoặc quyết định thay thế được ghi rõ; client-side 404 trong scope = fail, không được tính pass vì HTTP 200 fallback SPA.
- Non-functional: không copy lỗi legacy (8 route HTTP 500, ảnh hỏng, HTTPS lỗi) — chúng được ghi nhận là chủ động không tái tạo, không tính thiếu parity.

## Architecture

Verification 4 lớp, tận dụng công cụ đã có:
1. **Route manifest replay**: script chạy qua ~400 URL manifest (392 URL 200 của nguồn), phân biệt HTTP status vs React render (detect màn 404 client-side qua marker DOM/title).
2. **Interaction check**: search, contact, newsletter, option picker, banner schedule — assert qua smoke suite phase 7 + spot-check browser.
3. **Ordering/pagination check**: home products, menu category, blog page 1 và page 54 (2 bài cuối), banner placement — assert bằng fixture.
4. **Visual/accessibility spot-check**: template đại diện mỗi nhóm trang ở desktop/tablet/mobile; không đo pixel-perfect toàn bộ 400 URL.

## Related Code Files

- Create: `server/scripts/verify-route-manifest.ts` (hoặc script FE tương đương) đọc manifest và replay trên local.
- Create: file manifest URL nguồn dạng data (từ inventory 400 URL trong audit) nếu chưa tồn tại trong repo.
- Modify: `plans/reports/260723-thuccoffee-full-functional-parity-audit.md` — thêm section kết quả nghiệm thu cuối.
- Modify: `docs/deviations-from-original.md` — chốt danh sách khác biệt có chủ ý còn lại.
- Modify: `README.md` — bỏ cảnh báo "admin sửa chưa hiện ra public" cho các nhóm đã nối xong.

## Implementation Steps

1. Dựng manifest URL từ inventory audit (392 URL 200; loại 8 route legacy 500 kèm ghi chú quyết định).
2. Viết script replay: với mỗi URL, kiểm tra HTTP status + detect client-side 404; xuất báo cáo pass/fail/excluded.
3. Chạy replay trên stack Compose; sửa mọi fail trong scope (route thiếu, redirect sai) — fail ngoài scope ghi vào deviations.
4. Kiểm tra interaction đầu-cuối: search hai loại theo URL nguồn, contact/newsletter tạo record, product option đổi giá, banner schedule ẩn đúng.
5. Kiểm tra ordering: home theo showOnHome/priority, blog page 1 + page 54 (2 bài), menu 8 category thật.
6. Kiểm tra vòng admin → public cho mỗi nhóm resource (dựa trên e2e phase 7, spot-check thủ công phần chưa tự động).
7. Spot-check visual/accessibility các template đại diện ở 3 breakpoint; sửa lỗi hiển thị nghiêm trọng.
8. Cập nhật report audit với ma trận kết quả cuối; cập nhật deviations + README; chạy toàn bộ lint/build/test/smoke lần cuối.

## Success Criteria

- [x] Replay manifest: 0 fail trong scope; mọi excluded có lý do ghi trong deviations.
- [x] Không còn demo/no-op cho interaction public trong scope (search, contact, newsletter, option, banner).
- [x] Blog 54 trang, page 54 có 2 bài; ordering home/menu/blog theo rule dữ liệu, không hardcode FE.
- [x] Mọi nhóm nội dung admin sửa được đều phản ánh ra public (verify từng nhóm).
- [x] Report audit có section nghiệm thu cuối; docs/deviations/README nhất quán trạng thái mới.
- [x] FE lint/build, server lint/build, toàn bộ smoke + vitest + e2e xanh.

## Risk Assessment

Risk: nguồn thay đổi nội dung giữa lúc audit và lúc verify → so sánh dữ liệu cụ thể (bài đầu blog) lệch. Mitigation: nghiệm thu theo rule (priority/sort/pagination), không theo snapshot nội dung nguồn tại một thời điểm.
Risk: replay 400 URL chậm/flaky trên máy local. Mitigation: script chạy tuần tự có retry nhẹ, cache kết quả, cho phép chạy lại phần fail.
