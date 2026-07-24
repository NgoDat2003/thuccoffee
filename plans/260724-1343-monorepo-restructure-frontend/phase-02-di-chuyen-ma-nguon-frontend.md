---
phase: 2
title: 'Cap nhat Dockerfile, compose.yaml, .dockerignore'
status: completed
priority: P1
effort: 1h
dependencies:
  - 1
---

# Phase 2: Cap nhat Dockerfile, compose.yaml, .dockerignore

## Overview

Sau khi Phase 1 di chuyen source vao `frontend/`, sua cac file cau hinh build
de tro dung duong dan moi. Build context Docker cua Frontend van la root `.`
(khong doi thanh `frontend/`) vi `tsc` can thay `server/src/**/*.schemas.ts`
va `server/node_modules` de resolve type-only import — day la rang buoc da
xac dinh trong brainstorm report, khong duoc thay doi trong phase nay.

## Key Insights

- `.dockerignore` hien tai da loai tru dung `server/dist`, `server/.env*` va
  GIU `server/src/` (co comment giai thich ly do). Khong can sua gi them o
  day sau khi FE chuyen vao `frontend/` — da xac nhan trong brainstorm.
- `frontend/Dockerfile` build tu goc du build context van la `.`, nen cac lenh
  `COPY` ben trong phai doi tu `COPY package.json ...` thanh
  `COPY frontend/package.json ...` (vi context la root, path trong COPY phai
  la duong dan tuong doi tu root).

## Requirements

- Functional: `docker build --target runtime -f frontend/Dockerfile -t thuccoffee:local .`
  chay thanh cong tu root repo.
- Functional: `docker compose up -d --build` dung nguyen `compose.yaml` o root
  build ca hai service dung.
- Non-functional: khong lam phinh build context hay lam cham build so voi
  hien tai — chi doi duong dan, khong doi logic cache layer.

## Related Code Files

- Modify: `frontend/Dockerfile` (sua cac lenh `COPY`)
- Modify: `compose.yaml` (sua `dockerfile:` cua service `frontend`)
- Verify (khong sua neu da dung): `.dockerignore`

## Implementation Steps

1. Mo `frontend/Dockerfile`, doi cac dong `COPY` sau (build context van la root):
   ```dockerfile
   # Truoc:
   COPY package.json package-lock.json ./
   RUN npm ci
   COPY server/package.json server/package-lock.json ./server/
   RUN npm ci --prefix server
   COPY . .
   ARG VITE_MINIO_BASE_URL=/media
   ENV VITE_MINIO_BASE_URL=$VITE_MINIO_BASE_URL
   RUN npm run build

   # Sau:
   COPY frontend/package.json frontend/package-lock.json ./
   RUN npm ci
   COPY server/package.json server/package-lock.json ./server/
   RUN npm ci --prefix server
   COPY frontend/. .
   COPY server/. ./server/
   ARG VITE_MINIO_BASE_URL=/media
   ENV VITE_MINIO_BASE_URL=$VITE_MINIO_BASE_URL
   RUN npm run build
   ```
   Luu y: `WORKDIR /app` giu nguyen — sau `COPY frontend/. .` thi cau truc
   ben trong container van giong het truoc day (khong co thu muc `frontend/`
   long trong container, chi la nguon COPY tu ben ngoai doi).
2. Kiem tra runtime stage (`FROM nginx:1.29-alpine AS runtime`) khong tham
   chieu duong dan nao lien quan `frontend/` — no chi COPY tu
   `--from=build /app/dist`, khong can sua.
3. Mo `compose.yaml`, sua block `frontend.build`:
   ```yaml
   frontend:
     build:
       context: .
       dockerfile: frontend/Dockerfile   # them dong nay
       target: runtime
       args:
         VITE_MINIO_BASE_URL: /media
   ```
4. Xac nhan `.dockerignore` khong can sua — doc lai comment hien co, xac nhan
   logic "giu server/src, loai server/dist + server/.env*" van dung nguyen
   sau khi FE doi vi tri (vi `server/` khong doi).
5. Chay `docker compose config --quiet` de validate cu phap YAML truoc khi
   build that (khong can service chay, chi kiem tra parse).

## Success Criteria

- [x] `frontend/Dockerfile` COPY dung duong dan moi, khong con tham chieu file
      o root (vi gio khong con o root nua).
- [x] `compose.yaml` co `dockerfile: frontend/Dockerfile`, `context: .` giu nguyen.
- [x] `docker compose config --quiet` chay khong loi cu phap.
- [x] `.dockerignore` xac nhan khong can sua (ghi ro trong PR description ly do).

## Cap nhat sau khi thuc thi (2026-07-24)

Ban dau `COPY frontend/. .` do phang noi dung `frontend/` vao `/app`, khien
container mat cau truc `frontend/`+`server/` song song nhu tren host. Vi 37
file frontend dung alias TypeScript `@server/*` (them trong luc thuc thi, xem
Phase 3 "Phat hien ngoai du kien") voi relative path `../server/*`, container
phai giu dung cau truc do de alias resolve dung. Da sua thanh
`COPY frontend/. ./frontend/` + `WORKDIR /app/frontend` truoc buoc build,
runtime stage COPY tu `/app/frontend/dist`. Da verify bang `docker build`
that + `docker compose up` full stack healthy.

## Risk Assessment

- **Rui ro chinh:** quen doi `COPY . .` thanh `COPY frontend/. .` — build van
  chay "thanh cong" nhung sai file (copy nham cau truc), hoac loi ro rang neu
  path khong ton tai. Kiem tra bang `docker build` that o Phase 4, khong chi
  dua vao doc code.
- **Rui ro:** neu quen them dong `dockerfile: frontend/Dockerfile` trong
  `compose.yaml`, Compose se tim `Dockerfile` mac dinh o context root (`.`)
  va bao loi "no such file" ro rang — de phat hien, khong phai loi ngam.
