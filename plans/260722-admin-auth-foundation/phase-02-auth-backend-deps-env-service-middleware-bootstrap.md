---
phase: 2
title: "Auth backend: deps/env/service/middleware/bootstrap"
status: completed
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Auth backend — deps/env/service/middleware/bootstrap

## Overview

Phase lõi. Deps auth, env validate, module auth (login/logout/me), middleware
guard `/api/admin/*`, CLI bootstrap admin. Sau phase này smoke:auth (Phase 1) xanh.

## Requirements

- Functional: 3 endpoint auth + guard + CLI create-admin hoạt động đúng hợp đồng
  Phase 1.
- Non-functional: server lint/build sạch; argon2 native build được (kiểm Docker);
  không lộ credential ở log/source/seed.

## Architecture

### Deps
- `argon2` (hash/verify password — không bcrypt).
- `jsonwebtoken` + `@types/jsonwebtoken` (ký/verify JWT).
- `cookie-parser` + `@types/cookie-parser` (đọc cookie từ request).

### Env (env.ts Zod — thêm)

<!-- Updated: Red Team — env.ts exit(1) chặn script bootstrap -->

- `JWT_SECRET`: z.string().min(32) — **bắt buộc** trong env chính (server không
  chạy thiếu secret; không làm optional — server chạy không secret = auth vỡ ngầm).
