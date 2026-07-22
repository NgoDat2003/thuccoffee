---
phase: 2
title: "Nối ProductDetailPage + skeleton"
status: completed
priority: P2
effort: "2-3h"
dependencies: [1]
---

# Phase 2: Nối ProductDetailPage + skeleton

## Overview

Chuyển `ProductDetailPage` từ `getProductBySlug`/`getRelatedProducts` (sync, tĩnh)
sang `useProduct` hook. Thêm skeleton loading, xử lý error/404, và tách related sang
component tự fetch. Đây là page mẫu chốt pattern render cho các page động sau.

## Requirements

- Functional: page đọc product qua API; loading→skeleton; slug sai/404→Navigate /menu;
  lỗi API khác→xử lý (xem quyết định dưới); related từ API cùng category.
- Non-functional: không đổi giao diện khi data đã về; build/lint sạch.

## Architecture

Pattern mẫu (rules-of-hooks: gọi mọi hook trước mọi return):
```tsx
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { data: product, isLoading, isError } = useProduct(slug ?? '');

  usePageMeta(product?.name ?? 'Menu', product?.description);  // gọi vô điều kiện

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <Navigate to="/menu" replace />;

  const fullImage = product.image ?? product.thumb;
  // ... render như cũ (name, description, formatPrice, lightbox, nút gọi)
  // <RelatedProducts categoryKey={product.categories[0]} currentSlug={product.slug} />
}
```

**Related — tách component tự fetch** (khuyến nghị design, tránh gọi hook sau return):
```tsx
// RelatedProducts nhận categoryKey + currentSlug, tự gọi useProducts(categoryKey)
export default function RelatedProducts({ categoryKey, currentSlug }: Props) {
  const { data = [] } = useProducts(categoryKey);
  const related = data.filter((p) => p.slug !== currentSlug).slice(0, 4);
  if (related.length === 0) return null;
  // render grid ProductCard như cũ
}
```
**Đổi hợp đồng props** `RelatedProducts`: từ `products: Product[]` → `{ categoryKey, currentSlug }`.
ProductDetailPage là nơi DUY NHẤT dùng `RelatedProducts` (đã grep) → đổi an toàn.

**Quyết định lỗi API (chốt lúc validate):** hiện `!product` → `Navigate /menu`. Với
`isError` (network/500, khác 404): design đề xuất Navigate luôn cho đơn giản; hoặc
theo mẫu retry của `BlogDetailPage`. Vòng mẫu này chọn **Navigate /menu cho cả 404
và isError** để giữ KISS — page mẫu không cần retry phức tạp; blog vòng sau xử lý retry.

**Skeleton:** component mới `ProductDetailSkeleton` — khối `animate-pulse bg-gray-100`
mô phỏng: ảnh (grid 2 cột trái), name (thanh), price (thanh ngắn), + grid 4 ô related.
Không thêm thư viện.

## Related Code Files

- Modify: `src/pages/ProductDetailPage.tsx` — dùng `useProduct`, skeleton, error→Navigate,
  bỏ `import from '../data'`.
- Modify: `src/components/menu/RelatedProducts.tsx` — đổi props sang `{categoryKey, currentSlug}`,
  tự gọi `useProducts`.
- Create: `src/components/menu/ProductDetailSkeleton.tsx`.

## Implementation Steps

1. Tạo `ProductDetailSkeleton.tsx` — layout khớp ProductDetailPage (grid 2 cột + related).
2. Sửa `RelatedProducts.tsx`: props mới, gọi `useProducts(categoryKey)`, filter currentSlug,
   `.slice(0,4)`. Import `useProducts` từ `../../services/products.service`.
3. Sửa `ProductDetailPage.tsx`: `useProduct(slug)`, skeleton, Navigate, render RelatedProducts
   với props mới. Giữ lightbox + nút gọi + usePageMeta.
4. `npm run build` + `npm run lint`.

## Success Criteria

- [x] `ProductDetailPage` không còn `import from '../data'`.
- [x] Loading hiện `ProductDetailSkeleton`; slug sai/lỗi → Navigate /menu.
- [x] `RelatedProducts` tự fetch qua `useProducts`, filter product hiện tại.
- [x] `usePageMeta` gọi vô điều kiện (không sau return) — không vi phạm rules-of-hooks.
- [x] `npm run build` + `npm run lint` sạch.

## Risk Assessment

- **Rules-of-hooks:** mọi `useQuery`/`usePageMeta` phải trước `if (isLoading) return`.
  Related tách component riêng nên hook của nó độc lập.
- **`usePageMeta` khi product chưa có:** truyền fallback `'Menu'` — an toàn, giống hành vi cũ.
- **`useProducts(categoryKey)` khi categoryKey rỗng:** product luôn có ≥1 category (data thật);
  nếu lo, thêm guard `enabled` — nhưng không bắt buộc.
- **StrictMode double-render dev:** TanStack Query xử lý; không phát sinh double-fetch thật.
