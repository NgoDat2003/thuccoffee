---
phase: 6
title: "Footer + fix seed site-settings"
status: in-progress
priority: P2
effort: "1-2h"
dependencies: [1]
---

# Phase 6: Footer + fix seed site-settings

## Overview

Fix bug `/api/site-settings` trả 500 (DB thiếu key `hotline`), rồi chuyển Footer/Header
đọc `useSiteSettings()` cho hotline/social/copyright thay vì hardcode. Đây là "DB có
gì chuyển hết" áp cho site-settings.

## Requirements

- Functional: `/api/site-settings` trả 200 với đủ 11 key; Footer hiện hotline/social/
  copyright từ API.
- Non-functional: build/lint sạch (cả server nếu sửa seed); Footer không đổi giao diện
  (data khớp hardcode hiện tại).

## Architecture

**Bug đã chẩn đoán (verify bằng query DB thật):**
- `/api/site-settings` throw 500: `getPublicSiteSettings` validate 11 key public bằng
  Zod; DB thiếu key `hotline` → `undefined` → ZodError → 500.
- DB (`site_settings`) hiện có **10/11** key; **thiếu đúng `hotline`**.
- **`seed.ts:35` CÓ `{ key: 'hotline', value: '1800 6230' }`** — seed định nghĩa đúng,
  nhưng DB thiếu → DB được seed từ bản trước khi thêm hotline, HOẶC seed chưa chạy lại.
- → Fix nhiều khả năng chỉ là **chạy lại seed** (`cd server && npm run db:seed`), KHÔNG
  cần sửa code seed. Xác nhận lúc thực hiện; nếu seed vẫn thiếu thì sửa `seed.ts`.

**Site-settings field ↔ Footer:**
| API field | Footer hiện hardcode |
|---|---|
| `hotline` | 'Hotline: 1800 6230' |
| `facebookUrl`/`instagramUrl`/`youtubeUrl` | `SOCIAL_LINKS` từ nav-links.ts |
| `footerCopyright` | '© 2018. All Right Reserved. Thức Coffee' |
| `contactEmail`, `officeAddress` | (ContactPage nhóm B — không đụng vòng này) |

Footer đọc `SOCIAL_LINKS` từ `nav-links.ts` (không phải `../data`). Chuyển: Footer gọi
`useSiteSettings()`, dùng hotline/social/copyright từ data. Loading → giữ chỗ/fallback
text hiện tại (Footer luôn hiển thị, không skeleton toàn trang).

## Related Code Files

- Verify/Fix: seed site-settings — chạy lại `npm run db:seed` (server); sửa `seed.ts`
  chỉ nếu seed thật sự thiếu hotline.
- Modify: `src/components/layout/Footer.tsx` — `useSiteSettings()` cho hotline/social/copyright.
- Verify: `src/components/layout/Header.tsx` — có đọc site-settings field nào không (logo,
  hotline)? Chuyển nếu có.
- (KHÔNG đụng ContactPage/nhóm B.)

## Implementation Steps

1. Chạy lại seed: `cd server && npm run db:seed`. Verify `curl /api/site-settings` → 200
   với `hotline`. Nếu vẫn thiếu → kiểm `seed.ts` có upsert hotline không, sửa rồi seed lại.
2. Footer: `useSiteSettings()`; map hotline/facebookUrl/instagramUrl/youtubeUrl/footerCopyright.
   Fallback text hiện tại khi loading/lỗi (Footer không được biến mất).
3. Header: kiểm field site-settings (logo/hotline); chuyển nếu có.
4. `npm run build` + `npm run lint`; runtime verify Footer hiện đúng data.

## Success Criteria

- [x] `/api/site-settings` trả 200 với đủ 11 key (gồm `hotline`).
- [x] Footer hiện hotline/social/copyright từ `useSiteSettings()`.
- [ ] Footer không lệch giao diện (data khớp hardcode cũ); không biến mất khi loading.
- [x] `npm run build` + `npm run lint` sạch.

## Risk Assessment

- **Seed lại có thể ghi đè data khác.** `db:seed` dùng upsert (onConflict) — kiểm không
  xóa data khác. Chỉ cần thêm key thiếu; nếu seed idempotent thì an toàn.
- **Footer biến mất khi API lỗi.** Footer phải luôn hiển thị — dùng fallback text hardcode
  khi `useSiteSettings` chưa có/lỗi, không return null.
- **Sửa seed = đụng backend.** Nếu phải sửa `seed.ts`, đây là thay đổi server — verify
  `cd server && npm run build` + lint riêng.
- **`instagramUrl` có thể rỗng** (`youtubeUrl` schema cho phép `''`). Footer xử lý link rỗng.
