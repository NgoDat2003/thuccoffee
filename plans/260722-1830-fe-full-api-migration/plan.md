---
title: "Chuyển full FE tĩnh sang API (nhóm A)"
description: ""
status: in-progress
priority: P2
branch: "feat/fe-product-detail-api"
tags: []
blockedBy: []
blocks: []
created: "2026-07-22T04:09:04.300Z"
createdBy: "ck:plan"
source: skill
---

# Chuyển full FE tĩnh sang API (nhóm A)

## Overview

Chuyển **toàn bộ page/component có API tương ứng** (nhóm A) từ đọc `src/data` tĩnh
sang TanStack Query hook. Tái dùng pattern đã chốt ở ProductDetail (hook → skeleton →
error → render). Chia phase theo tài nguyên; check một thể ở Phase 6.

**Phản biện đã ghi:** "full toàn bộ" không khả thi trọn vẹn — 6 page đọc `pages.ts`
(About/Careers/Contact/Cookie/Delivery/Membership) **không có API** → giữ tĩnh (nhóm B,
ngoài phạm vi). "Full" = nhóm A.

Design đầy đủ: [brainstorm-summary.md](./brainstorm-summary.md).

**Ranh giới sống còn (verify — không phá):**
- `src/data/category-paths.ts` = ROUTING (slug khớp site gốc, CLAUDE.md cấm đổi) → GIỮ.
  Chỉ chuyển mảng `categories` (label) sang `useCategories()`.
- `src/data/pages.ts` (nhóm B) → GIỮ.

**Đã verify khi lập plan:**
- Blog detail API trả `content` (`blog.service.ts:67,78`) → bỏ được lazy `blog-content.ts`.
- Blog `perPage=5`, 267 bài → `meta.totalPages`=54, thay hardcode `BLOG_PAGE_COUNT`.
- `BlogPagination` hardcode 54 → đổi sang prop `totalPages`.
- 6 endpoint content: products/categories/banners/stores/blog/site-settings.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Checkpoint ProductDetail (không commit)](./phase-01-commit-productdetail.md) | Pending |
| 2 | [Menu và Category](./phase-02-menu-v-category.md) | Pending |
| 3 | [Store](./phase-03-store.md) | Pending |
| 4 | [Blog](./phase-04-blog.md) | Pending |
| 5 | [Home (products + banners)](./phase-05-home.md) | Pending |
| 6 | [Footer + fix seed site-settings](./phase-06-footer-site-settings.md) | Pending |
| 7 | [Dọn và verify full](./phase-07-d-n-v-verify-full.md) | Pending |

## Dependencies

<!-- Cross-plan dependencies -->

## Validation Log

### Session 1 — 2026-07-22 (Full tier, 6 phases)

**Verification Results**
- Claims checked: 7 | Verified: 5 | Failed: 1 | Corrected: 1
- ✅ `getFeaturedProducts` dùng `yeu-thich-nhat` — `index.ts:37`.
- ✅ Blog detail API trả `content` — `blog.service.ts:78`. → bỏ lazy blog-content.ts.
- ✅ `CategorySidebar`/`DesktopNav` import CẢ `categories` (label) + `categoryHref`
  (routing) → tách đúng ở Phase 2.
- ✅ `BlogPagination` hardcode `BLOG_PAGE_COUNT=54` → prop `totalPages`.
- ✅ 267 bài / perPage 5 = 54 trang.
- 🔴 **FAILED → CORRECTED (Phase 5 banner):** plan gốc giả định BannerSlider đọc banner
  tĩnh. Verify: BannerSlider + PromoBanner **hardcode tên file ảnh**, KHÔNG có
  `src/data/banners.ts`, không component nào đọc banner data. Nhưng `GET /api/banners`
  (DB thật) trả **3 banner khớp chính xác** ảnh hardcode (2 slider + 1 promotion, cùng
  tên file + link). Người dùng chốt nguyên tắc "DB có gì chuyển hết" → Phase 5 sửa:
  BannerSlider→`useBanners()` type slider, PromoBanner→type promotion. Không lệch giao
  diện gốc (data khớp).

**Decisions confirmed:**
1. Banner: **chuyển sang API** (DB verify khớp ảnh hardcode → không lệch gốc). Nguyên
   tắc người dùng: mọi thứ DB có → chuyển API.
2. Blog content: **bỏ lazy blog-content.ts**, dùng API `content`.
3. Date format: **UTC** (`getUTC*`) để khớp ngày lưu, không lệch múi giờ.

### Session 2 — rà toàn diện "DB có gì chuyển hết"

Người dùng: "cái nào DB đang lưu quản lý thì change all". Rà mọi FE hardcode ↔ DB:
| FE | DB endpoint | Quyết |
|---|---|---|
| Products/Blog/Stores/Categories | ✅ chạy tốt | Phase 2-5 |
| Banners (BannerSlider, PromoBanner) | ✅ khớp ảnh hardcode | Phase 5 |
| **Footer** (hotline/social/copyright) | ⚠️ site-settings CÓ field, nhưng **500** | **Phase 6 (mới)** |
| GalleryLightbox (8 ảnh brand) | ❌ không endpoint | **Giữ static** (verify: comment ghi "homepage-only, not tied to record"; grep 0 endpoint gallery home) |

**Bug phát hiện + chẩn đoán (verify query DB thật):** `/api/site-settings` trả **500** —
`getPublicSiteSettings` Zod-validate 11 key public; DB `site_settings` có **10/11**,
**thiếu `hotline`**. `seed.ts:35` CÓ hotline → DB seed từ bản cũ / chưa seed lại. Fix
nhiều khả năng chỉ chạy lại `db:seed`. → **Thêm Phase 6**: fix seed + chuyển Footer;
dời "Dọn+verify" thành Phase 7.

**GalleryLightbox chốt: GIỮ STATIC** — không có nguồn DB (đã verify). Không câu ngỏ nữa.

### Whole-Plan Consistency Sweep

Re-read plan.md + 7 phase. Phase 5 banner (hardcode→API) đồng bộ. Phase 4 date UTC.
Phase 6 mới (Footer + seed) dependencies [1], Phase 7 (dọn+verify) dependencies [6],
runtime verify thêm Footer. Bảng phases = 7. Không phase nào nói "giữ banner static"
hay "Footer ngoài phạm vi". **Zero unresolved contradictions.**
