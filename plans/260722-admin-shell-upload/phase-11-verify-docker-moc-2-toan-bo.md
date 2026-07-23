---
phase: 11
title: ★ Mốc verify Docker 2 — toàn bộ
status: completed
priority: P1
effort: 4h
dependencies:
  - 8
  - 9
  - 10
---

# Phase 11: ★ Mốc verify Docker 2 — toàn bộ admin trên production path

## Overview

Cổng cuối trước merge `main`: toàn bộ admin (6 resource) + public site chạy
đúng qua Docker + nginx. Đây là điều kiện "chạy được đầu-cuối và verify" của
quy ước merge repo.

## Requirements

- Functional: 6 smoke script xanh cả 2 origin; DOM mỗi resource một luồng
  chính; public site không regression toàn diện.
- Non-functional: Docker build sạch; lint/build FE + server sạch.

## Architecture

1. **Build:** FE + server lint/build; `docker compose build backend frontend`;
   up healthy.
2. **Smoke tổng** — cả `:8080` lẫn `:3000`:
   `smoke:auth`, `smoke:upload`, `smoke:admin-products`, `smoke:admin-blog`,
   `smoke:admin-stores`, `smoke:admin-banners-settings` (+ `smoke:api`,
   `smoke:images` regression public).
3. **DOM (agent-browser) qua `:3000`** — mỗi resource một luồng:
   - Products: (đã verify mốc 1 — chỉ regression nhanh tạo+unpublish).
   - Blog: sửa 1 bài thật → preview → lưu → public render giữ format.
   - Stores: đổi thứ tự gallery → public detail đổi.
   - Banners: thêm banner slider → home carousel hiện.
   - Settings: đổi hotline → footer đổi.
   - Categories: đổi label → menu nav đổi.
4. **Public regression toàn diện:** `/`, `/menu`, product detail, blog index +
   detail, store list + detail, membership — DOM + ảnh + meta.
5. **Điều kiện bàn giao production (nhắc, ngoài scope):** seed lifecycle phải
   tách TRƯỚC go-live (chạy `db:seed` sau khi admin sửa content = mất dữ liệu
   admin). Ghi vào README/docs cảnh báo nếu chưa làm.

## Related Code Files

- Read/verify: toàn bộ. Không sửa code trong phase này (lỗi → quay lại phase
  tương ứng); được phép sửa docs/README (cập nhật trạng thái + cảnh báo seed).

## Implementation Steps

1. Lint/build ×2; docker build; up healthy; create-admin nếu cần.
2. Chạy 8 smoke ×2 origin (script tuần tự, dừng khi đỏ).
3. DOM flow 6 resource.
4. Public regression sweep.
5. Cập nhật docs: `backend-architecture.md` (bước 5 CRUD → done),
   `deployment.md` (post-deploy checklist thêm admin CRUD), README (admin
   section + cảnh báo seed lifecycle).

## Success Criteria

- [ ] 8 smoke xanh cả 2 origin.
- [ ] DOM 6 resource: mutation phản ánh public không F5.
- [ ] Public regression sweep xanh (DOM + ảnh + meta).
- [ ] Docs cập nhật; cảnh báo seed lifecycle ghi rõ.
- [ ] FE + server lint/build + Docker build sạch.

## Risk Assessment

- **Rủi ro:** smoke để rác record test trong DB volume — mọi smoke đã yêu cầu
  cleanup; verify cuối bằng đếm record trước/sau chạy smoke.
- **Rủi ro:** blog bài thật bị sửa trong DOM test — chọn bài, sửa, LƯU LẠI
  NGUYÊN TRẠNG (sửa → revert) hoặc dùng bài test tạo mới rồi cleanup.
