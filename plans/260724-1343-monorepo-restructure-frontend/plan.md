---
title: Tai cau truc thu muc thanh Monorepo (gom FE vao frontend/)
description: >-
  Gom toan bo ma nguon Frontend vao thu muc frontend/, giu server/ nguyen vi
  tri, cap nhat compose/CI/docs theo path moi.
status: completed
priority: P2
branch: refactor/monorepo-restructure
tags:
  - refactor
  - infra
  - monorepo
  - docker
  - ci
blockedBy: []
blocks: []
created: '2026-07-24T06:43:49.303Z'
createdBy: 'ck:plan'
source: skill
---

# Tai cau truc thu muc thanh Monorepo (gom FE vao frontend/)

## Overview

Repo hien bat doi xung: ma nguon Frontend nam thang o root, Backend nam o
`server/`. Theo yeu cau Tech Lead (doi chieu voi cau truc `maycha_QAQC_app`),
gom toan bo ma nguon Frontend vao thu muc con `frontend/`; `server/` giu
nguyen vi tri, khong doi ten. `compose.yaml` va cac file dieu phoi ha tang
van o root.

Rang buoc ky thuat quan trong: `tsc` cua Frontend import type truc tiep tu
`server/src/**/*.schemas.ts` (cac schema Zod dung chung), nen Docker build
context cua Frontend van phai bao quat duoc thu muc `server/` de resolve
type-only import — khong the tach hai app thanh hai build context doc lap.

Nguon: `plans/reports/260724-monorepo-restructuring-brainstorm.md` (da duyet
qua brainstorm, 2 vong AskUserQuestion xac nhan scope voi user).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Di chuyen ma nguon Frontend bang git mv](./phase-01-chuan-bi-va-cap-nhat-cau-hinh.md) | Completed |
| 2 | [Cap nhat Dockerfile, compose.yaml, .dockerignore](./phase-02-di-chuyen-ma-nguon-frontend.md) | Completed |
| 3 | [Cap nhat CI workflow va tai lieu](./phase-03-cap-nhat-ci-cd-va-tai-lieu.md) | Completed |
| 4 | [Kiem thu build local va xac minh CI](./phase-04-kiem-thu-va-xac-minh.md) | Completed |

Luu y: ten file phase giu nguyen theo stub da tao (`ck plan create`), noi dung
ben trong da doi thu tu/mo ta cho khop logic thuc thi thuc te — xem tieu de
trong bang tren la nguon dung, khong phai ten file.

## Dependencies

Khong phu thuoc plan nao khac dang mo. Khong overlap voi
`plans/260724-1130-admin-editor-gallery-faq-expansion` (da done, khac domain —
noi dung CMS vs cau truc thu muc).

## Validation Log

### Verification Results (Standard tier — Fact Checker + Contract Verifier)

- Claims checked: 6 | Verified: 6 | Failed: 0 | Unverified: 0
- `.oxlintrc.json` root co `"ignorePatterns": ["server"]`, `server/.oxlintrc.json`
  ton tai rieng — xac nhan khop `Dockerfile` COPY (dong 7, 13, 16), `compose.yaml`
  block `frontend.build` (context `.`, target `runtime`), `ci.yml`
  `cache-dependency-path` (dong 29-31), `README.md` dong 83-84 co lenh
  `npm install` / `npm run dev` chay tu root can sua.
- `docs/local-environment-and-ci.md` co tham chieu path can sua (moi phat hien
  qua validate interview, chua co trong Phase 3 ban dau): dong 27 "installs
  with `npm ci`" (thieu ro working-directory), dong 98 "`package.json` defines
  `lint` and `build`" (ngu y root package.json). Da propagate vao Phase 3.

### Cau hoi da hoi (2026-07-24)

1. **Chia commit:** Gop Phase 1+2 thanh 1 commit (di chuyen + sua Docker/compose),
   Phase 3 (CI/docs) mot commit rieng. Ly do: tach Phase 1 va 2 rieng se tao
   1 commit lam gay build tam thoi.
2. **Smoke test:** Chi can chay `npm run smoke:api` o Phase 4, khong can chay
   toan bo 11 smoke suite — plan khong dong logic `server/`, chi doi vi tri
   file build.
3. **Dockerfile stages:** Khong doi ten stage `build`/`runtime` hay them
   ARG/ENV moi — phase nay chi doi duong dan, khong doi logic build.
4. **Tai lieu khac:** `docs/local-environment-and-ci.md` can kiem tra va cap
   nhat cung dot — da phat hien 2 doan can sua, them vao Phase 3.

### Whole-Plan Consistency Sweep

Da doc lai `plan.md` va ca 4 `phase-*.md` sau khi ghi nhan quyet dinh tren.
Khong con thuat ngu cu, gia dinh bi bac bo, hay mau thuan giua cac phase.
Phase 3 da cap nhat them `docs/local-environment-and-ci.md` va huong dan chia
2 commit. Phase 4 da khop voi quyet dinh smoke:api-only. Khong con contradiction
chua giai quyet.

## Rui ro tong the

- Diff rat lon (rename hang tram file qua `git mv`) — PR nay phai tach rieng,
  khong gop voi thay doi tinh nang nao khac.
- Neu build context Docker khong con thay `server/` sau khi doi cau truc,
  Frontend build se gay loi TS2307 (khong resolve duoc import type) — day la
  loi da tung xay ra truoc day (xem memory `fe-docker-build-needs-server-context`),
  phai kiem tra ky o Phase 2 va 4.
- `.oxlintrc.json` o root hien co the ap dung chung ca `server/` (can kiem tra
  o Phase 1 truoc khi di chuyen) — neu co, phai giu 1 ban chung hoac tach ro
  cau hinh rieng cho tung thu muc.
