---
phase: 4
title: Kiem thu build local va xac minh CI
status: completed
priority: P1
effort: 1h
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Kiem thu build local va xac minh CI

## Overview

Chay toan bo build/lint/test local voi cau truc thu muc moi, dam bao khong
regressions, roi push nhanh de CI xac minh doc lap tren may sach (khong bi
anh huong boi cache/state local).

## Requirements

- Functional: `npm run lint` va `npm run build` chay sach trong `frontend/`.
- Functional: `server/npm run lint` va `server/npm run build` khong bi anh huong.
- Functional: `docker compose up -d --build` dung tu root, tat ca service
  healthy, dat duoc cung ket qua nhu truoc khi tai cau truc.
- Functional: CI (`ci.yml`) xanh tren nhanh `refactor/monorepo-restructure`.

## Related Code Files

Khong sua file — phase nay chi chay lenh kiem tra. Neu phat hien loi, quay
lai Phase 1-3 de sua, khong tu y doi scope trong phase nay.

## Implementation Steps

1. Tu root repo:
   ```bash
   cd frontend
   npm install
   npm run lint
   npm run build
   cd ..
   ```
2. Kiem tra `server/` khong bi anh huong:
   ```bash
   cd server
   npm run lint
   npm run build
   cd ..
   ```
3. Build Docker image frontend truc tiep (khong qua compose) de cach ly loi:
   ```bash
   docker build --target runtime -f frontend/Dockerfile -t thuccoffee:local-test .
   ```
4. Chay toan bo stack qua Compose tu root:
   ```bash
   docker compose config --quiet
   docker compose up -d --build
   docker compose ps -a
   curl -fsS http://127.0.0.1:3000/healthz
   curl -fsS http://127.0.0.1:8080/api/health
   ```
5. Chay lai test suite FE hien co (khong sua test, chi xac nhan van pass sau
   khi doi vi tri file):
   ```bash
   cd frontend
   npm run test:admin-ui
   cd ..
   ```
   `test:admin-e2e` (Playwright) can stack Compose dang chay tu buoc 4 — chay
   tu `frontend/` vi `playwright.config.ts` da chuyen vao do.
6. `git add -A`, kiem tra `git status` bao toan bo la "renamed" + cac file
   sua noi dung (Dockerfile, compose.yaml, ci.yml, docs), khong co gi bi bo
   sot hoac vo tinh xoa.
7. Chia 2 commit theo quyet dinh da chot trong Validation Log cua `plan.md`
   (khong tach nho hon — tranh trang thai build gay tam thoi giua cac commit):
   - **Commit 1** (Phase 1 + Phase 2 gop chung): di chuyen `git mv` toan bo
     FE vao `frontend/`, sua `frontend/Dockerfile` + `compose.yaml`.
   - **Commit 2** (Phase 3): sua `ci.yml`, `docs/deployment.md`,
     `docs/local-environment-and-ci.md`, `CLAUDE.md`, `README.md`.
   Hoi nguoi dung xac nhan noi dung commit truoc khi chay `git commit` —
   khong tu y commit ma khong duyet qua `git status`/`git diff --stat`.
8. Push nhanh `refactor/monorepo-restructure`, mo PR, doi CI (`ci.yml`) chay
   xanh ca 2 job (`lint-and-build`, `docker`).
9. Doi chieu checklist Release Verification trong `docs/deployment.md` (cac
   muc lien quan healthz, deep link, anh MinIO) tren stack Compose vua build.
   Da chot qua validate interview: chi chay `npm run smoke:api` (trong
   `server/`) de xac nhan backend khong bi anh huong — khong can chay toan bo
   11 smoke suite vi plan khong dong logic `server/`, chi doi vi tri file build.

## Success Criteria

- [x] `frontend/`: lint + build sach, khong loi TypeScript.
- [x] `server/`: lint + build sach, khong bi anh huong.
- [x] `docker build -f frontend/Dockerfile .` thanh cong, khong loi resolve
      import type tu `server/`.
- [x] `docker compose up -d --build` — tat ca service (`frontend`, `backend`,
      `postgres`, `minio`, `minio-init`) healthy.
- [x] `/healthz` va `/api/health` tra `200`.
- [x] `npm run test:admin-ui` pass (chay tu `frontend/`) — 10/10 pass.
- [ ] CI tren GitHub Actions xanh ca 2 job cho nhanh `refactor/monorepo-restructure`
      (chua verify — chua push nhanh len remote).
- [ ] Khong con tham chieu duong dan cu (root-level `src/`, `package.json`,
      v.v.) trong bat ky file cau hinh hay tai lieu nao.

## Risk Assessment

- **Rui ro:** local build "sach" nhung CI tren may sach (khong co cache,
  khong co `node_modules` cu) van loi — day chinh la ly do bat buoc phai doi
  CI xanh that su, khong dung ket qua local lam bang chung du (da co tien le
  loi nay truoc day — xem memory `fe-docker-build-needs-server-context`).
- **Rui ro:** neu Playwright e2e that bai vi thieu stack Compose dang chay —
  khong phai loi tu tai cau truc, dam bao buoc 4 chay truoc buoc 5.
- Neu bat ky success criteria nao khong dat, KHONG merge — quay lai phase
  tuong ung de sua, khong bo qua hay merge voi loi bang "se sua sau".
