---
phase: 1
title: "Seed banners và settings"
status: in-progress
priority: P1
effort: "3h"
dependencies: []
---

# Phase 1: Seed banners và settings

<!-- Updated: Validation Session 1 — bỏ static_pages (Phase 4 hoãn). Chỉ seed banner + settings. -->

## Overview

Mở rộng `seed.ts` đổ 2 nhóm data hiện đang trống: 3 banners (FE hardcode), ~11
site_settings public keys. Idempotent — rerun không nhân đôi. Nền cho Phase 3
(site-settings API). **static_pages KHÔNG seed vòng này** (Phase 4 hoãn).

## Requirements

- Functional: sau seed, `banners`=3 (2 slider + 1 promotion), `site_settings`=11
  public keys.
- Non-functional: idempotent (rerun 2 lần không duplicate); giữ nguyên counts cũ
  (10 cat, 42 prod, 267 blog, 7 store, 35 media, 6 option); không seed users/
  stickers/product links/orders/static_pages.

## Architecture

Nối `seed.ts` transaction hiện có. 3 nhóm, mỗi nhóm 1 chiến lược idempotent theo
unique key có/không:

- **banners** (report §7.1): bảng KHÔNG có unique business key. → trong tx,
  `delete` seed-owned banners theo `type in (slider,promotion)` rồi `insert` 3
  rows. (Cùng pattern `mediaAttachments` delete+recreate đã có trong seed.ts.)
  Không `onConflictDoUpdate` giả. Data từ report §7.1 (2 slider filename, 1
  promotion + link `/chuong-trinh-thanh-vien`). KHÔNG seed `right`.
- **site_settings** (report §7.2): PK là `key` → `onConflictDoUpdate(target=key)`.
  11 allow-list public keys (site_title, brand_heading, tagline, logo_storage_key,
  hotline, contact_email, office_address, facebook_url, instagram_url,
  youtube_url='', footer_copyright). KHÔNG seed secret/SMTP/admin.

**static_pages KHÔNG seed vòng này** — Phase 4 hoãn (content HTML vs JSX layout
chưa quyết).

## Related Code Files

- Modify: `server/src/db/seed.ts` (thêm 2 nhóm seed vào transaction)
- Read for source: `src/components/home/BannerSlider.tsx`+`PromoBanner.tsx`
  (banner filename)

## Implementation Steps

1. Banners: trong tx, `tx.delete(banners)` theo type seed-owned, `tx.insert` 3
   rows theo bảng report §7.1.
2. Site settings: `tx.insert(siteSettings).onConflictDoUpdate(target=key)` cho 11
   key report §7.2.
3. Chạy `npm run db:seed` (compose postgres up) → verify counts.
4. Chạy seed lần 2 → verify không duplicate.
5. build+lint sạch.

## Success Criteria

- [ ] Sau seed: banners=3, site_settings=11.
- [ ] Counts cũ giữ nguyên (10/42/267/7/35/6).
- [ ] Rerun seed 2 lần: counts không đổi, không duplicate.
- [ ] Không có users/stickers/product_option_links/order/static_pages rows.
- [ ] `npm run build` + `npm run lint` sạch.

## Risk Assessment

- **Banner không unique key → rerun duplicate.** Mitigation: delete+recreate
  seed-owned theo type (report §7.1). KHÔNG onConflictDoUpdate giả.
- **Seed đè data thật khác:** chỉ đụng 2 bảng đang trống + không chạm bảng có data.
