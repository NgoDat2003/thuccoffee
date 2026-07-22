---
phase: 7
title: "Dọn và verify full"
status: pending
priority: P2
effort: "1-2h"
dependencies: [6]
---

# Phase 7: Dọn và verify full

## Overview

Dọn data tĩnh không còn dùng (grep 0 ref), xóa dần `src/data/index.ts`/type đã chuyển,
và verify toàn bộ một thể: build/lint + runtime mọi page nhóm A với backend thật.

## Requirements

- Functional: mọi page nhóm A đọc API; nhóm B (pages.ts) vẫn tĩnh; routing nguyên.
- Non-functional: build/lint/runtime sạch toàn bộ.

## Architecture

Sau Phase 2-5, các mảng `products`/`blog`/`stores` và hàm `getProductBySlug`/
`getBlogPage`/`getStoreBySlug`… trong `src/data/index.ts` có thể không còn ai gọi.
Dọn theo nguyên tắc: **chỉ xóa khi grep 0 reference**.

**GIỮ LẠI:**
- `src/data/pages.ts` (nhóm B — About/Careers/… vẫn dùng).
- `src/data/category-paths.ts` (routing).
- `src/data/types.ts` — chỉ xóa type đã chuyển sang BE (`BlogPost`/`Store` nếu hết ref);
  giữ type nhóm B (`FaqItem`, `MembershipTier`, `JobListing`, `CookiePolicySection`…).
- `src/data/blog-content.ts` — xóa nếu Phase 4 đã bỏ lazy-load (grep 0 ref).

## Related Code Files

- Modify/Delete: `src/data/index.ts` — bỏ export mảng/hàm không còn dùng.
- Delete (nếu 0 ref): `src/data/products.ts`, `src/data/blog.ts`, `src/data/stores.ts`,
  `src/data/categories.ts`, `src/data/blog-content.ts`.
- Modify: `src/data/types.ts` — xóa type đã chuyển; giữ type nhóm B.
- (KHÔNG xóa `pages.ts`, `category-paths.ts`.)

## Implementation Steps

1. Grep từng mảng/hàm data tĩnh xem còn ref không:
   `grep -rn "getProductBySlug\|getBlogPage\|getStoreBySlug\|from './products'\|..."`.
2. Xóa mảng/hàm/file **chỉ khi 0 ref**. Không xóa mù.
3. `src/data/types.ts`: xóa type đã chuyển sang BE nếu hết ref; giữ type nhóm B.
4. `npm run build` + `npm run lint` — sạch.
5. **Verify runtime full** (backend `:8080` + vite dev, proxy `/api`):
   - `/` (home: featured, blog carousel, store locator)
   - `/menu` + đổi category
   - `/menu/:slug` (product detail — đã xong)
   - `/cua-hang` + `/cua-hang/:slug` (gallery)
   - `/chuyen-cua-thuc` + `/t1p2` + 1 bài detail (content, date, related)
   - Footer: hotline/email/social/copyright từ site-settings (Phase 6).
   - Nhóm B (/gioi-thieu, /tuyen-dung…) vẫn render tĩnh OK.
6. `git diff --stat` — xác nhận nhóm B + category-paths KHÔNG đổi.

## Success Criteria

- [ ] Mọi page nhóm A đọc API; grep `from '../data'` chỉ còn nhóm B + category-paths.
- [ ] Data tĩnh không dùng đã xóa (0 ref trước khi xóa).
- [ ] `pages.ts`, `category-paths.ts` nguyên; nhóm B render OK.
- [ ] `npm run build` + `npm run lint` sạch; runtime full pass với backend thật.

## Risk Assessment

- **Xóa mù data còn dùng.** Grep 0 ref TRƯỚC mỗi lần xóa. Build sẽ báo nếu xóa nhầm.
- **Nhóm B vô tình gãy.** `pages.ts` + type nhóm B trong `types.ts` phải giữ; verify
  nhóm B render sau khi dọn.
- **Runtime cần backend + seed.** Compose đang chạy healthy; verify `/api/*` có data.
