---
phase: 1
title: Di chuyen ma nguon Frontend bang git mv
status: completed
priority: P1
effort: 1h
dependencies: []
---

# Phase 1: Di chuyen ma nguon Frontend bang git mv

## Overview

Gom toan bo ma nguon va cau hinh Frontend tu root vao thu muc con `frontend/`
bang `git mv` de giu lich su commit. `server/` khong dong den. Day la buoc co
hoc, chua sua noi dung file nao (tru duong dan tuong doi neu can o Phase 2-3).

## Key Insights

- Da xac nhan `.oxlintrc.json` o root co `"ignorePatterns": ["server"]` va
  `server/` da co `.oxlintrc.json` rieng — chung khong dung chung, an toan
  chuyen `.oxlintrc.json` root vao `frontend/` nguyen ven.
- `playwright.config.ts` khai bao `testDir: './e2e'` — path tuong doi, van
  dung sau khi ca hai cung nam trong `frontend/`.
- `e2e/` test dung `baseURL: 'http://127.0.0.1:3000'` — khong doi vi day la
  URL runtime cua container, khong phai path filesystem.

## Requirements

- Functional: sau khi di chuyen, cau truc `frontend/` phai chua day du de
  `npm install && npm run build` chay duoc tu ben trong `frontend/` (kiem
  chung o Phase 4, khong bat buoc phai chay ngay trong phase nay).
- Non-functional: dung `git mv` (khong dung `mv` thuong) de Git nhan dien la
  rename, giu blame/history.

## Related Code Files

Di chuyen (source -> dich), tat ca duoi `frontend/`:

- `src/` -> `frontend/src/`
- `public/` -> `frontend/public/`
- `package.json` -> `frontend/package.json`
- `package-lock.json` -> `frontend/package-lock.json`
- `tsconfig.json` -> `frontend/tsconfig.json`
- `tsconfig.app.json` -> `frontend/tsconfig.app.json`
- `tsconfig.node.json` -> `frontend/tsconfig.node.json`
- `vite.config.ts` -> `frontend/vite.config.ts`
- `vitest.config.ts` -> `frontend/vitest.config.ts`
- `playwright.config.ts` -> `frontend/playwright.config.ts`
- `e2e/` -> `frontend/e2e/`
- `scripts/` -> `frontend/scripts/`
- `index.html` -> `frontend/index.html`
- `Dockerfile` -> `frontend/Dockerfile`
- `.oxlintrc.json` -> `frontend/.oxlintrc.json`

Khong dong: `server/`, `compose.yaml`, `.github/`, `docs/`, `plans/`, `.env*`,
`.gitignore`, `.dockerignore`, `CLAUDE.md`, `README.md`.

## Implementation Steps

1. Xac nhan dang o nhanh `refactor/monorepo-restructure` (`git branch --show-current`).
2. Tao thu muc `frontend/` (Git tu tao khi `git mv` dich ben trong no).
3. Chay tung lenh `git mv <source> frontend/<source>` cho tat ca muc trong
   "Related Code Files" — tach lenh rieng cho tung item de neu loi de xac
   dinh buoc nao that bai:
   ```bash
   git mv src frontend/src
   git mv public frontend/public
   git mv package.json frontend/package.json
   git mv package-lock.json frontend/package-lock.json
   git mv tsconfig.json frontend/tsconfig.json
   git mv tsconfig.app.json frontend/tsconfig.app.json
   git mv tsconfig.node.json frontend/tsconfig.node.json
   git mv vite.config.ts frontend/vite.config.ts
   git mv vitest.config.ts frontend/vitest.config.ts
   git mv playwright.config.ts frontend/playwright.config.ts
   git mv e2e frontend/e2e
   git mv scripts frontend/scripts
   git mv index.html frontend/index.html
   git mv Dockerfile frontend/Dockerfile
   git mv .oxlintrc.json frontend/.oxlintrc.json
   ```
4. Chay `git status` xac nhan tat ca hien thi dang "renamed:", khong co dang
   "deleted:" + "new file:" rieng le (dau hieu Git khong nhan dien duoc rename).
5. Kiem tra khong con file Frontend nao sot lai o root ngoai
   `Dockerfile`/`package.json` (da chuyen) — `ls` root, chi con
   `compose.yaml`, `server/`, `docs/`, `plans/`, `.github/`, cau hinh chung.

## Success Criteria

- [x] Tat ca 15 muc trong danh sach da chuyen vao `frontend/` qua `git mv`.
- [x] `git status` bao "renamed" cho toan bo, khong co cap "deleted"/"new file" tach roi.
- [x] `server/`, `compose.yaml`, `.github/`, `docs/` khong bi dong den.
- [x] Root chi con: `frontend/`, `server/`, `compose.yaml`, `.github/`, `docs/`,
      `plans/`, `deploy/`, file cau hinh chung (`.gitignore`, `.env.example`, v.v).

## Risk Assessment

- **Rui ro:** `git mv` tren thu muc lon (`src/`, `public/`) co the bi shell
  gioi han do dai lenh tren mot so he thong — giai phap: di chuyen tung thu
  muc con neu can, khong anh huong ket qua cuoi.
- **Rui ro:** bo sot file an (`.env.example` cua FE neu co) — kiem tra bang
  `git status` sau khi mv, doi chieu voi danh sach truoc khi mv.
- Phase nay KHONG sua noi dung file nao, chi di chuyen — build se gay ngay
  sau phase nay cho toi khi Phase 2 cap nhat xong `Dockerfile`/`compose.yaml`.
  Day la trang thai tam thoi binh thuong trong 1 nhanh, khong commit rieng
  neu chua sua xong Phase 2 (tranh 1 commit lam gay build).
