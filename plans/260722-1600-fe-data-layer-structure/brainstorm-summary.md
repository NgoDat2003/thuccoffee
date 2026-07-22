# Brainstorm — Kiến trúc data-layer FE (structure, chưa implement vào component)

**Ngày:** 2026-07-22
**Phạm vi:** Thêm thư viện + dựng structure (api client, query layer, provider,
service theo tài nguyên). CHƯA implement vào component. Đây là phần đầu của bước 3
("Frontend đọc từ API") trong `docs/backend-architecture.md`.

## Vấn đề

FE hiện đọc dữ liệu tĩnh qua hàm sync trong `src/data/index.ts`. Backend đã có 9
read API (`ApiResponse<T>` envelope). Cần dựng lớp data-fetching để vòng sau page
chuyển sang gọi API mà không lẫn nghiệp vụ vào component.

Yêu cầu người dùng: **component chỉ render, mọi nghiệp vụ nằm trong hooks**. Tham
chiếu pattern dự án `inno-pos` (`d:/work/inno-pos`).

## Quyết định người dùng đã chốt (không tự đảo)

| Quyết định | Chọn |
|---|---|
| Ranh giới dữ liệu | **Bỏ** `src/data/index.ts` làm ranh giới; theo service+hook inno-pos |
| Bố cục | `src/services/` + `src/lib/api/` + `src/providers/` (theo inno-pos) |
| Unwrap envelope | Ở **interceptor axios** (service chỉ thấy data sạch) |
| Thư viện | `@tanstack/react-query` **v5** + `axios` |
| Bước sau | Viết design → `/ck:plan` |

## Pattern học từ inno-pos

- `lib/api/axios.ts`: tạo axios instance, interceptor.
- `services/*.service.ts`: **mỗi tài nguyên một file**, chứa `queryKeys` factory +
  type + các hook `useQuery`. Nghiệp vụ fetch nằm hết ở đây.
- `providers/`: tạo `QueryClient`, bọc `QueryClientProvider`.
- Component chỉ gọi hook + render.

Khác biệt cố ý so với inno-pos:
- inno-pos dùng React Query **v4**; ta dùng **v5** (`keepPreviousData` → `placeholderData`).
- inno-pos unwrap thủ công `.then(r => r.message)` ở mỗi service; ta unwrap ở
  **interceptor** cho DRY.
- inno-pos gắn với Frappe (FrappeContext, CSRF token, socket); ta không có — provider
  tối giản chỉ QueryClient.

## Thư viện

| Gói | Loại | Lý do |
|---|---|---|
| `@tanstack/react-query` v5 | dependency | Cache, loading/error, dedupe, invalidate (admin phase sau) |
| `axios` | dependency | HTTP client + interceptor unwrap |
| `@tanstack/react-query-devtools` v5 | devDependency (tùy chọn) | Debug cache; rẻ |

**Không thêm** ở vòng này (YAGNI): `zod` FE (type import thẳng từ backend), retry lib
(RQ lo), OpenAPI/Orval (docs đã loại ở quy mô ~15 endpoint).

## Cấu trúc thư mục

```
src/
├── lib/api/
│   ├── axios.ts          # axios instance: baseURL từ env, interceptor unwrap ApiResponse<T>
│   ├── api-error.ts      # class ApiError { code, message, details }
│   └── index.ts          # barrel export
├── providers/
│   └── query-provider.tsx  # QueryClient + QueryClientProvider + defaultOptions
├── services/
│   ├── products.service.ts
│   ├── blog.service.ts
│   ├── stores.service.ts
│   ├── categories.service.ts
│   ├── banners.service.ts
│   └── site-settings.service.ts
└── data/                 # GIỮ song song tới khi page chuyển xong; xóa index.ts ở vòng sau
```

## Ba lớp — trách nhiệm

### 1. `lib/api/axios.ts` — client + unwrap

- `baseURL` từ `import.meta.env.VITE_API_BASE_URL` (mặc định `/api`).
- **Dev**: cần Vite proxy `/api` → `http://localhost:8080` (thêm vào `vite.config.ts`),
  hoặc set `VITE_API_BASE_URL=http://localhost:8080/api`. Chọn proxy để tránh CORS
  và giữ URL tương đối.
