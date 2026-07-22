---
phase: 10
title: "Banners + site settings (API + UI)"
status: pending
priority: P1
effort: "1d"
dependencies: [6]
---

# Phase 10: Banners + site settings — API + UI

## Overview

Hai resource cuối, đơn giản nhất, thuần pattern đã có. Banner một bảng UI tabs
theo type; settings allow-list key cố định.

## Requirements

- Functional: banner CRUD + activate + order, tabs 3 type; settings đọc/sửa
  các key allow-list.
- Non-functional: type enum khớp DB check; không cho tạo settings key mới.

## Architecture

### Banners API (`banners.admin.routes.ts`)
```
GET    /api/admin/banners           → toàn bộ (kể cả inactive), mọi type
POST   /api/admin/banners           → type (z.enum(['promotion','right','slider'])
                                      — KHỚP schema.ts:123, red-team #8, không
                                      bịa thêm giá trị), image (key), altText,
                                      linkUrl?, sortOrder
PUT    /api/admin/banners/:id       → mọi field (banner không có slug — sửa
                                      thoải mái)
PATCH  /api/admin/banners/:id/activate → { isActive }
DELETE /api/admin/banners/:id       → NGOẠI LỆ delete policy: banner là trang
                                      trí thuần, không có public URL riêng,
                                      không link nội dung — hard delete 204
                                      an toàn. (Products/blog/stores vẫn
                                      unpublish-only.)
```

### Settings API (`site-settings.admin.routes.ts`)
```
GET  /api/admin/site-settings       → các key trong ALLOW-LIST (đọc danh sách
                                      key thật từ site-settings.routes.ts public
                                      hiện có lúc impl — 11 key public + kiểm
                                      DB có key nào khác; chỉ expose allow-list)
PUT  /api/admin/site-settings       → body { [key]: value } — Zod chỉ nhận key
                                      thuộc allow-list (red-team #10: không cho
                                      tạo key tùy ý); upsert từng key, updatedAt
```

### Smoke `smoke-admin-banners-settings.ts`
Guard 401; banner CRUD + type sai → 400 + delete 204 + activate phản ánh
public `GET /api/banners`; settings PUT key lạ → 400, PUT key hợp lệ → public
site-settings đổi; cleanup.

### UI
- `src/services/admin/{banners,site-settings}.service.ts` + invalidate public
  keys (banners, site-settings — dùng bởi header/footer/home).
- `AdminBannersPage.tsx` — tabs 3 type (state local), mỗi tab AdminTable:
  image thumb, altText, linkUrl, order, ActiveSwitch (tái dùng PublishSwitch
  đổi label), actions sửa/xóa (ConfirmDialog). Form banner: dialog hoặc trang
  con `banners/new`, `banners/:id` — chọn TRANG CON (nhất quán products/blog,
  không thêm pattern dialog-form mới).
- `AdminSettingsPage.tsx` — form một cột: FormField mỗi key (label tiếng Việt
  thân thiện map từ key), nút lưu chung PUT một lần.
- Routes: `banners`, `banners/new`, `banners/:id`, `settings`.

## Related Code Files

- Create: `server/src/modules/banners/banners.admin.{routes,schemas}.ts`,
  `server/src/modules/site-settings/site-settings.admin.{routes,schemas}.ts`,
  `server/scripts/smoke-admin-banners-settings.ts`,
  `src/pages/admin/{AdminBannersPage,AdminBannerFormPage,AdminSettingsPage}.tsx`,
  `src/services/admin/{banners,site-settings}.service.ts`
- Modify: `server/src/modules/admin/admin.routes.ts`, `src/routes.tsx`,
  `server/package.json`
- Read for context: `server/src/modules/site-settings/site-settings.routes.ts`
  (allow-list key thật), `server/src/modules/banners/banners.routes.ts`,
  `src/services/{banners,site-settings}.service.ts` (public keys)

## Implementation Steps

1. Smoke đỏ baseline.
2. banners.admin + site-settings.admin (schemas + routes).
3. Mount; lint/build; smoke XANH.
4. Services FE + 3 page + routes.
5. FE lint/build; test dev: đổi hotline settings → footer public đổi; thêm
   banner slider → home carousel đổi.

## Success Criteria

- [ ] `smoke:admin-banners-settings` XANH.
- [ ] Banner type enum khớp DB check; key settings lạ bị 400.
- [ ] Đổi settings/banner phản ánh public (header/footer/home) không F5.
- [ ] FE + server lint/build sạch.

## Risk Assessment

- **Rủi ro:** delete banner đang active làm home carousel trống — chấp nhận
  (admin tự chịu trách nhiệm nội dung; carousel rỗng không crash — kiểm
  component home lúc impl, nếu crash thì fix component, không đổi policy).
- **Rủi ro:** settings key thật khác 11 key đoán — bước impl ĐỌC code public
  route lấy danh sách thật, không hardcode từ plan.
