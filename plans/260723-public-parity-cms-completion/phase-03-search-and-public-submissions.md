---
phase: 3
title: "Search and public submissions"
status: done
priority: P1
effort: "7h"
dependencies: [1]
---

# Phase 3: Search and public submissions

## Overview

Thay các public no-op bằng backend thật: search sản phẩm/bài viết, contact submit, newsletter subscribe. Không gửi email production trong scope này vì thiếu provider/domain.

## Requirements

- Functional: URL search nguồn hoạt động; contact/newsletter lưu DB và trả trạng thái thật.
- Non-functional: validate input, rate-limit cơ bản nếu có middleware sẵn, honeypot nhẹ, không block request bằng SMTP.

## Architecture

Tạo module:
- `server/src/modules/search`: `GET /api/search?type=product|blog&keyword=&page=&pageSize=`.
- `server/src/modules/public-submissions`: contact/newsletter POST.

DB mới:
- `contact_submissions(id, name, email, phone, message, status, created_at)`.
- `newsletter_subscriptions(id, email, source, is_active, created_at, updated_at)`.

FE:
- route tương thích `/search/p:page` và `/search/t3p:page`.
- desktop/mobile search submit chuyển URL thay vì preventDefault.

## Related Code Files

- Create: `server/src/modules/search/*`
- Create: `server/src/modules/public-submissions/*`
- Modify: `server/src/db/schema.ts`, migration mới, `server/src/index.ts`
- Create: `src/services/search.service.ts`, `src/services/public-submissions.service.ts`
- Create/modify: `src/pages/SearchPage.tsx`, `src/routes.tsx`
- Modify: `src/components/ui/ContactForm.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/MobileDrawer.tsx`

## Implementation Steps

1. Migration thêm 2 bảng submission/newsletter và index email/status.
2. Search schemas/service/routes: product search theo name/description/category; blog search theo title/summary/content.
3. Public route mapping nguồn trong `src/routes.tsx` với dispatcher đọc query `type` và page từ URL.
4. Tạo service/hooks và page kết quả search dùng pagination.
5. Contact form gọi API, hiển thị loading/success/error thật.
6. Footer newsletter gọi API, xử lý duplicate email idempotent.
7. Smoke script kiểm tra search, contact, newsletter, duplicate newsletter.

## Success Criteria

- [x] `/search/p1/?type=Product&keyword=coffee` render kết quả sản phẩm hoặc empty state thật.
- [x] `/search/t3p1/?type=Blog&keyword=thức` render kết quả blog có pagination.
- [x] Mobile và desktop search đều submit được.
- [x] Contact tạo record DB; newsletter duplicate không tạo bản ghi lặp.
- [x] Không yêu cầu SMTP/env mới để pass local.
- [x] FE lint/build sạch; server lint/build + smoke mới sạch.

## Risk Assessment

Risk: full-text search overkill. Mitigation: dùng ILIKE/normalized query trước; dữ liệu nhỏ.
Risk: spam public. Mitigation: validate length + honeypot + optional rate-limit hook, chưa thêm CAPTCHA nếu chưa cần.
