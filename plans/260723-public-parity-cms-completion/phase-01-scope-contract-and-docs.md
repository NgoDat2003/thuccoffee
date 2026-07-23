---
phase: 1
title: "Scope contract and docs"
status: done
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1: Scope contract and docs

## Overview

Chốt lại tiêu chuẩn "100%" đã duyệt và sửa tài liệu đang lệch trạng thái. Phase này không đổi runtime, chỉ tạo contract để các phase sau không trượt sang user/cart/order hoặc legacy admin parity.

## Requirements

- Functional: report audit có phần quyết định cuối; README/CLAUDE/deviations/database docs không còn nói FE public vẫn static nếu code hiện tại đã đọc API.
- Non-functional: không ghi credential nguồn, không copy secret legacy, không đổi plan/history cũ ngoài phần liên quan.

## Architecture

Docs là contract cho cook:
- Public parity = route + dữ liệu + interaction public đang dùng.
- Admin parity = đủ CRUD cho dữ liệu public, không cần đủ 20 module legacy.
- Delete policy: unpublish/archive cho resource public; hard delete chỉ cho banner/gallery/submission an toàn.

## Related Code Files

- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `docs/deviations-from-original.md`
- Modify: `docs/database-design.md`
- Modify: `plans/reports/260723-thuccoffee-full-functional-parity-audit.md`

## Implementation Steps

1. Cập nhật report audit section câu hỏi chưa chốt thành "Quyết định scope".
2. Cập nhật docs cũ còn ghi public page đang đọc `src/data/*.ts` cho 6 nhóm đã API hóa.
3. Ghi rõ account admin production tạo qua `server/npm run create-admin`, không seed default password.
4. Ghi rõ seed lifecycle: bootstrap-once vs dev-reset là nợ kỹ thuật bắt buộc trước hosting thật.
5. Chạy `git diff --check`.

## Success Criteria

- [x] Không còn câu hỏi scope mở về public user/cart/order/RBAC trong report.
- [x] README/CLAUDE/deviations/backend docs thống nhất trạng thái hiện tại.
- [x] Không có credential hoặc password nguồn trong docs.
- [x] `git diff --check` sạch.

## Risk Assessment

Risk: sửa docs quá rộng làm nhiễu history. Mitigation: chỉ sửa dòng sai/lệch và thêm quyết định scope.
