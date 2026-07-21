---
phase: 1
title: "Dựng server và dọn cấu hình gốc"
status: completed
priority: P1
dependencies: []
---

# Phase 1 — Dựng server và dọn cấu hình gốc

Trạng thái: Pending
Ưu tiên: P1

## Bối cảnh

- Kiến trúc và stack: `docs/backend-architecture.md`
- Mục "Cấu hình gốc cần sửa khi thêm server/" trong tài liệu trên

## Mục tiêu

Tạo khung `server/` chạy được, và chặn bốn file cấu hình gốc không chạm vào nó.

## Vì sao phải dọn cấu hình gốc

Bốn file ở thư mục gốc hiện áp dụng cho toàn repo:

| File | Nếu để nguyên |
|---|---|
| `.dockerignore` | `Dockerfile` frontend dùng `COPY . .` nên copy cả `server/` vào image, image phình vô ích |
| `.oxlintrc.json` | Bật plugin `react`, sẽ quét code backend vốn không có React và báo lỗi sai |
| `.github/workflows/ci.yml` | Chỉ build frontend, code backend hỏng vẫn xanh |
| `compose.yaml` | Chưa có postgres và backend |

`tsconfig.app.json` đã giới hạn `include: ["src"]` nên không cần sửa.

## Thư viện

Danh sách đầy đủ kèm lý do: `docs/backend-architecture.md` mục "Thư viện".

Phase này chỉ cài phần cần để server chạy được:

| Nhóm | Gói |
|---|---|
| Chạy | `express`, `dotenv`, `zod` |
| Bảo mật, vận hành | `helmet`, `compression`, `cors`, `pino`, `pino-http` |
| Dev | `typescript`, `tsx`, `oxlint`, `@types/express`, `@types/node`, `@types/cors`, `@types/compression` |

Chưa cài `drizzle-orm`, `pg` (phase 3) và `argon2`, `jsonwebtoken` (giai đoạn
auth). Cài sớm chỉ làm nặng lockfile mà chưa dùng tới.

`helmet` và `compression` gắn ngay từ đầu vì thêm sau dễ quên; cả hai đều là
thứ dự án QA/QC đang chạy.

## File tạo mới

- `server/package.json` — deps riêng, script `dev`, `build`, `lint`
- `server/tsconfig.json` — target Node, không có JSX
- `server/.oxlintrc.json` — không bật plugin react
- `server/.env.example` — tên biến, không có giá trị thật
- `server/src/index.ts` — dựng Express, gắn middleware, đăng ký route
- `server/src/common/env.ts` — validate biến môi trường bằng Zod lúc khởi động
- `server/src/common/api-response.ts` — kiểu `ApiResponse<T>` và hàm dựng phản hồi
- `server/src/common/api-error.ts` — lớp lỗi mang `statusCode` và `code`
- `server/src/common/error-handler.ts` — chuẩn hoá mọi lỗi về một hình dạng
- `server/src/modules/health/health.routes.ts` — `GET /api/health`

## Cấu trúc thư mục

Đóng gói theo tài nguyên, không gom theo loại file:

```
server/src/
├── index.ts
├── common/          env, error handler, middleware dùng chung
├── modules/         mỗi tài nguyên một thư mục
│   └── health/
└── db/              thêm ở phase 3
```

Mỗi module sau này gồm `*.routes.ts`, `*.service.ts`, và một `schemas.ts` chứa
cả bốn loại schema (create, update, list-query, response). Không tách bốn file
riêng như dự án QA/QC — Zod đủ gọn để gộp, và `.partial()` với `.extend()` cho
phép suy ra update và response từ create mà không lặp khai báo.

## Hình dạng phản hồi — làm ngay từ phase này

Đặc tả đầy đủ: `docs/backend-architecture.md` mục "Hình dạng phản hồi".

Mọi phản hồi có body đều bọc trong `ApiResponse<T>`:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

Ba mảnh cần dựng:

| File | Việc |
|---|---|
| `api-response.ts` | Kiểu `ApiResponse<T>`, hàm `ok(data)` và `okPaginated(data, meta)` |
| `api-error.ts` | Lớp `ApiError(statusCode, code, message, details?)` để service ném ra |
| `error-handler.ts` | Middleware cuối chuỗi, bắt mọi ngoại lệ và bọc lại |

Làm sớm vì mọi route thêm sau đều dựa vào nó; sửa muộn phải sờ lại tất cả.

Hai điều dễ làm sai:

- HTTP status phải giữ đúng ngữ nghĩa. `404` vẫn là `404`, không phải `200` kèm
  `success: false`.
- Ngoại lệ ngoài dự tính phải thành `500` với `code: INTERNAL_ERROR` và thông
  báo chung, không rò rỉ stack trace ra client.

## File sửa