- **CHỐT (red-team):** `create-admin.ts` **KHÔNG import `env.ts`**. Vì `env.ts`
  chạy `safeParse(process.env)` + `process.exit(1)` ngay lúc import (env.ts:22,29)
  → nếu script kéo theo env.ts mà shell chưa set `JWT_SECRET`, script exit(1)
  TRƯỚC khi tạo admin. Script đọc `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`DATABASE_URL`
  trực tiếp từ `process.env` (hoặc schema Zod riêng chỉ cho script). Không đụng env.ts.

### Module `server/src/modules/auth/`
- `auth.schemas.ts`: `loginSchema` (email, password Zod); type `AuthUser` (email, role).
- `auth.service.ts`:
  - `login(email, password)`: query user theo email → `argon2.verify` → nếu sai
    (user không có HOẶC verify fail) ném `ApiError.unauthorized(<message chung>)`.
    **Cùng một message + cùng path** cho cả hai nhánh (chống enumeration + timing:
    verify một hash giả nếu user không tồn tại để cân thời gian — cân nhắc, ghi rõ).
  - `signToken(user)`: `jwt.sign({ sub, email, role }, JWT_SECRET, { expiresIn: '7d' })`.
  - `verifyToken(token)`: `jwt.verify` → trả payload hoặc ném unauthorized.
- `auth.routes.ts`:
  - `POST /login` → validate → service.login → `res.cookie(name, token, {...})` →
    ApiResponse `{ email, role }`.
  - `POST /logout` → `res.clearCookie(name)` → 204 (không body).
  - `GET /me` → requireAuth → trả `req.user`.

  <!-- Updated: Red Team — Express 5 async error forwarding -->
  **Async error (red-team):** Express **5.1.0** (verify: package.json) tự forward
  promise rejection từ async handler tới errorHandler — KHÁC Express 4. Nên
  auth.routes async chỉ cần `throw ApiError.unauthorized(...)`, KHÔNG cần try/catch
  thủ công hay next(err). `errorHandler` (error-handler.ts) đã map ApiError→status
  đúng (401). Smoke assert login sai → 401 (không 500) xác minh forwarding hoạt động.
- Cookie options: `{ httpOnly: true, sameSite: 'lax', secure: NODE_ENV==='production',
  maxAge: 7d, path: '/' }`. Tên cookie hằng số (vd `admin_token`).

### Middleware `requireAuth`
- `server/src/common/auth-middleware.ts` (hoặc trong module auth).
- Đọc cookie → `verifyToken` → gắn `req.user` → next(); thiếu/sai → `next(ApiError.unauthorized())`.
- Wire: `app.use('/api/admin', requireAuth, adminRoutes)` — adminRoutes phase này
  chỉ cần route placeholder tối thiểu để test guard (vd `GET /api/admin/me` trả user).

### CLI bootstrap `server/scripts/create-admin.ts`
- Đọc `ADMIN_EMAIL`/`ADMIN_PASSWORD` (env). Validate không rỗng.
- `argon2.hash(password)` → insert vào `users` (role 'admin').
- Idempotent: nếu email đã tồn tại → update hash hoặc báo đã có (không nhân đôi).
- Script `"create-admin": "tsx scripts/create-admin.ts"`.
- KHÔNG log password; KHÔNG hardcode; KHÔNG đặt trong db:seed.

### Wiring index.ts
- Thêm `app.use(cookieParser())` sau `express.json()`.
- `app.use('/api/auth', authRoutes)`.
- `app.use('/api/admin', requireAuth, adminRoutes)`.
- CORS: nếu FE cùng origin (nginx `/api` proxy) → không cần đổi. Nếu dev
  cross-origin → `cors({ origin, credentials: true })`. Chốt: dùng Vite proxy
  same-origin như `/api` hiện tại → giữ `cors()` mặc định. Ghi rõ trong impl.

## Related Code Files

- Create: `server/src/modules/auth/{auth.routes,auth.schemas,auth.service}.ts`,
  `server/src/common/auth-middleware.ts`, `server/src/modules/admin/admin.routes.ts`
  (placeholder tối thiểu), `server/scripts/create-admin.ts` (đọc process.env
  trực tiếp, KHÔNG import env.ts — tránh exit(1) khi thiếu JWT_SECRET)
- Modify: `server/src/common/env.ts` (JWT_SECRET + admin bootstrap env),
  `server/src/index.ts` (cookieParser + wire auth/admin), `server/package.json`
  (deps + script create-admin), `server/.env.example` (JWT_SECRET, ADMIN_* placeholder)
- Read for context: `server/src/common/api-error.ts`, `api-response.ts`,
  `server/src/modules/products/*` (module pattern), `server/src/db/schema.ts` (users)

## Implementation Steps

1. Cài deps (argon2, jsonwebtoken, cookie-parser + types).
2. Thêm JWT_SECRET + admin env vào env.ts (chốt optional/tách script).
3. Viết auth.schemas + auth.service (login/sign/verify) — message 401 chung.
4. Viết requireAuth middleware.
5. Viết auth.routes (login/logout/me) + admin.routes placeholder.
6. Wire index.ts: cookieParser, /api/auth, /api/admin + guard.
7. Viết create-admin.ts CLI + script.
8. server lint + build; chạy create-admin tạo admin test; chạy smoke:auth → XANH.

## Success Criteria

- [x] `smoke:auth` (Phase 1) XANH toàn bộ 8 assert.
- [x] Login sai (email không có / sai pass) → cùng 401 message chung.
- [x] Cookie login là httpOnly; logout revoke.
- [x] Guard chặn `/api/admin/*` khi không cookie (401).
- [x] CLI create-admin tạo admin, hash argon2, không lộ password.
- [x] server lint/build sạch; JWT_SECRET validate lúc khởi động.

## Risk Assessment

- **Rủi ro cao:** argon2 native module — build fail trong Docker (bài học "local
  build đánh lừa"). Giảm thiểu: verify Docker build ở Phase 4, không chỉ local.
- **Rủi ro:** email enumeration qua timing (user không tồn tại trả nhanh hơn).
  Giảm thiểu: verify một dummy hash khi user không tồn tại để cân thời gian.
- **Rủi ro:** cookie không gửi được do CORS/origin sai. Giảm thiểu: same-origin
  qua proxy; nếu cross-origin thì credentials + origin allow-list (không wildcard).
- **Rủi ro:** JWT_SECRET commit nhầm. Giảm thiểu: chỉ trong .env (gitignore),
  .env.example chỉ placeholder.
- **Rollback:** module auth độc lập; revert wiring index.ts là tắt auth.
