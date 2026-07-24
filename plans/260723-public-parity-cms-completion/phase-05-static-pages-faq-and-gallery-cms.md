---
phase: 5
title: "Static pages FAQ and gallery CMS"
status: done
priority: P1
effort: "8h"
dependencies: [1, 2]
---

# Phase 5: Static pages FAQ and gallery CMS

## Overview

Đưa các nội dung public còn hardcode nhưng cần quản trị sang DB/API/admin: About, Delivery, Membership, Recruitment, Policy, StoresIntro, Membership FAQ và homepage gallery.

## Requirements

- Functional: admin sửa nội dung page/gallery/FAQ và public phản ánh đúng.
- Non-functional: chỉ tiếng Việt; không xây localized text CMS hơn 100 key.

## Architecture

Tận dụng `static_pages` cho singleton page. Thêm bảng nếu cần:
- `membership_faqs(id, question, answer, sort_order, is_published, timestamps)`.
- `site_gallery(id, storage_key, alt_text, link_url, sort_order, is_active, timestamps)` nếu không muốn dùng polymorphic owner_id giả trong `media_attachments`.

API public:
- `GET /api/pages/:key`
- `GET /api/membership-faqs`
- `GET /api/home-gallery`

Admin:
- `/admin/pages`
- `/admin/gallery`
- FAQ section trong page membership hoặc menu riêng tùy UI hiện có.

## Related Code Files

- Modify: `server/src/db/schema.ts`, migration mới, seed scripts.
- Create: `server/src/modules/static-pages/*`, `server/src/modules/membership-faqs/*`, `server/src/modules/site-gallery/*`.
- Modify: `server/src/modules/admin/admin.routes.ts` hoặc route admin tương ứng.
- Create: `src/services/static-pages.service.ts`, `src/services/home-gallery.service.ts`.
- Modify: `src/pages/AboutPage.tsx`, `src/pages/DeliveryPage.tsx`, `src/pages/MembershipPage.tsx`, `src/pages/CareersPage.tsx`, `src/pages/CookiePolicyPage.tsx`, `src/pages/ContactPage.tsx`, `src/components/home/GalleryLightbox.tsx`.

## Implementation Steps

1. Migration/seed static_pages từ `src/data/pages.ts` cho keys đang public.
2. Thiết kế page content schema: title, content HTML/Markdown, optional sections JSON chỉ khi thật cần.
3. Public page services/hooks và chuyển 6 page sang API với loading/error.
4. Membership FAQ API/admin CRUD nhỏ.
5. Homepage gallery API/admin CRUD hoặc replace-all order, dùng MinIO upload hiện có.
6. Xóa phần data tĩnh đã di chuyển nếu không còn import; giữ `category-paths.ts`.
7. Smoke kiểm tra admin mutation page/FAQ/gallery phản ánh ra public.

## Success Criteria

- [x] 6 static pages lấy từ DB/API, không còn nội dung chính hardcode.
- [x] Membership FAQ quản trị được, sort ổn định.
- [x] Homepage gallery không hardcode trong component.
- [x] `src/data/pages.ts` được xóa hoặc thu nhỏ còn dữ liệu ngoài scope có lý do.
- [x] FE lint/build sạch; server lint/build + smoke pages/gallery sạch.

## Risk Assessment

Risk: rich page structure bị mất layout nếu gom thành 1 HTML blob. Mitigation: chọn từng page: HTML blob cho nội dung đơn giản, structured fields cho membership nếu layout cần.
Risk: site gallery không hợp với `media_attachments`. Mitigation: dùng `site_gallery` riêng nếu service validate sẽ đơn giản hơn.
