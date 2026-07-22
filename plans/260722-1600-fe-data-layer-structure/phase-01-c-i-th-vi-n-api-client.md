---
phase: 1
title: "Cài thư viện & api client"
status: completed
priority: P2
effort: "1-2h"
dependencies: []
---

# Phase 1: Cài thư viện & api client

## Overview

Thêm `@tanstack/react-query` v5 + `axios` (và devtools v5 devDependency), dựng
`src/lib/api/` gồm axios instance + interceptor unwrap `ApiResponse<T>` + `ApiError`,
và Vite proxy `/api` → backend cho dev.

## Requirements

- Functional: axios instance có `baseURL`, interceptor bóc envelope backend, ném
  `ApiError` khi `success:false`; giữ `meta` cho endpoint phân trang.
- Non-functional: không sửa page/component; `npm run build` + `npm run lint` sạch.

## Architecture

Backend bọc mọi response trong `ApiResponse<T>` (`server/src/common/api-response.ts`):
```ts
type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: { code: string; message: string; details?: unknown } };
```

Interceptor xử lý:
- `success:true` → trả **nguyên** `res.data` (`{ data, meta? }`) để service phân trang
  đọc được `meta`. Service không phân trang tự lấy `.data`.
- `success:false` → `throw new ApiError(code, message, details)`. TanStack Query bắt
  làm `error`.

Dev API access: **Vite proxy** `/api` → `http://localhost:8080` (tránh CORS, giữ URL
tương đối). `baseURL` mặc định `/api`, override được bằng `VITE_API_BASE_URL`.

## Related Code Files

- Create: `src/lib/api/api-error.ts` — class `ApiError extends Error { code; details }`.
- Create: `src/lib/api/axios.ts` — tạo instance + request/response interceptor + helper
  `apiGet<T>(url, config)` trả `T`, `apiGetPaginated<T>(url, config)` trả `{ data, meta }`.
- Create: `src/lib/api/index.ts` — barrel export.
- Modify: `vite.config.ts` — thêm `server.proxy['/api']`.
- Modify: `package.json` — deps mới (do `npm install` sinh).

## Implementation Steps

1. `npm install @tanstack/react-query axios` và
   `npm install -D @tanstack/react-query-devtools`. Xác nhận version RQ là `^5`.
2. Viết `src/lib/api/api-error.ts`:
   ```ts
   export class ApiError extends Error {
     constructor(
       public code: string,
       message: string,
       public details?: unknown,
     ) {
       super(message);
       this.name = 'ApiError';
     }
   }
   ```
3. Viết `src/lib/api/axios.ts`:
   - `const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';`
   - `axios.create({ baseURL, headers: { Accept: 'application/json' } })`.
   - Response interceptor: nếu `res.data.success === true` trả `res.data`; nếu
     `false` `throw new ApiError(...)`. Nhánh `error` của interceptor (network/HTTP)
     cũng chuẩn hoá về `ApiError` nếu payload có envelope lỗi.
   - Export `apiGet<T>(url, config?): Promise<T>` = `instance.get(url, config).then(r => (r as any).data)`
     và `apiGetPaginated<T>` giữ cả `meta`. (Kiểu hoá cẩn thận vì interceptor đổi shape.)
4. `src/lib/api/index.ts`: `export * from './axios'; export * from './api-error';`
5. `vite.config.ts`: thêm
   ```ts
   server: { proxy: { '/api': 'http://localhost:8080' } }
   ```
6. Chạy `npm run build` + `npm run lint`.

## Success Criteria

- [x] `@tanstack/react-query` (v5) + `axios` trong `dependencies`; devtools trong `devDependencies`.
- [x] `src/lib/api/{axios,api-error,index}.ts` tồn tại, export đúng.
- [x] Interceptor giữ `meta`, ném `ApiError` ở nhánh `success:false`.
- [x] `vite.config.ts` có proxy `/api`.
- [x] `npm run build` + `npm run lint` sạch; không page/component nào bị sửa.

## Risk Assessment

- **Interceptor đổi shape response → kiểu axios sai.** Axios generic `get<T>` giả
  định trả `AxiosResponse<T>`; interceptor lại trả `res.data`. Giảm thiểu: bọc trong
  helper `apiGet<T>` tự cast + kiểu hoá rõ ràng, không để service dùng thẳng `instance.get`.
- **RQ cài nhầm v4.** Xác nhận `^5` sau install; v5 dùng object syntax + `placeholderData`.
