---
title: 'Admin full — shell, upload, CRUD 6 resource (API + UI)'
description: >-
  Một plan full admin: shell + upload nền, rồi CRUD
  products/categories/blog/stores/banners/settings cả API lẫn UI, vertical
  slice, 2 mốc verify Docker.
status: completed
priority: P1
branch: feat/admin-shell-upload
tags:
  - admin
  - upload
  - minio
  - multer
  - crud
  - shell
  - tdd
blockedBy: []
blocks: []
created: '2026-07-22T13:03:22.787Z'
createdBy: 'ck:plan'
source: skill
---

# Admin full — shell, upload, CRUD 6 resource

## Overview

Plan full admin MVP (nguồn: `plans/reports/260722-admin-crud-ui-brainstorm.md`,
đã cập nhật quyết định "1 plan full, 2 mốc verify"). Bốn khối vertical slice:
nền (shell+upload) → products+categories (pattern chuẩn) → blog → stores/
banners/settings. Mỗi resource đi hết API admin + UI + invalidate rồi mới sang
resource sau. KHÔNG migration schema — mọi field cần đã có sẵn (verified
schema.ts). Delete = unpublish, slug khóa, một admin — kế thừa, không bàn lại.

## Bối cảnh đã verify (scout)

- Auth trên `main` (`1fe1b3b`): `requireAuth` guard `/api/admin/*`, `useMe`/
  `useLogout`, `/admin/login`. Admin routes hiện chỉ `GET /me` placeholder.
- `minioClient` + `fPutObject` pattern sẵn (seed-images.ts:66); env đủ.
- Schema đủ field cho cả 6 resource (schema.ts): products (M:N categories),
  blogPosts (content HTML, publishedAt date), stores + mediaAttachments
  (ownerType check, unique owner+storage+role), banners (type check 3 giá trị),
  siteSettings (key PK), categories (key/label/sortOrder).
- `getImageUrl()` nối `VITE_MINIO_BASE_URL + objectKey` — preview chỉ cần key.
- nginx.conf CHƯA có `client_max_body_size` (verified) — phải thêm ở mốc verify 1.
- Module pattern BE; service/hook pattern FE; smoke pattern tsx.

## Quyết định đã chốt (từ brainstorm — không bàn lại)

| Chủ đề | Chốt |
|---|---|
| UI | Tailwind tự xây, không component library; dialog dùng `<dialog>` native |
| Upload | Multipart qua backend; validate 3 lớp; key `kind/uuid.ext` server sinh |
| Blog editor | Textarea HTML + preview; server sanitize allow-list (trích từ data thật) |
| `/admin` | Redirect `/admin/products` |
| List API | Blog server-side pagination+search; còn lại trả hết, filter client |
| Delete/slug/role | Unpublish thay delete; slug khóa sau tạo; một admin |
| Invalidate | Sau mutation: cả admin keys lẫn public keys liên quan |
| Cắt plan | 1 plan full, 1 nhánh, 2 mốc verify Docker (sau khối 2 và cuối) |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Test-first: smoke upload contract](./phase-01-test-first-smoke-upload-contract.md) | Completed |
| 2 | [Upload API backend multipart MinIO](./phase-02-upload-api-backend-multipart-minio.md) | Completed |
| 3 | [Admin shell FE + route guard + ImageField](./phase-03-admin-shell-fe-route-guard-imagefield.md) | Completed |
| 4 | [Admin API products + categories](./phase-04-admin-api-products-categories.md) | Completed |
| 5 | [UI products + categories](./phase-05-ui-products-categories.md) | Completed |
| 6 | [★ Mốc verify Docker 1](./phase-06-verify-docker-moc-1.md) | Completed |
| 7 | [Admin API blog + sanitize](./phase-07-admin-api-blog-sanitize.md) | Completed |
| 8 | [UI blog list + editor](./phase-08-ui-blog-list-editor.md) | Completed |
| 9 | [Stores + gallery (API + UI)](./phase-09-stores-gallery-api-ui.md) | Completed |
| 10 | [Banners + site settings (API + UI)](./phase-10-banners-site-settings-api-ui.md) | Completed |
| 11 | [★ Mốc verify Docker 2 — toàn bộ](./phase-11-verify-docker-moc-2-toan-bo.md) | Completed |

## Ranh giới chấp nhận

- **Orphan object chấp nhận:** upload xong nhưng form hủy → object nằm lại
  bucket. Vô hại, dọn là P2 — KHÔNG xử lý trong plan này.
- Rate limit: defer nhất quán plan auth. SVG ngoài allow-list có chủ đích.
- Concurrent update 409: defer (một admin). Audit log, soft delete, slug
  redirect: P2.
- DEFER nguyên khối: users/RBAC, media library, options/stickers, static
  pages, dashboard aggregate, orders.
- **Seed lifecycle** (seed ghi đè content admin sửa): bắt buộc trước go-live,
  NGOÀI plan này — nhắc lại ở phase 11 như điều kiện bàn giao production.

## Red Team Review

### Vòng 1 (khối nền, phase 1-3)
| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | High | Content-Type object đặt từ mimetype client gửi → client kiểm soát header serve | Accept — Phase 2 đặt từ extension đã validate |
| 2 | High | Multipart: `req.body` chỉ có SAU multer — Zod parse `kind` dễ đặt sai chỗ | Accept — Phase 2 ghi tường minh thứ tự |
| 3 | High | Orphan object khi upload xong nhưng flow hủy | Accept — ghi rõ chấp nhận, dọn là P2 |
| 4 | Medium | nginx thiếu `client_max_body_size` (verified) | Cover ở phase 6 bước 1 |

### Vòng 2 (khối CRUD, phase 4-11)
| # | Sev | Finding | Disposition |
|---|---|---|---|
| 5 | High | Sanitize sai chiều: chỉ sanitize lúc LƯU, bài cũ trong DB chưa qua sanitize — nếu render admin preview bằng `dangerouslySetInnerHTML` từ content thô, XSS stored từ data cào | Accept — Phase 8: preview render qua CÙNG sanitizer (client-side hoặc gọi API preview); Phase 7 chốt sanitize là hàm thuần dùng được cả hai nơi |
| 6 | High | Unpublish product/blog/store đang được public FE cache TanStack — user public thấy 404 khi click từ list stale | Accept — behavior đúng (content đã gỡ), nhưng Phase 5/8/9 phải invalidate đúng public keys để list tự cập nhật |
| 7 | Medium | `categories.key` là semantic key (routing FE `category-paths`) — cho sửa key sẽ vỡ URL public | Accept — Phase 4: category chỉ cho sửa `label` + `sortOrder`, KHÔNG cho sửa `key` (khớp report "MVP giới hạn") |
| 8 | Medium | `banners.type` check 3 giá trị trong DB — Zod enum phải khớp `('promotion','right','slider')` không bịa thêm | Accept — Phase 10 ghi enum đúng theo schema.ts:123 |
| 9 | Medium | Store gallery dùng uniqueIndex (owner,storage,role) — thêm trùng ảnh vào gallery sẽ nổ constraint 500 thay vì 4xx | Accept — Phase 9: transaction delete-reinsert idempotent + Zod refine chặn trùng key trước DB |
| 10 | Low | Site settings 11 key public + có thể có key nội bộ — admin PUT phải allow-list key, không cho tạo key mới tùy ý | Accept — Phase 10 allow-list cố định |

## Dependencies

- **BlockedBy:** không — auth foundation đã merge `main`.
- **Blocks:** không plan nào khác đang mở.
