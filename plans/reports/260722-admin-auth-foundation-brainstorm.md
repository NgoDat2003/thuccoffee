# Admin Auth Foundation — Brainstorm Chốt Quyết Định

**Ngày:** 2026-07-22
**Nhánh:** `feat/admin-mvp`
**Trạng thái:** Brainstorm đã chốt — nền cho `/ck:plan`
**Nguồn vào:** `plans/reports/260722-admin-mvp-scope-decisions-brainstorm.md` (§8.1 Auth)

## 1. Bối cảnh

Khối admin theo thứ tự: **Media (M, xong) → Auth (đây) → Upload+CRUD**. Phase M
đã merge commit `edf7341` trên `feat/admin-mvp` (FE đọc ảnh MinIO). Giờ dựng auth
để chặn `/api/admin/*` trước khi làm CRUD — "có CRUD mà không auth = ai cũng sửa".

## 2. Scout findings (đã verify)

- **`users` table sẵn sàng** (schema.ts:127): `email` unique, `passwordHash`,
  `role` default `'admin'` + check `in ('admin','editor')`. **0 user trong DB** → cần bootstrap.
- **Deps**: có `helmet`, `cors`. **Chưa có**: `argon2`, `jsonwebtoken`, cookie parser.
- **Module pattern**: mỗi resource = `{name}.routes.ts` + `.schemas.ts` + `.service.ts`.
- **Wiring** (index.ts): `app.use('/api/xxx', routes)`; chain helmet→compression→
  cors→json→pino→routes→notFound→errorHandler.
- **Env** (env.ts): Zod validate lúc khởi động, `process.exit(1)` nếu thiếu.

## 3. Quyết định đã chốt

| # | Chủ đề | Chốt | Lý do |
|---|---|---|---|
| 1 | Cơ chế | **JWT trong cookie httpOnly** | Stateless, không bảng session; đủ cho một admin. Deps: jsonwebtoken + cookie-parser |
| 2 | Bootstrap | **CLI đọc env** (`ADMIN_EMAIL`/`ADMIN_PASSWORD`), hash argon2 | Không hardcode, không trong db:seed (seed ghi đè + lộ credential) |
| 3 | Phạm vi | **Chỉ auth backend + login page tối thiểu** | Vertical slice chạy được; shell/CRUD phase sau |
| 4 | Token/cookie | **JWT 7 ngày**; httpOnly + SameSite=Lax + Secure(production) | Same-origin qua nginx nên Lax đủ; 7 ngày không phiền admin |
| 5 | Login error | **401 chung**, không lộ email tồn tại | Chống enumeration — acceptance criteria report admin |
| 6 | Rate limit | **P1, phase sau** | Cookie httpOnly đã chặn XSS token; rate limit nên có nhưng không chặn phase này |

## 4. Exact requirements

**Expected output:**
- `POST /api/auth/login` — nhận email/password, verify argon2, ký JWT, set cookie httpOnly.
- `POST /api/auth/logout` — xóa cookie.
- `GET /api/auth/me` — trả thông tin admin từ token (401 nếu chưa login).
- Middleware `requireAuth` chặn `/api/admin/*` — verify cookie JWT.
- CLI `npm run create-admin` — đọc env, hash argon2, insert user.
- Trang `/admin/login` FE — form email/password, gọi login, redirect sau thành công.

**Acceptance criteria:**
- Chưa login → mọi `/api/admin/*` trả 401.
- Login sai (email không tồn tại HOẶC mật khẩu sai) → cùng 401, thông báo chung.
- Cookie có expiry; logout làm cookie không dùng được nữa.
- Credential không nằm trong source, seed, hay log.
- Login đúng → cookie set, `/api/auth/me` trả admin.

**Scope OUT (phase sau):** admin shell/AdminLayout/sidebar, CRUD, RBAC/editor role,
rate limit, refresh token, password reset, màn quản lý user.

**Non-negotiable constraints:**
- `argon2` (không bcrypt) — quy ước dự án.
- Module pattern `server/src/modules/auth/{routes,schemas,service}.ts`.
- Env mới khai trong `env.ts` Zod schema, đọc qua `env`.
- Phản hồi bọc `ApiResponse<T>`; HTTP status đúng nghĩa (401 chưa login).
- Một admin; constraint DB vẫn để sẵn 'editor'.

**Touchpoints:**
- Sẵn: `server/src/db/schema.ts` (`users`), `env.ts`, `index.ts`.
- Mới: `server/src/modules/auth/`, `server/src/common/auth-middleware.ts` (hoặc trong module),
  `server/scripts/create-admin.ts`, FE `src/services/auth.service.ts`,
  `src/pages/AdminLoginPage.tsx`, route trong `src/routes.tsx`.

## 5. Env mới cần thêm (env.ts Zod)

- `JWT_SECRET` (string, min length) — ký/verify token. Bắt buộc.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — chỉ CLI bootstrap đọc; cân nhắc để ngoài env
  schema chính (chỉ script cần), hoặc optional. Chốt khi plan.
- Cookie name, expiry có thể hằng số trong code (không cần env).

## 6. Kiến trúc

```
POST /api/auth/login
  → auth.schemas (Zod: email, password)
  → auth.service.login: tìm user theo email → argon2.verify → ký JWT
  → set cookie httpOnly (res.cookie)
  → ApiResponse { success, data: { email, role } }

requireAuth middleware
  → đọc cookie → jwt.verify → gắn req.user → next()
  → thiếu/sai → 401 ApiError

/api/admin/* (phase sau) → app.use('/api/admin', requireAuth, adminRoutes)
```

FE: `useLogin` mutation → cookie tự set (credentials: 'include') → redirect
`/admin`. `useMe` query cho route guard (phase shell dùng lại).

## 7. Rủi ro cần lưu trong plan

- **CORS + cookie credentials**: same-origin qua nginx thì đơn giản; nếu dev
  cross-origin (FE :5173, BE :8080) cần `cors({ credentials: true, origin })` +
  fetch `credentials: 'include'`. Chốt cách dev khi plan.
- **JWT_SECRET quản lý**: bắt buộc, validate lúc khởi động; không commit giá trị thật.
- **argon2 native build**: là native module — verify build trong Docker (bài học
  "local build đánh lừa").
- **axios FE gửi cookie**: axios client hiện có `withCredentials`? Cần kiểm/bật khi plan.

## 8. Câu chưa chốt (không chặn plan, chốt ở phase)

- CORS dev cross-origin hay proxy Vite same-origin (nghiêng proxy như `/api`).
- `ADMIN_EMAIL/PASSWORD` trong env schema chính hay tách riêng cho script.
- Cookie name cụ thể.

## 9. Bước tiếp theo

`/ck:plan --tdd` (đụng security-critical + thêm middleware chặn route — test khóa
hành vi auth: chưa login 401, login sai 401, login đúng set cookie, logout revoke).
