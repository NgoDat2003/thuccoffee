---
phase: 2
title: "Query provider & services"
status: completed
priority: P2
effort: "2-3h"
dependencies: [1]
---

# Phase 2: Query provider & services

## Overview

Dựng `QueryProvider` (QueryClient + defaultOptions) và 6 service theo tài nguyên.
Mỗi service tự đủ: `queryKeys` factory + type (import từ backend) + hook `useQuery`.
Bọc app bằng provider ở `main.tsx`. **Chưa page nào gọi hook.**

## Requirements

- Functional: 6 service export hook + queryKeys đúng endpoint; provider hoạt động.
- Non-functional: component không sửa (ngoài `main.tsx` bọc provider); build/lint sạch.

## Architecture

Provider tối giản (khác inno-pos: không Frappe/CSRF/socket):
```tsx
// src/providers/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});
export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

Service pattern (theo inno-pos, RQ v5):
```ts
// src/services/products.service.ts
import { useQuery } from '@tanstack/react-query';
import type { Product } from '../../server/src/modules/products/products.schemas';
import { apiGet } from '../lib/api';

export const productKeys = {
  all: ['products'] as const,
  list: (category?: string) => [...productKeys.all, 'list', { category }] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
};

export function useProducts(category?: string) {
  return useQuery({
    queryKey: productKeys.list(category),
    queryFn: () => apiGet<Product[]>('/products', { params: { category } }),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => apiGet<Product>(`/products/${slug}`),
    enabled: !!slug,
  });
}
```

Endpoint ↔ service ↔ type:
| Service | Hook | Endpoint | Type (từ backend) |
|---|---|---|---|
| products | `useProducts(cat?)`, `useProduct(slug)` | `/products`, `/products/:slug` | `Product` |
| blog | `useBlogPage(page)`, `useBlogPost(slug)` | `/blog?page=`, `/blog/:slug` | `BlogListItem`, `BlogDetail` |
| stores | `useStores()`, `useStore(slug)` | `/stores`, `/stores/:slug` | `Store`, `StoreDetail` |
| categories | `useCategories()` | `/categories` | (xem `categories.schemas.ts`) |
| banners | `useBanners()` | `/banners` | `Banner` |
| site-settings | `useSiteSettings()` | `/site-settings` | `PublicSiteSettings` |

**Blog phân trang**: `useBlogPage` dùng `apiGetPaginated<BlogListItem[]>` để giữ `meta`
(page/pageSize/total/totalPages). Trả cả `data` và `meta` cho component vòng sau.
Cân nhắc `placeholderData: keepPreviousData` (RQ v5) để chuyển trang mượt — nhưng
KHÔNG bắt buộc ở vòng structure; chỉ khai báo hook, chưa tinh chỉnh UX.

## Related Code Files

- Create: `src/providers/query-provider.tsx`
- Create: `src/services/products.service.ts`
- Create: `src/services/blog.service.ts`
- Create: `src/services/stores.service.ts`
- Create: `src/services/categories.service.ts`
- Create: `src/services/banners.service.ts`
- Create: `src/services/site-settings.service.ts`
- Modify: `src/main.tsx` — bọc `<QueryProvider>` quanh `<RouterProvider>`.

## Implementation Steps

1. Viết `src/providers/query-provider.tsx` như trên.
2. Sửa `src/main.tsx`: `<StrictMode><QueryProvider><RouterProvider .../></QueryProvider></StrictMode>`.
3. Viết 6 service. Với mỗi service: `queryKeys` factory + import type backend + hook.
   - Xác minh tên type/đường dẫn import bằng cách đọc file schema tương ứng trong
     `server/src/modules/<res>/<res>.schemas.ts` (đừng đoán tên type).
   - `categories`: đọc `categories.schemas.ts` để lấy đúng tên type export.
4. `npm run build` + `npm run lint`.

## Success Criteria

- [x] `src/providers/query-provider.tsx` tồn tại; `main.tsx` bọc provider.
- [x] 6 service tồn tại, mỗi service có `queryKeys` + hook + type import từ backend.
- [x] Hook blog giữ `meta` phân trang.
- [x] `npm run build` + `npm run lint` sạch.
- [x] Không page/component nào gọi hook (ngoài `main.tsx` bọc provider).

## Risk Assessment

- **Đoán sai tên type backend.** Giảm thiểu: đọc từng file schema trước khi import
  (CLAUDE.md: không bịa tên field/type).
- **`noUnusedLocals`/`noUnusedParameters` (tsconfig strict).** Service export hết nên
  không lỗi unused; nhưng nếu import type không dùng sẽ fail build — chỉ import type thực dùng.
- **Provider gây re-render router.** `queryClient` tạo 1 lần ở module scope (không trong
  component body) để tránh tạo lại mỗi render.
