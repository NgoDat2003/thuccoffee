---
phase: 3
title: "Module site-settings"
status: pending
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 3: Module site-settings

## Overview

Module mới `site-settings`: `GET /api/site-settings` trả public settings
(hotline, social, logo…) dạng typed camelCase object từ allow-list key. Phụ thuộc
Phase 1 (data đã seed).

## Requirements

- Functional: `GET /api/site-settings` trả object 11 field camelCase (report §8.2);
  chỉ query allow-list key, không `SELECT *`; missing required key → 500 (không
  bịa nội dung).
- Non-functional: response schema Zod; `youtube_url` rỗng hợp lệ (FE tự ẩn link).

## Architecture

Theo pattern module hiện có (categories/banners): 3 file.
- `site-settings.schemas.ts`: `publicSiteSettingsSchema` (11 field camelCase,
  report §8.2), type infer. `youtubeUrl` cho phép empty string.
- `site-settings.service.ts`: query `site_settings` where `key in (allow-list)`;
  map key-value rows → camelCase object; parse qua schema. Nếu thiếu key bắt buộc
  → schema parse fail → 500 INTERNAL_ERROR (report §8.2 rule, không silently
  fabricate).
- `site-settings.routes.ts`: `GET /` → `ok(settings)`.
- Đăng ký `/api/site-settings` ở `index.ts`.

## Related Code Files

- Create: `server/src/modules/site-settings/{site-settings.schemas,site-settings.service,site-settings.routes}.ts`
- Modify: `server/src/index.ts` (mount `/api/site-settings`)

## Implementation Steps

1. `site-settings.schemas.ts` — public settings schema camelCase.
2. `site-settings.service.ts` — query allow-list, map key→camelCase, parse.
3. `site-settings.routes.ts` — GET route.
4. Mount ở index.ts.
5. build+lint; curl `/api/site-settings` xem 11 field đúng; xóa 1 key test → 500.

## Success Criteria

- [ ] `GET /api/site-settings` trả 11 field camelCase đúng giá trị seed.
- [ ] Chỉ trả allow-list (không lộ key khác nếu thêm sau).
- [ ] Thiếu required key → 500 (không trả object khuyết/bịa).
- [ ] `youtubeUrl` rỗng vẫn hợp lệ (không lỗi).
- [ ] build+lint sạch.

## Risk Assessment

- **`SELECT *` lộ key nội bộ nếu sau thêm secret vào bảng.** Mitigation: query
  đúng allow-list key, không select all (report §8.2).
- **Missing key silently → FE hiển thị trống.** Mitigation: schema parse fail →
  500 rõ ràng, không bịa.
