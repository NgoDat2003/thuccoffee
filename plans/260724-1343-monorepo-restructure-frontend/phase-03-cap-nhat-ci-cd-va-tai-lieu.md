---
phase: 3
title: Cap nhat CI workflow va tai lieu
status: completed
priority: P1
effort: 1h
dependencies:
  - 1
  - 2
---

# Phase 3: Cap nhat CI workflow va tai lieu

## Overview

Sua `.github/workflows/ci.yml` de cai dat/lint/build dung thu muc `frontend/`
moi, va cap nhat `docs/deployment.md` + `CLAUDE.md` de phan anh cau truc thu
muc moi (khong con dung thong tin cu ve vi tri file FE o root).

## Requirements

- Functional: job `lint-and-build` trong CI chay `npm ci`/`lint`/`build` dung
  trong `frontend/`, van giu thu tu cai `server` truoc `frontend` (rang buoc
  type-only import khong doi).
- Functional: job `docker` build dung file `frontend/Dockerfile` voi context root.
- Non-functional: tai lieu (`docs/deployment.md`, `CLAUDE.md`) khong con cau
  ket qua path cu (`Dockerfile path: Dockerfile` -> phai la `frontend/Dockerfile`).

## Related Code Files

- Modify: `.github/workflows/ci.yml`
- Modify: `docs/deployment.md`
- Modify: `docs/local-environment-and-ci.md`
- Modify: `CLAUDE.md`
- Modify: `README.md` (xem buoc 6)

## Implementation Steps

1. Mo `.github/workflows/ci.yml`, sua job `lint-and-build`:
   - `cache-dependency-path` doi thanh `frontend/package-lock.json` va
     `server/package-lock.json`.
   - Buoc "Install dependencies" doi `working-directory: frontend` (thay vi
     chay o root).
   - Buoc "Install server dependencies" giu nguyen `working-directory: server`,
     **van chay TRUOC** buoc build frontend (thu tu nay da fix trong
     `docs/local-environment-and-ci.md` truoc day — khong duoc dao nguoc).
   - Buoc "Lint" va "Build" doi `working-directory: frontend`.
   - Buoc "Lint server"/"Build server" giu nguyen.
2. Sua job `docker`:
   ```yaml
   - name: Build frontend image
     run: docker build --target runtime -f frontend/Dockerfile -t thuccoffee:ci .
   ```
   Context van la `.` (root), chi them `-f frontend/Dockerfile`.
3. Cap nhat comment trong `ci.yml` giai thich ly do thu tu cai dat (comment
   hien co da giai thich dung, chi can sua tu "frontend" cho khop cau truc moi
   neu con nhac den duong dan root).
4. Mo `docs/deployment.md`, sua bang "Frontend Runtime Contract":
   - `Docker context` van la `.`
   - `Dockerfile path` doi thanh `frontend/Dockerfile`
   - Sua muc "3. Build Settings" phan Frontend:
     ```text
     Build type: Dockerfile
     Dockerfile path: frontend/Dockerfile
     Docker context path: .
     Docker build stage: runtime
     ```
5. Mo `CLAUDE.md`, cap nhat phan mo ta "Bo cuc" va bat ky doan nao nhac den
   `src/`, `package.json` o root nhu dang ton tai truc tiep — doi thanh
   `frontend/src/`, `frontend/package.json`, v.v. Giu nguyen cac quy uoc
   khong lien quan vi tri file (vi du quy uoc `getImageUrl()`, Tailwind v4).
6. Kiem tra `README.md` co doan lenh nao chay tu root ma gio phai chay trong
   `frontend/` khong (vi du `npm run dev`, `npm run build`) — neu co, cap
   nhat huong dan (`cd frontend && npm install` truoc cac lenh do). Da xac
   nhan qua validate interview: dong 83-84 (`npm install` + `npm run dev`
   trong phan "Phát triển không dùng Docker") can them `cd frontend` truoc.
