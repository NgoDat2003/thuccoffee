---
phase: 4
title: "Module pages"
status: cancelled
priority: P1
effort: "3h"
dependencies: [1]
---

> **HOÃN (validation session 1).** Không cook vòng này. Lý do: Membership/Careers
> hiện là structured data (`tiers[]`, `jobs[]`) render bằng JSX có layout; báo cáo
> chọn `static_pages.content`=HTML string → FE phải `dangerouslySetInnerHTML` →
> mất layout hiện tại. Đánh đổi chưa rõ. Quyết cùng lúc làm admin (khi biết admin
> sửa page kiểu gì). Membership/Careers giữ tĩnh. Nội dung dưới giữ làm tham khảo
> cho vòng sau.

# Phase 4: Module pages (HOÃN)

## Overview

Module mới `pages`: `GET /api/pages/:key` trả static page (membership/careers)
dạng HTML content. Chỉ nhận 2 key qua enum param. Phụ thuộc Phase 1 (data seed).

## Requirements

- Functional: `GET /api/pages/:key` với key ∈ {`chuong-trinh-thanh-vien`,
  `tuyen-dung`} trả `{key, title, content, updatedAt}` (report §8.3); key hợp lệ
  chưa seed → 404; key ngoài enum → 400; `updatedAt` ISO datetime.
- Non-functional: content trả nguyên (đã sanitize lúc seed, không sanitize lại
  mỗi request).

## Architecture

- `pages.schemas.ts`: `pageParamsSchema = z.object({ key: z.enum([
  'chuong-trinh-thanh-vien','tuyen-dung']) })` → key sai → ZodError → 400.
  `publicStaticPageSchema` (key, title, content, updatedAt ISO).
- `pages.service.ts`: `getPageByKey(key)` query `static_pages` where key; nếu
  không có → undefined (route 404). Map `updated_at` → ISO string.
- `pages.routes.ts`: `GET /:key` validateParams(enum) → service → `ok` hoặc 404.
- Mount `/api/pages` ở index.ts.

## Related Code Files

- Create: `server/src/modules/pages/{pages.schemas,pages.service,pages.routes}.ts`
- Modify: `server/src/index.ts` (mount `/api/pages`)

## Implementation Steps

1. `pages.schemas.ts` — enum param + response schema.
2. `pages.service.ts` — getPageByKey, map updatedAt ISO.
3. `pages.routes.ts` — GET /:key với validateParams enum.
4. Mount index.ts.
5. build+lint; curl 2 key hợp lệ → 200 HTML; key lạ → 400; (test 404 khó vì đã
   seed — có thể verify bằng logic hoặc tạm xóa 1 row).

## Success Criteria

- [ ] `GET /api/pages/chuong-trinh-thanh-vien` → 200, content HTML non-empty.
- [ ] `GET /api/pages/tuyen-dung` → 200, content HTML non-empty.
- [ ] Key ngoài enum (vd `abc`) → **400** (validate enum).
- [ ] Key hợp lệ nhưng chưa seed → **404** (nhất quán contract).
- [ ] `updatedAt` là ISO datetime. build+lint sạch.

## Risk Assessment

- **400 vs 404 lẫn lộn.** Mitigation: enum chặn key lạ → 400; key hợp lệ thiếu
  row → 404. Nhất quán schema + smoke test (report §8.3).
- **Sanitize lại mỗi request tốn/khác nhau.** Mitigation: sanitize 1 lần lúc seed
  (Phase 1), GET trả nguyên.
