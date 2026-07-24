---
title: "THUC Coffee public parity and CMS completion"
description: "Hoàn thiện 100% public đang dùng và CMS đủ quản trị dữ liệu public, không copy legacy cart/user/order."
status: completed
priority: P1
effort: 52h
branch: "feat/public-parity-cms-scope"
tags: [feature, frontend, backend, database, api, admin]
blockedBy: []
blocks: []
created: "2026-07-23T08:01:12.579Z"
createdBy: "ck:plan"
source: skill
---

# THUC Coffee public parity and CMS completion

## Overview

Triển khai "hướng 1": 100% chức năng public đang dùng của THỨC Coffee + admin đủ quản trị dữ liệu public. Không làm public user, cart/order/checkout/payment, RBAC nhiều role, legacy StaticText toàn hệ thống, secret SMTP/analytics trong UI, hoặc copy lỗi/technical debt của site gốc.

Nguồn chính: `plans/reports/260723-thuccoffee-full-functional-parity-audit.md`, `docs/backend-architecture.md`, `docs/database-design.md`, `docs/deviations-from-original.md`.

Nguyên tắc:
- Bám module Express hiện có trong `server/src/modules/<resource>/`.
- FE gọi qua `src/services/*.service.ts` + TanStack Query, page không gọi axios trực tiếp.
- Ảnh qua MinIO/object key và `getImageUrl()`, không hardcode asset mới.
- Seed production phải tách bootstrap-once/dev-reset để không ghi đè dữ liệu admin.
- Mỗi phase xong chạy FE lint/build; nếu chạm `server/` thì chạy server lint/build và smoke liên quan.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Scope contract and docs](./phase-01-scope-contract-and-docs.md) | Done |
| 2 | [Public ordering and taxonomy](./phase-02-public-ordering-and-taxonomy.md) | Done |
| 3 | [Search and public submissions](./phase-03-search-and-public-submissions.md) | Done |
| 4 | [Product options and stickers](./phase-04-product-options-and-stickers.md) | Done |
| 5 | [Static pages FAQ and gallery CMS](./phase-05-static-pages-faq-and-gallery-cms.md) | Done |
| 6 | [Banner store and blog fields](./phase-06-banner-store-and-blog-fields.md) | Done |
| 7 | [Admin integration and regression smoke](./phase-07-admin-integration-and-regression-smoke.md) | Done |
| 8 | [Full parity verification](./phase-08-full-parity-verification.md) | Done |

## Dependencies

- Phụ thuộc dữ liệu audit nguồn đã có trong `plans/reports/260723-thuccoffee-full-functional-parity-audit.md`.
- Không phụ thuộc Dokploy.
- Không phụ thuộc public member/order vì đã loại khỏi scope.

## Scope Contract

In scope:
- Search product/blog theo URL nguồn.
- Contact/newsletter có backend thật.
- Product options/stickers/featured/priority.
- Static pages, Membership FAQ, homepage gallery qua DB/API/admin.
- Banners/stores/blog thêm field đủ để public parity hợp lý.
- Admin CRUD đủ cho public data và smoke tests.
- Route/API/visual verification cho public.

Out of scope:
- Public login/member/forgot password thật.
- Cart, checkout, payment, orders, customers.
- RBAC chi tiết; một admin là đủ.
- Legacy social/SMTP/analytics/counter secret trong CMS.
- Copy HTTPS lỗi, route 500, ảnh hỏng hoặc dữ liệu riêng tư từ source.
