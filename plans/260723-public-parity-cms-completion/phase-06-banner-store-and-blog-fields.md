---
phase: 6
title: "Banner store and blog fields"
status: done
priority: P2
effort: "6h"
dependencies: [2, 5]
---

# Phase 6: Banner store and blog fields

## Overview

Mở rộng các resource đã có để đủ business parity hợp lý: banner CTA/schedule/right placement, store map/hours chuẩn, blog priority/category/tag/featured/lifecycle tối thiểu.

## Requirements

- Functional: admin quản trị field public đang hiển thị hoặc ảnh hưởng ordering/placement.
- Non-functional: không copy toàn bộ legacy field nếu public không dùng; không thêm audit/RBAC lớn.

## Architecture

Tối thiểu:
- banners: `button_label`, `open_in_new_tab`, `starts_at`, `ends_at`, `content` nếu public cần text.
- stores: `map_embed_url` hoặc `latitude/longitude`, `hours` quản trị rõ, gallery metadata.
- blog_posts: `priority`, `is_featured`; tag/category chỉ làm nếu source/public route dùng hoặc admin cần lọc.
- lifecycle: publish/unpublish trước; hard delete chỉ cho banners/gallery.

## Related Code Files

- Modify: `server/src/db/schema.ts`, migration mới.
- Modify: `server/src/modules/banners/*`, `server/src/modules/stores/*`, `server/src/modules/blog/*`.
- Modify: `src/pages/admin/AdminBannersPage.tsx`, `src/components/admin/forms/BannerForm.tsx`, `src/components/admin/forms/StoreForm.tsx`, `src/pages/admin/AdminBlogFormPage.tsx`.
- Modify: public pages/components for home banner, store detail, blog list.

## Implementation Steps

1. Kiểm tra public source/report: field nào thật sự hiển thị thì thêm trước.
2. Migration mở rộng banners/stores/blog_posts tối thiểu.
3. Update admin forms tương ứng, giữ behavior hooks/query keys hiện có.
4. Update public render: banner CTA/schedule, store map field, blog featured/priority.
5. Smoke kiểm tra schedule hides expired banner, store map field render, blog priority stable.
6. Docs cập nhật field nào cố ý không làm.

## Success Criteria

- [x] Banner active window hoạt động; expired/future không public.
- [x] Store detail dùng map field từ DB, không suy từ address nếu có configured URL.
- [x] Blog priority/featured quản trị được.
- [x] Right banner chỉ render nếu có placement public được xác nhận; nếu chưa, giữ legacy inactive có docs.
- [x] FE lint/build sạch; server lint/build + smoke liên quan sạch.

## Risk Assessment

Risk: thêm quá nhiều field legacy. Mitigation: mỗi field phải có public consumer hoặc admin workflow rõ.
