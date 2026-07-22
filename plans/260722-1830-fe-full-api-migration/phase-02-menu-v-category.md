---
phase: 2
title: "Menu và Category"
status: completed
priority: P2
effort: "2-3h"
dependencies: [1]
---

# Phase 2: Menu và Category

## Overview

Chuyển MenuPage sang `useProducts(category)` và category labels sang `useCategories()`.
GIỮ NGUYÊN `category-paths.ts` (routing config). CategorySidebar/Dropdown/DesktopNav
đọc label từ API.

## Requirements

- Functional: MenuPage hiện products theo category từ API; đổi category (client-side)
  refetch đúng; sidebar/dropdown/nav hiện label từ `useCategories()`.
- Non-functional: routing (slug `-t5p1s549`) không đổi; build/lint sạch.

## Architecture

**Ranh giới sống còn:** `src/data/category-paths.ts` = ROUTING (slug khớp site gốc,
CLAUDE.md cấm đổi). `categoryHref`/`isCategoryPath`/`categoryKeyFromPath` GIỮ NGUYÊN.
Chỉ chuyển mảng `categories` ({key,label}) → `useCategories()`.

MenuPage: `getProductsByCategory(activeCategory)` → `useProducts(activeCategory)`.
`activeCategory` đổi khi user click sidebar (client-side, không đổi route) → TanStack
Query refetch theo queryKey `productKeys.list(cat)`. Loading → skeleton grid; empty →
giữ text "Chưa có sản phẩm".

CategorySidebar/CategoryDropdown/DesktopNav: hiện đọc `categories` (mảng label) →
`useCategories()`. Các component này render danh sách category; loading nhẹ (category
ít, có thể render rỗng tới khi có data, hoặc skeleton mảnh).

## Related Code Files

- Modify: `src/pages/MenuPage.tsx` — `useProducts`, skeleton, giữ logic category-paths.
- Modify: `src/components/menu/CategorySidebar.tsx` — `useCategories()`.
- Modify: `src/components/menu/CategoryDropdown.tsx` — `useCategories()`.
- Modify: `src/components/layout/DesktopNav.tsx` — `useCategories()` (phần label).
- Create: `src/components/menu/MenuSkeleton.tsx` (hoặc inline) — grid product skeleton.
- (KHÔNG sửa `category-paths.ts`, `routes.tsx`.)

## Implementation Steps

1. Đọc kỹ `CategorySidebar`, `CategoryDropdown`, `DesktopNav` để biết chúng dùng
   `categories` thế nào (label, active state) và `categoryPaths` thế nào (routing) —
   tách đúng: label → API, path → giữ.
2. MenuPage: đổi `getProductsByCategory` → `useProducts(activeCategory)`; skeleton khi
   loading; giữ nguyên `categoryKeyFromPath`/`categoryHref`.
3. Category components: `useCategories()` cho label; giữ href/routing từ `category-paths`.
4. `npm run build` + `npm run lint`; verify runtime (mở /menu, đổi category).

## Success Criteria

- [x] MenuPage đọc products qua `useProducts`; đổi category refetch đúng.
- [x] Sidebar/Dropdown/DesktopNav label từ `useCategories()`.
- [x] `category-paths.ts` + `routes.tsx` KHÔNG đổi; routing hoạt động.
- [x] `npm run build` + `npm run lint` sạch.

## Risk Assessment

- **Phá routing khi lẫn label với path.** Tách rõ: `categories` (content→API) vs
  `categoryPaths` (routing→giữ). Verify slug `/menu/coffee-t1p1s494` vẫn vào đúng.
- **DesktopNav dùng cả hai.** Đọc kỹ trước khi sửa — chỉ đổi phần label.
- **Loading category gây nhấp nháy nav.** Category nhỏ; cân nhắc render rỗng ngắn hoặc
  giữ layout. Không bắt buộc skeleton cầu kỳ cho nav.
