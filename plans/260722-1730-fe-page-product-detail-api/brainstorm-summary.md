# Brainstorm — Nối ProductDetailPage vào API (page mẫu, bước 3)

**Ngày:** 2026-07-22
**Nhánh gốc:** `feat/fe` (rẽ nhánh con mới để làm)
**Phạm vi:** Chuyển **1 page mẫu** (`ProductDetailPage`) từ đọc `src/data` sang gọi
hook TanStack Query. Chốt pattern render (loading/error/format) để vòng sau nhân bản
cho các page động còn lại.

## Vấn đề

Data-layer structure đã dựng (axios + 6 service + provider) nhưng **0 page dùng**.
13 page vẫn `import from '../data'`. Cần page đầu tiên đọc API thật để: (1) verify
runtime end-to-end với backend, (2) chốt pattern render chuẩn.

## Quyết định người dùng đã chốt

| Quyết định | Chọn |
|---|---|
| Phạm vi vòng | **1 page mẫu**: `ProductDetailPage` |
| Loading UX | **Skeleton đơn giản** (placeholder xám theo layout) |
| Related blog | (không áp dụng cho product; product related lấy qua `useProducts(category)`) |
| Type component con | **Đổi `ProductCard`/`RelatedProducts` sang type `Product` backend** (bỏ type FE trùng) |

## Page mẫu: ProductDetailPage — hiện trạng

Đọc `src/pages/ProductDetailPage.tsx`:
- `getProductBySlug(slug)` → product (sync, undefined nếu không có → `Navigate to="/menu"`).
- `getRelatedProducts(product, 4)` → 4 product cùng category.
- Render: ảnh (lightbox), name, description, `formatPrice(price)` hoặc 'Liên hệ',
  nút gọi điện, `RelatedProducts`.

## Kiến trúc sau khi nối

```tsx
// ProductDetailPage — pattern mẫu
const { slug } = useParams();
const { data: product, isLoading, isError } = useProduct(slug ?? '');

usePageMeta(product?.name ?? 'Menu', product?.description);  // hook meta vẫn gọi vô điều kiện

if (isLoading) return <ProductDetailSkeleton />;
if (isError || !product) return <Navigate to="/menu" replace />;  // 404 → redirect như cũ

// related: cùng category đầu tiên của product
const { data: related = [] } = useProducts(product.categories[0]);
const relatedFiltered = related.filter(p => p.slug !== product.slug).slice(0, 4);
```

**Điểm cần cẩn thận (React hooks):** `useProducts` cho related phụ thuộc `product`
(chưa có lúc loading). Không được gọi hook sau `return` (vi phạm rules-of-hooks).
Giải: gọi `useProducts(product?.categories[0])` vô điều kiện, dùng `enabled: !!product`
trong service — HOẶC tách related ra component con `<RelatedProducts>` tự gọi hook.
**Khuyến nghị: tách component con tự fetch** — sạch hơn, đúng nguyên tắc "component tự
lo nghiệp vụ của nó qua hook".

## Ba điểm lệch dữ liệu — áp dụng cho product

1. **Date**: ProductDetail KHÔNG có date → bỏ qua ở page này (sẽ xử lý ở blog).
2. **Price/priceEstimated**: type BE `price: number` (nonnegative), `priceEstimated: boolean`
   (bắt buộc). `formatPrice` nhận `number` — OK. `ProductCard` check `price !== null`
   nhưng type không nullable → giữ nguyên logic, không cần null-check thực (an toàn thừa).
3. **Async**: sync → hook. Loading skeleton + error→Navigate. Đây là phần chính vòng này.

## Type boundary — điểm blast phải xử lý

`ProductCard`/`RelatedProducts` hiện `import type { Product } from '../../data'` (FE).
So sánh 2 type `Product`:

| Field | FE (`src/data/types.ts`) | Backend (`products.schemas.ts`) |
|---|---|---|
| `priceEstimated` | `?: boolean` (optional) | `: boolean` (**bắt buộc**) |
| còn lại | giống hệt | giống hệt |

**Blast khi đổi `ProductCard` sang type backend:** `ProductCard` còn dùng ở
**HomePage + MenuPage** (vẫn đọc data tĩnh). Data tĩnh trong `src/data/products.ts`
có thể **thiếu** `priceEstimated` ở một số product (vì FE type cho optional) → đổi
type sẽ gây lỗi TS ở 2 page tĩnh đó.

**Ba cách xử lý blast (chốt lúc plan):**
- (a) Kiểm tra data tĩnh: nếu mọi product đều có `priceEstimated` → đổi type an toàn,
  không lỗi. (Cần verify `src/data/products.ts` lúc plan.)
- (b) Nếu thiếu: bổ sung `priceEstimated: false` cho product thiếu trong data tĩnh
  (rẻ, 1 lần).
- (c) Giữ `ProductCard` nhận type FE, chỉ page mẫu map — nhưng người dùng đã loại
  hướng map (kém DRY).

→ Khuyến nghị: (a) verify trước; nếu cần thì (b). Không (c).

## Skeleton

Tạo `ProductDetailSkeleton` (hoặc inline): khối xám cho ảnh (vuông), name (thanh),
price (thanh ngắn), grid 4 ô cho related. Dùng `animate-pulse` + `bg-gray-100`
(Tailwind sẵn có). Không thêm thư viện skeleton.

## Related code files (dự kiến, chốt lúc plan)

- Modify: `src/pages/ProductDetailPage.tsx` — dùng `useProduct`, skeleton, error→Navigate.
- Modify: `src/components/ui/ProductCard.tsx` — đổi import type sang backend.
- Modify: `src/components/menu/RelatedProducts.tsx` — đổi type + (có thể) tự fetch.
- Verify/Modify: `src/data/products.ts` — bổ sung `priceEstimated` nếu thiếu (blast a/b).
- Có thể tạo: `src/components/menu/ProductDetailSkeleton.tsx`.

## Ngoài phạm vi (vòng này)

- HomePage, BlogIndex, BlogDetail, StoreDetail — vòng sau.
- Xóa `src/data/index.ts` — chỉ xóa khi page cuối rời khỏi.
- Blog date format, related blog — thuộc vòng blog.

## Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Rules-of-hooks khi related phụ thuộc product | Tách `<RelatedProducts>` tự fetch, hoặc `enabled` |
| Đổi `ProductCard` type làm HomePage/MenuPage lỗi TS | Verify `products.ts` có đủ `priceEstimated`; bổ sung nếu thiếu |
| Backend chưa chạy khi dev → API fail | Proxy đã cấu hình; test với `server` chạy `:8080` |
| Related dùng `useProducts(category)` trả cả product hiện tại | filter bỏ slug hiện tại (như logic cũ) |

## Tiêu chí hoàn thành

- `ProductDetailPage` đọc API qua `useProduct`; không còn `import from '../data'`
  cho product (trừ khi related tách riêng).
- Loading hiện skeleton; slug sai → Navigate /menu; lỗi API → xử lý (Navigate hoặc thông báo).
- `ProductCard`/`RelatedProducts` dùng type backend; HomePage/MenuPage vẫn build sạch.
- `npm run build` + `npm run lint` sạch.
- Verify runtime: `npm run dev` + backend `:8080`, mở 1 product, thấy data từ API.

## Câu chưa chốt (giải lúc plan)

- `src/data/products.ts` có đủ `priceEstimated` mọi product không? (quyết blast a vs b)
- Related tách component tự fetch hay page truyền xuống? (khuyến nghị tách)
- Lỗi API (không phải 404) thì Navigate hay hiện thông báo lỗi + retry? (blog đã có mẫu retry)