- Response interceptor đọc `ApiResponse<T>`:
  - `success: true` → giữ nguyên `{ data, meta? }` (KHÔNG vứt `meta` — blog cần phân trang).
  - `success: false` → `throw new ApiError(error.code, error.message, error.details)`.
- Helper `get<T>()` trả `data` cho endpoint không phân trang; blog service tự đọc `meta`.

### 2. `services/*.service.ts` — theo tài nguyên

Mỗi file tự đủ: `queryKeys` factory + type (import từ backend) + hook `useQuery`.

Ví dụ `products.service.ts`:
```ts
import type { Product } from '../../server/src/modules/products/products.schemas';
export const productKeys = {
  all: ['products'] as const,
  list: (category?: string) => [...productKeys.all, 'list', { category }] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
};
export function useProducts(category?: string) { /* useQuery */ }
export function useProduct(slug: string) { /* enabled: !!slug */ }
```

Map endpoint → service:
| Service | Hook | Endpoint |
|---|---|---|
| products | `useProducts(category?)`, `useProduct(slug)` | `GET /api/products`, `/products/:slug` |
| blog | `useBlogPage(page)`, `useBlogPost(slug)` | `GET /api/blog?page=`, `/blog/:slug` |
| stores | `useStores()`, `useStore(slug)` | `GET /api/stores`, `/stores/:slug` |
| categories | `useCategories()` | `GET /api/categories` |
| banners | `useBanners()` | `GET /api/banners` |
| site-settings | `useSiteSettings()` | `GET /api/site-settings` |

### 3. `providers/query-provider.tsx`

- Tạo `QueryClient` với `defaultOptions`: `staleTime` ~5 phút (nội dung ít đổi),
  `retry: 1`, `refetchOnWindowFocus: false`.
- Bọc ở `main.tsx`: `<QueryProvider><RouterProvider .../></QueryProvider>`.

## Ba điểm lệch dữ liệu (ghi lại cho vòng implement)

1. **`date`**: BE trả ISO datetime; FE hiện hiển thị `'03.06.2026'` → format lại
   (dùng `src/lib/format.ts`).
2. **`price`/`priceEstimated`**: type BE khác chút type FE → dùng type BE, bỏ type FE trùng.
3. **Async**: hàm sync → hook trả `{ data, isLoading, error }` → component xử lý loading/error.

## Ảnh hưởng tài liệu / quy ước

- **CLAUDE.md** có quy ước "src/data/index.ts là ranh giới với backend, chỉ đổi ruột
  hàm". Quyết định này **thay** ranh giới bằng service+hook → phải cập nhật đoạn đó
  trong CLAUDE.md (mục "Quy ước không đọc code là biết" và mục backend).
- `docs/backend-architecture.md` mục "Ảnh hưởng tới frontend" nhắc TanStack Query —
  khớp; có thể bổ sung structure mới.

## Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Structure sống song song data tĩnh → hai nguồn sự thật tạm thời | Chấp nhận trong 1 vòng; vòng sau xóa `index.ts` khi page cuối rời |
| FE import type từ `server/` — path/tsconfig | Verify `tsconfig.app.json` include được path `../server/...`; nếu không, cân nhắc alias |
| Dev không gọi được API (CORS/port) | Vite proxy `/api` → `:8080` |
| Đổi quy ước CLAUDE.md gây nhầm cho session sau | Cập nhật CLAUDE.md trong cùng plan |

## Tiêu chí hoàn thành (structure vòng này)

- `npm install` thêm 2–3 gói, `package.json` sạch.
- `src/lib/api/`, `src/providers/query-provider.tsx`, `src/services/*.service.ts` tồn tại.
- `main.tsx` bọc `QueryProvider`.
- `npm run build` + `npm run lint` sạch (structure compile được, kể cả khi chưa page nào dùng).
- **KHÔNG** sửa page/component nào ở vòng này.
- CLAUDE.md cập nhật quy ước ranh giới.

## Câu chưa chốt

- Dev API access: Vite proxy hay `VITE_API_BASE_URL`? (khuyến nghị proxy) — chốt lúc plan.
- Có thêm `react-query-devtools` không? (khuyến nghị có, devDependency).
- FE import type từ `server/` có vướng tsconfig `include: ["src"]` không — cần verify khi implement.