- `.dockerignore` — thêm `server`
- `.oxlintrc.json` — thêm `ignorePatterns` cho `server/`
- `.gitignore` — thêm `server/node_modules`, `server/dist`, `.env`
- `compose.yaml` — đổi cổng frontend từ `8080` sang `3000`
- `README.md` — cập nhật cổng frontend
- `docs/local-environment-and-ci.md` — bỏ phần nói cổng tránh Dokploy

## Các bước

1. Tạo `server/package.json` với các gói ở mục Thư viện, script `dev` (tsx
   watch), `build`, `lint`.
2. Tạo `server/tsconfig.json`: `module: nodenext`, `strict: true`, `outDir: dist`.
3. Tạo `server/.oxlintrc.json` chỉ bật plugin `typescript` và `oxc`.
4. Viết `server/src/common/env.ts`: schema Zod cho `PORT`, `NODE_ENV`,
   `DATABASE_URL`; thoát với thông báo rõ ràng nếu thiếu biến.
5. Viết `server/src/common/api-response.ts`: kiểu `ApiResponse<T>` cùng hàm
   `ok()` và `okPaginated()`.
6. Viết `server/src/common/api-error.ts`: lớp `ApiError` mang `statusCode`,
   `code`, `message`, `details` tuỳ chọn.
7. Viết `server/src/common/error-handler.ts`: bắt `ApiError` trả đúng status của
   nó; ngoại lệ khác thành `500` với `code: INTERNAL_ERROR` và thông báo chung.
8. Viết `server/src/modules/health/health.routes.ts` trả `ok({ status: 'ok' })`.
9. Viết `server/src/index.ts`: gắn `helmet`, `compression`, `cors`, `pino-http`,
   đăng ký route health, gắn error handler cuối cùng, nghe `PORT` mặc định `8080`.
10. Tạo `server/.env.example` với `DATABASE_URL`, `PORT`, `NODE_ENV`.
11. Sửa `.dockerignore`, `.oxlintrc.json`, `.gitignore`.
12. Đổi cổng frontend trong `compose.yaml` và `README.md` sang `3000`.
13. Cập nhật `docs/local-environment-and-ci.md` — bỏ phần nói cổng tránh Dokploy.
14. Chạy `npm install` trong `server/`, khởi động, gọi thử `/api/health`.
15. Gọi một đường dẫn không tồn tại, xác nhận lỗi đúng hình dạng bọc.
16. Chạy `npm run lint` và `npm run build` ở gốc, xác minh không đụng `server/`.

## Todo

- [x] `server/package.json`
- [x] `server/tsconfig.json`
- [x] `server/.oxlintrc.json`
- [x] `server/.env.example`
- [x] `server/src/common/env.ts` validate bằng Zod
- [x] `server/src/common/api-response.ts` với `ApiResponse<T>`, `ok()`
- [x] `server/src/common/api-error.ts`
- [x] `server/src/common/error-handler.ts`
- [x] `server/src/modules/health/health.routes.ts`
- [x] `server/src/index.ts` với helmet, compression, cors, pino
- [x] Sửa `.dockerignore`
- [x] Sửa `.oxlintrc.json` gốc
- [x] Sửa `.gitignore`
- [x] Đổi cổng frontend sang `3000`
- [x] Cập nhật `README.md` và `docs/local-environment-and-ci.md`
- [x] Xác minh `/api/health` trả 200
- [x] Xác minh lỗi 404 đúng hình dạng chuẩn hoá
- [x] Xác minh thiếu biến môi trường thì server báo lỗi rõ ràng
- [x] Xác minh lint/build gốc không quét `server/`

## Tiêu chí hoàn thành

- `curl http://127.0.0.1:8080/api/health` trả `200` và
  `{"success":true,"data":{"status":"ok"}}`.
- Gọi đường dẫn không tồn tại trả HTTP `404` kèm
  `{"success":false,"error":{"code":"NOT_FOUND",...}}` — status là `404`, không
  phải `200`.
- Ném lỗi bất kỳ trong một route thử nghiệm trả `500` với
  `code: INTERNAL_ERROR` và không lộ stack trace.
- Xoá một biến bắt buộc khỏi `.env` thì server dừng kèm thông báo nêu tên biến
  thiếu, không phải lỗi khó hiểu ở tầng sâu hơn.
- `npm run lint` ở gốc không báo lỗi nào thuộc `server/`.
- `npm run build` ở gốc vẫn thành công.
- `docker build .` không copy `server/` vào image frontend.
- Frontend qua Compose truy cập được ở cổng `3000`.
- Không có `.env` nào bị commit.

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Xung đột phiên bản TypeScript giữa hai package | Mỗi bên có `node_modules` riêng, không dùng chung |
| Quên `server/node_modules` trong `.gitignore` | Kiểm tra `git status` sau khi cài |
| Đổi cổng frontend làm hỏng tài liệu khác | Grep `8080` toàn repo trước khi kết thúc phase |
