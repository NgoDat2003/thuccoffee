---
title: "Public Read API Completion"
description: "Hoàn tất public read API còn thiếu: store gallery trong detail, seed banners+settings, GET /api/site-settings. (pages API hoãn.) Không đổi schema, không admin/auth."
status: in-progress
priority: P1
branch: "feat/backend"
tags: [backend, api, read, seed]
blockedBy: []
blocks: []
created: "2026-07-21T09:51:20.112Z"
createdBy: "ck:plan"
source: skill
---

# Public Read API Completion

## Tổng quan

Bổ sung phần public read API còn thiếu sau 8 GET, để FE có thể đọc DB không thiếu
data. Nguồn: `plans/reports/260721-1639-fe-db-read-api-alignment-report.md` (đã
verify data 100% bằng psql).

Sau plan: tổng **9 public content API** (8 hiện có + `/api/site-settings`); store
detail thêm gallery (contract change, không phải endpoint mới). **Không đổi
schema, không thêm bảng, không admin/auth.**

<!-- Updated: Validation Session 1 — hoãn Phase 4 (pages API). Lý do: static_pages
content = HTML string (report §7.3) phá layout JSX hiện có của Membership/Careers
(tiers/jobs render có styling). Quyết cùng lúc làm admin. -->

**Hoãn (validation session 1):** `GET /api/pages/:key` + seed static_pages — vì
Membership/Careers hiện là structured data render JSX có layout; chuyển sang HTML
string đánh đổi layout chưa rõ. Để quyết cùng lúc làm admin. Membership/Careers
giữ tĩnh vòng này.

## Phạm vi

**Trong:**
- Seed 2 nhóm data (idempotent): 3 banners, ~11 site_settings public keys.
- Store detail trả `gallery: string[]` (join media_attachments owner=store/role=gallery).
- Module `site-settings`: `GET /api/site-settings` (allow-list keys → camelCase).
- Smoke test mở rộng + cập nhật docs/counts.

**Ngoài (report §9):**
- Schema mới/bảng mới, admin CRUD, auth, cart/order, contact/newsletter persistence,
  search, homepage gallery API, generic media API, options/stickers API.
- FE async migration (bước riêng — báo cáo §10 lưu FE đọc raw array nhiều chỗ,
  không chỉ `index.ts`).
- MinIO URL (ảnh vẫn trả filename/storage_key).

## Quyết định đã chốt (report)

| Mục | Chọn |
|---|---|
| Store gallery | Contract của store detail, không endpoint /media riêng |
| site-settings/pages | Resource API riêng, KHÔNG aggregate /api/site-bootstrap |
| static_pages.content | Sanitized HTML text, không JSONB/bảng mới |
| Banner seed (không unique key) | Delete+recreate seed-owned rows theo type/filename (report §7.1) |
| Ảnh | filename/storage_key (chưa MinIO URL) |
| Page key sai | enum param → 400; key hợp lệ chưa seed → 404 |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Seed banners và settings](./phase-01-seed-banners-settings-va-static-pages.md) | Pending |
| 2 | [Store gallery trong detail contract](./phase-02-store-gallery-trong-detail-contract.md) | Pending |
| 3 | [Module site-settings](./phase-03-module-site-settings.md) | Pending |
| 4 | [Module pages](./phase-04-module-pages.md) | **HOÃN** (validation s1) |
| 5 | [Smoke test và cập nhật docs](./phase-05-smoke-test-va-cap-nhat-docs.md) | Pending |

## Dependencies

Nối tiếp `260721-1448-backend-read-api` (completed). Không có plan mở nào bị ảnh
hưởng. FE async migration là bước sau, phụ thuộc plan này.

**Ranh giới quan trọng (report §10):** câu "chỉ đổi ruột `src/data/index.ts`" là
KHÔNG đủ — nhiều component đọc thẳng array (`BlogCarousel`→blogPosts,
`StoreLocator`→stores, `BlogDetailPage`, `DesktopNav`→categories, Header/Footer/
MobileDrawer→settings hardcode). FE migration phải xử hết các consumer này +
loading/error/cache. Ghi để bước sau không đánh giá thiếu.

## Validation Log

### Session 1 — 2026-07-21

**Verification Results (Full tier)**
- Claims checked: ~15 | Verified: ~15 | Failed: 0
- Verified: `site_settings` PK=`key` → onConflictDoUpdate đúng; `static_pages`
  key UNIQUE + title/content/updated_at; **`banners` chỉ id PK + type CHECK,
  KHÔNG unique key khác** → delete+recreate đúng (report §7.1); banners fields
  đầy đủ (image/alt_text/link_url/sort_order/is_active); 3 banner filename report
  §7.1 có thật trong BannerSlider/PromoBanner; `pages.ts` có membership/careers/
  jobs; `stores.service` có listStores+getStoreBySlug; seed.ts CHƯA import
  banners/settings/pages (Phase 1 phải thêm).

**Quyết định từ interview**
- **HOÃN Phase 4 (pages API) + seed static_pages.** Lý do: Membership/Careers
  hiện là structured data (`tiers[]`, `jobs[]`) render bằng JSX có layout
  (grid, tier styling, ảnh QR). Report §6.4/§7.3 chọn `content`=HTML string →
  FE phải `dangerouslySetInnerHTML` → **mất layout hiện tại**. Đánh đổi này chưa
  rõ, quyết cùng lúc làm admin (khi biết admin sửa page kiểu gì). Membership/
  Careers giữ tĩnh vòng này.
- Scope còn **4 phase active**: seed banner+settings, gallery, site-settings API,
  smoke+docs. Endpoint tổng: 9 (không phải 10).

### Whole-Plan Consistency Sweep
- Phase 1: bỏ nhóm static_pages seed (chỉ banner+settings).
- Phase 4: đánh dấu HOÃN (không cook).
- Phase 5: smoke bỏ assert pages; docs endpoint 8→9.
- plan overview: 10→9 endpoint, bỏ pages khỏi "Trong".