7. Mo `docs/local-environment-and-ci.md`, sua 2 doan da xac nhan qua validate
   interview:
   - Dong 27: "installs with `npm ci`" — lam ro la chay trong `frontend/`
     (giong cach `ci.yml` da sua o buoc 1).
   - Dong 98: "`package.json` defines `lint` and `build` only" — doi thanh
     "`frontend/package.json` defines...".
   - Doc luot toan file tim cac tham chieu path khac chua liet ke o day (vi
     du bang "Ways to Run the Container") — sua neu co nhac den vi tri file
     source thay vi hanh vi runtime.

## Success Criteria

- [x] `ci.yml` cai/lint/build frontend trong `working-directory: frontend`,
      thu tu cai server truoc frontend khong doi.
- [x] `ci.yml` job `docker` build frontend voi `-f frontend/Dockerfile`,
      context van la `.`.
- [x] `docs/deployment.md` phan Dokploy build settings phan anh dung
      `Dockerfile path: frontend/Dockerfile`.
- [x] `docs/local-environment-and-ci.md` khong con doan mo ta path root mac
      dinh cho lenh `npm ci`/`package.json` ma khong noi ro `frontend/`.
- [x] `CLAUDE.md` va `README.md` khong con mo ta sai vi tri file FE. Ngoai
      pham vi ban dau con sua them `docs/backend-architecture.md` va
      `docs/database-design.md` (phat hien qua ra soat, xac nhan voi user).

## Risk Assessment

- **Rui ro:** sua `working-directory` cho buoc cai dependencies nhung quen
  sua `cache-dependency-path` — cache npm trong CI se khong hit, build cham
  hon nhung khong loi (safe fail, khong block, chi lang phi thoi gian CI).
- **Rui ro:** README con huong dan cu (`npm install` roi `npm run dev` ngay
  tu root) se lam nguoi moi setup bi loi "package.json not found" — phai ra
  soat toan bo README, khong chi phan Docker.

## Phat hien ngoai du kien khi thuc thi (2026-07-24)

Plan ban dau chi xet import type-only tu FE vao BE o tang Docker build
context, KHONG xet cac path tuong doi source-level. Khi chay `git mv` xong,
phat hien 2 nhom loi thuc su (khong phai gia thuyet):

1. **`server/` import nguoc vao `frontend/src/`:** 4 file dung path tuong
   doi `../../../src/...` (tinh tu `server/src/db/`) tro vao du lieu seed cu
   o root — phai sua thanh `../../../frontend/src/...`:
   - `server/src/db/seed.ts` (6 import tu `frontend/src/data/*.ts`)
   - `server/src/db/seed-images.ts`
   - `server/src/db/source-image-object-key-resolver.ts`
   - `server/scripts/scrape-product-options.ts`
   - `server/tsconfig.seed.json` (`include` list, 6 duong dan)
2. **`frontend/src/` import vao `server/src/`:** 37 file dung import type
   tuong doi (`../../server/...` hoac sau hon) — moi file lech 1 cap tuy
   theo do sau thu muc goc cua no truoc khi chuyen. Da sua toan bo va xac
   minh bang `tsc -b --noEmit` that (khong doan bang tay) cho toi khi 0 loi
   TS2307. Danh sach thu muc bi anh huong: `src/data/`, `src/pages/`,
   `src/services/`, `src/services/admin/`, `src/components/*`,
   `src/pages/admin/`, `src/lib/api/`, `src/components/admin/forms/`.

Ly do bo sot ban dau: brainstorm report chi xac nhan rang buoc o tang Docker
COPY, khong quet source code tim import tuong doi cu the. Bai hoc: voi
refactor di chuyen thu muc lam thay doi do sau, PHAI verify bang compiler that
(`tsc -b --noEmit`), khong du chi doc code hay dem cap thu cong — dem tay da
sai it nhat 1 lan trong qua trinh sua (bo sot nhom `components/admin/forms/`
o do sau 5 cap).
