---
title: "Phase Auth — JWT cookie httpOnly + admin bootstrap"
description: "Auth backend (JWT cookie httpOnly, argon2, CLI bootstrap, guard /api/admin/*) + trang /admin/login tối thiểu. Không shell/CRUD."
status: completed
priority: P1
branch: "feat/admin-mvp"
tags: [auth, jwt, argon2, security, admin, tdd]
blockedBy: []
blocks: []
created: "2026-07-22T09:57:47.869Z"
createdBy: "ck:plan"
source: skill
---

# Phase Auth — JWT cookie httpOnly + admin bootstrap

## Overview

Dựng nền auth để chặn `/api/admin/*` trước khi làm CRUD. JWT ký bằng
`jsonwebtoken`, đặt trong cookie httpOnly; mật khẩu hash `argon2`. Admin đầu tiên
tạo qua CLI đọc env (DB đang 0 user). Kèm trang `/admin/login` tối thiểu để test
đường đi thật. **Không** làm admin shell/CRUD/RBAC/rate limit/refresh token.

Nguồn quyết định: `plans/reports/260722-admin-auth-foundation-brainstorm.md`.

## Bối cảnh đã verify (scout)

- `users` table sẵn (schema.ts:127): email unique, passwordHash, role default
  'admin' + check in('admin','editor'). **0 user** → cần bootstrap.
- Deps có: helmet, cors. **Chưa có**: argon2, jsonwebtoken, cookie-parser.
- `ApiError.unauthorized()` đã có (api-error.ts:30 → 401 'UNAUTHORIZED') → tái dùng.
- Module pattern: `{name}.routes.ts` + `.schemas.ts` + `.service.ts`.
- Wiring index.ts: helmet→compression→cors→json→pino→routes→notFound→errorHandler.
- Env qua Zod `env.ts`, `process.exit(1)` nếu thiếu.
- **axios FE thiếu `withCredentials`** (axios.ts:23) → PHẢI thêm để gửi/nhận cookie.
- Routes `createBrowserRouter`; `/admin/login` phải NGOÀI `<Layout />` (không header/footer public).
- Service FE: import type thẳng từ backend module + `apiGet`; login dùng `useMutation`.

## Quyết định đã chốt (từ brainstorm)

| Chủ đề | Chốt |
|---|---|
| Cơ chế | JWT cookie httpOnly (stateless, không bảng session) |
| Bootstrap | CLI đọc `ADMIN_EMAIL`/`ADMIN_PASSWORD`, hash argon2 |
| Phạm vi | Chỉ auth backend + login page (shell/CRUD phase sau) |
| Token | JWT 7 ngày; httpOnly + SameSite=Lax + Secure(production) |
| Login error | 401 chung, không lộ email tồn tại (chống enumeration) |
| Rate limit | P1, phase sau — KHÔNG làm phase này |
| TDD | Smoke-style script (khớp smoke:api/smoke:images), không thêm test framework |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Test-first: auth smoke contract](./phase-01-test-first-auth-backend-contract.md) | Completed |
| 2 | [Auth backend: deps/env/service/middleware/bootstrap](./phase-02-auth-backend-deps-env-service-middleware-bootstrap.md) | Completed |
| 3 | [FE login page tối thiểu](./phase-03-fe-login-page-toi-thieu.md) | Completed |
| 4 | [Verify auth end-to-end (Docker)](./phase-04-verify-auth-end-to-end-docker.md) | Completed |

## Dependencies

- **BlockedBy:** Phase M (`260722-fe-images-from-minio`, completed) — cùng khối admin,
  cùng nhánh `feat/admin-mvp`.
- **Blocks:** Upload+CRUD (phase sau) — mọi `/api/admin/*` dựa trên guard phase này.
- Plan `in-progress` khác trong `plans/` là vòng FE đã hoàn thành (chưa mark), không liên quan.

## Red Team Review

3 reviewer lens (Security Adversary + Assumption Destroyer + Failure Mode Analyst),
tự chạy. Findings có evidence file:line, đã adjudicate + user duyệt.

| # | Sev | Finding | Evidence | Disposition |
|---|---|---|---|---|
| 1 | Critical | auth.routes async ném ApiError chưa chốt cách tới errorHandler → login sai có thể thành 500 | `server/package.json` express 5.1.0, `products.routes.ts:19` | Accept — ghi rõ Express 5 auto-forward, smoke verify 401 |
| 2 | High | `env.ts` safeParse+exit(1) lúc import chặn `create-admin` nếu thiếu JWT_SECRET → bootstrap fail | `env.ts:22,29` | Accept — create-admin đọc process.env trực tiếp, không import env.ts |
| 3 | Medium | logout status mâu thuẫn: Phase 1 assert "200/204", Phase 2 ghi "204" | `phase-01:38` vs `phase-02:49` | Accept — chốt 204, sửa Phase 1 assert |

### Whole-Plan Consistency Sweep
- Finding 1 → Phase 2 auth.routes ghi rõ Express 5 auto-forward; smoke Phase 1
  đã assert login sai → 401 (khớp).
- Finding 2 → Phase 2 env + Related Files ghi create-admin không import env.ts.
- Finding 3 → Phase 1 assert 8 sửa thành 204; Phase 2 đã là 204 (khớp).
- Kiểm chống enumeration: Phase 1 assert 1+2 cùng message, Phase 2 service cùng
  path + dummy hash (khớp).
- **Kết quả:** 0 mâu thuẫn còn lại. Plan sẵn sàng implement.
