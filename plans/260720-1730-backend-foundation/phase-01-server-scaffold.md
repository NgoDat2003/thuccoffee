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

## File tạo mới

- `server/package.json` — deps riêng, script `dev`, `build`, `lint`
- `server/tsconfig.json` — target Node, không có JSX
- `server/.oxlintrc.json` — không bật plugin react
- `server/.env.example` — tên biến, không có giá trị thật
- `server/src/index.ts` — Express khởi tạo, tạm thời chỉ có `/api/health`

## File sửa

- `.dockerignore` — thêm `server`
- `.oxlintrc.json` — thêm `ignorePatterns` cho `server/`
- `.gitignore` — thêm `server/node_modules`, `server/dist`, `.env`
- `compose.yaml` — đổi cổng frontend từ `8080` sang `3000`
- `README.md` — cập nhật cổng frontend
- `docs/backend-architecture.md` — đổi `PORT=4000` thành `8080`
- `docs/local-environment-and-ci.md` — bỏ phần nói cổng tránh Dokploy

## Các bước

1. Tạo `server/package.json` với `express`, `zod`, `drizzle-orm`, `pg`,
   `dotenv`; dev deps `typescript`, `tsx`, `@types/*`, `oxlint`.
2. Tạo `server/tsconfig.json`: `module: nodenext`, `strict: true`, `outDir: dist`.
3. Tạo `server/.oxlintrc.json` chỉ bật plugin `typescript` và `oxc`.
4. Viết `server/src/index.ts`: Express nghe `PORT` (mặc định `8080`), một route
   `GET /api/health` trả `{ status: 'ok' }`.
5. Tạo `server/.env.example` với `DATABASE_URL`, `PORT`, `NODE_ENV`.
6. Sửa `.dockerignore`, `.oxlintrc.json`, `.gitignore`.
7. Đổi cổng frontend trong `compose.yaml` và `README.md`.
8. Cập nhật hai file docs cho khớp cổng mới.
9. Chạy `npm install` trong `server/`, khởi động, gọi thử `/api/health`.
10. Chạy `npm run lint` và `npm run build` ở gốc, xác minh không đụng `server/`.

## Todo

- [ ] `server/package.json`
- [ ] `server/tsconfig.json`
- [ ] `server/.oxlintrc.json`
- [ ] `server/.env.example`
- [ ] `server/src/index.ts` với `/api/health`
- [ ] Sửa `.dockerignore`
- [ ] Sửa `.oxlintrc.json` gốc
- [ ] Sửa `.gitignore`
- [ ] Đổi cổng frontend sang `3000`
- [ ] Cập nhật `README.md` và hai file docs
- [ ] Xác minh `/api/health` trả 200
- [ ] Xác minh lint/build gốc không quét `server/`

## Tiêu chí hoàn thành

- `curl http://127.0.0.1:8080/api/health` trả `200` và `{"status":"ok"}`.
- `npm run lint` ở gốc không báo lỗi nào thuộc `server/`.
- `npm run build` ở gốc vẫn thành công.
- `docker build .` không copy `server/` vào image frontend.
- Không có `.env` nào bị commit.

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Xung đột phiên bản TypeScript giữa hai package | Mỗi bên có `node_modules` riêng, không dùng chung |
| Quên `server/node_modules` trong `.gitignore` | Kiểm tra `git status` sau khi cài |
| Đổi cổng frontend làm hỏng tài liệu khác | Grep `8080` toàn repo trước khi kết thúc phase |
