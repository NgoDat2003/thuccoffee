# Brainstorm — Chuyển full FE tĩnh → API (nhóm A)

**Ngày:** 2026-07-22
**Nhánh:** `feat/fe-product-detail-api` (đã có ProductDetail; giữ trên working tree rồi làm tiếp)
**Phạm vi:** Chuyển **toàn bộ page/component có API tương ứng** (nhóm A) sang đọc
TanStack Query. Check một thể ở cuối. Nhóm B (pages.ts) giữ tĩnh.

## Vấn đề & phản biện

Người dùng muốn "full FE tĩnh → động hết". **Không khả thi trọn vẹn:** 6 page đọc
`src/data/pages.ts` (About, Careers, Contact, Cookie, Delivery, Membership) — backend
**không có** endpoint `pages`. "Full" thực tế = nhóm có API.

Backend có 6 content endpoint: `products, categories, banners, stores, blog, site-settings`.

## Quyết định người dùng đã chốt

| Quyết định | Chọn |
|---|---|
| Nhóm B (pages.ts) | **Giữ tĩnh, ngoài phạm vi** — không có API |
| Cách làm nhóm A | **1 nhánh, chia phase theo tài nguyên**, check 1 thể cuối |
| ProductDetail hiện tại | **Giữ trên working tree** (đã verify PASS), rồi chồng lên; không commit/push trong cook |
| Date blog | `formatDate()` vào `src/lib/format.ts` |
| Category | Chuyển `useCategories()` cho **mảng label**, GIỮ `category-paths.ts` (routing) |

## Phân loại (đã scout)

**Nhóm A — chuyển (có API):**
| Page | Data | Hook |
|---|---|---|
| MenuPage | products theo category + category labels | `useProducts(cat)`, `useCategories()` |
| StoreListPage | stores[0] + list | `useStores()` |
| StoreDetailPage | store theo slug + list (BranchSelector) | `useStore(slug)`, `useStores()` |
| BlogIndexPage | blog phân trang | `useBlogPage(page)` |
| BlogDetailPage | blog detail + related + content | `useBlogPost(slug)`, `useBlogPage(1)` (related) |
| HomePage | featured products + blog + stores (qua component con) | nhiều hook |

**Component nhóm A:** BlogCard, BlogPagination, BlogCarousel, StoreLocator, CategoryDropdown,
CategorySidebar, BranchSelector, StoreCard, DesktopNav.

**Nhóm B — GIỮ TĨNH (không API):** About, Careers, Contact, Cookie, Delivery, Membership
(đọc `pages.ts`).

## Ranh giới sống còn (đã verify — không được phá)

**`category-paths.ts` là ROUTING config, KHÔNG phải content.** Slug `-t5p1s549` khớp
site gốc (CLAUDE.md cấm đổi). `categoryHref`/`isCategoryPath`/`categoryKeyFromPath`
dùng ở `routes.tsx` + MenuPage. **GIỮ NGUYÊN.** Chỉ chuyển mảng `categories` ({key,label})
sang `useCategories()`.

## Kiến trúc — pattern chung (từ ProductDetail đã chốt)

- Page gọi hook → `if (isLoading) return <Skeleton/>` → `if (isError) return <Navigate/>`
  (hoặc thông báo lỗi) → render.
- Hook trước mọi return (rules-of-hooks).
- Component "list con" tự fetch (như RelatedProducts) khi hợp lý.
- Skeleton `animate-pulse bg-gray-100` theo layout, không thêm lib.

## 3 điểm lệch dữ liệu

1. **Date (blog)**: API trả ISO; thêm `formatDate(iso): 'DD.MM.YYYY'` vào `format.ts`;
   BlogCard + BlogDetail gọi.
2. **Price (product)**: xong ở vòng trước (type BE).
3. **Async**: sync → hook. Loading/error mọi page.

## Chia phase (đề xuất — chốt lúc plan)

- **Phase 0**: checkpoint ProductDetail hiện tại bằng build/lint; không commit/push.
- **Phase 1 — Menu + Category**: MenuPage, CategorySidebar/Dropdown, DesktopNav →
  `useProducts`/`useCategories`. Giữ category-paths.
- **Phase 2 — Store**: StoreListPage, StoreDetailPage, StoreLocator, BranchSelector,
  StoreCard → `useStores`/`useStore`.
- **Phase 3 — Blog**: BlogIndexPage (phân trang từ meta, bỏ BLOG_PAGE_COUNT hardcode),
  BlogDetailPage (date, related, content), BlogCard, BlogPagination, BlogCarousel +
  `formatDate`.
- **Phase 4 — Home**: HomePage qua các component con (đa số đã chuyển ở phase trên).
- **Phase 5 — Dọn + verify full**: xóa dần `src/data/index.ts`/mảng đã hết dùng (giữ
  pages.ts, category-paths.ts, types còn dùng); build/lint/runtime một thể.

## Điểm khó từng tài nguyên (đã scout)

- **MenuPage**: category đổi client-side (không đổi route) → refetch `useProducts(cat)`.
- **StoreList/Detail**: `StoreDetailView` dùng chung, cần `stores` list cho BranchSelector.
- **BlogIndex**: `useBlogPage` trả `{data, meta}` — dùng `meta.totalPages` thay
  `BLOG_PAGE_COUNT=54` hardcode.
- **BlogDetail**: related từ `useBlogPage(1)`; content HTML — hiện lazy-load
  `blog-content.ts`, API detail đã trả `content` → chuyển sang API content.
- **StoreLocator/BranchSelector**: stateful (selectedIndex) → giữ state, đổi nguồn data.

## Ngoài phạm vi

- Nhóm B (pages.ts 6 page) — giữ tĩnh.
- `category-paths.ts` — giữ (routing).
- Thêm endpoint backend mới — không.
- Auth/admin — vòng sau.

## Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Blast lớn (5 page + 9 component) 1 nhánh | Chia phase theo tài nguyên; mỗi phase verify build+runtime trước khi sang |
| Phá routing khi đụng category | GIỮ category-paths.ts; chỉ chuyển mảng label |
| Blog content: lazy-load vs API | API detail trả content; chuyển sang API, bỏ lazy blog-content.ts (kiểm kỹ) |
| Date format lệch định dạng | 1 hàm `formatDate` dùng chung |
| Xóa data tĩnh làm gãy nhóm B | Chỉ xóa mảng/hàm KHÔNG còn ai dùng; pages.ts + category-paths giữ nguyên |
| StrictMode / refetch khi đổi category | TanStack Query cache theo queryKey; ổn |

## Tiêu chí hoàn thành

- Mọi page nhóm A đọc API qua hook; không còn `import from '../data'` cho products/
  blog/stores/categories (label).
- Nhóm B giữ nguyên đọc pages.ts; `category-paths.ts` giữ nguyên.
- Loading skeleton + error mọi page; blog phân trang từ meta; date format đúng.
- `npm run build` + `npm run lint` sạch; runtime verify với backend thật (compose đang chạy).
- `src/data/types.ts`: xóa dần type đã chuyển sang BE (BlogPost/Store nếu hết dùng).

## Câu chưa chốt (giải lúc plan)

- BlogDetail: bỏ hẳn lazy-load `blog-content.ts` sang API content, hay giữ song song? (khuyến nghị bỏ, dùng API)
- HomePage BlogCarousel/StoreLocator: lỗi API thì ẩn section hay hiện skeleton? (component con, có thể ẩn)
- Xóa `src/data/products.ts`/`blog.ts`/`stores.ts` (mảng) ở phase 5 hay giữ tới khi chắc? (khuyến nghị giữ tới cuối, xóa khi grep 0 ref)
