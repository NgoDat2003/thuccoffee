---
phase: 2
title: "Public ordering and taxonomy"
status: done
priority: P1
effort: "8h"
dependencies: [1]
---

# Phase 2: Public ordering and taxonomy

## Overview

Sửa các sai khác public nhìn thấy ngay: category thật vs nhóm trình bày, featured/show-on-home, priority/sort cho home/menu/blog, và rule banner placement.

## Requirements

- Functional: homepage sản phẩm, menu category, blog pagination và banner placement dùng rule dữ liệu rõ ràng, không `.slice()` tùy tiện.
- Non-functional: backward-compatible URL hiện có; không xoá category route nếu đang có public route cần giữ.

## Architecture

DB hiện có `categories.sort_order`, `products.sort_order`, `blog_posts.published_at`, `banners.type/sort_order`. Cần bổ sung tối thiểu:
- `products.is_featured`, `products.show_on_home`, `products.home_priority`.
- `blog_posts.priority` để sort theo nguồn thay vì chỉ date.
- `categories.kind` hoặc `is_public_category` để tách 8 category thật khỏi 2 nhóm trình bày.

Public API phải trả dữ liệu đã sort; FE không tự suy rule business.

## Related Code Files

- Modify: `server/src/db/schema.ts`, migration mới, seed scripts.
- Modify: `server/src/modules/products/*`, `server/src/modules/categories/*`, `server/src/modules/blog/*`, `server/src/modules/banners/*`.
- Modify: `src/services/products.service.ts`, `src/services/categories.service.ts`, `src/services/blog.service.ts`.
- Modify: `src/pages/HomePage.tsx`, `src/pages/MenuPage.tsx`, `src/pages/BlogIndexPage.tsx`.

## Implementation Steps

1. Viết migration thêm field ordering/taxonomy tối thiểu.
2. Cập nhật seed: 8 category thật; `san-pham-moi` và `yeu-thich-nhat` là presentation group/featured filter.
3. Products API hỗ trợ `featured`, `home`, `category`, sort stable theo priority rồi id/slug.
4. Blog API sort theo `priority ASC`, fallback `publishedAt DESC, id DESC`; pagination vẫn 267/5 = 54.
5. Banners API trả theo `type`, `isActive`, `sortOrder`; home render slider và promotion đúng placement.
6. FE bỏ logic `.slice(0, 8)` hardcode; dùng response đúng contract.
7. Smoke cập nhật để assert first items theo seed fixture động, không hardcode slug nếu có thể.

## Success Criteria

- [x] Home products lấy từ `showOnHome/isFeatured + priority`, không từ category giả.
- [x] Menu category public chỉ hiển thị đúng category thật theo scope.
- [x] Blog page 1 và page 54 sort ổn định; page 54 có 2 bài.
- [x] Banner slider/promotion không lẫn placement; nhiều promotion active có rule deterministic.
- [x] FE lint/build sạch; server lint/build + smoke API sạch.

## Risk Assessment

Risk: đổi category làm vỡ URL cũ. Mitigation: giữ route alias nếu public đang có deep link.
Risk: thiếu source priority chính xác. Mitigation: seed từ audit hiện có, field cho phép admin sửa sau.
