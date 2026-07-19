---
title: "Dokploy Frontend Deployment"
description: "Containerize the React/Vite SPA and document a reproducible Dokploy deployment handoff."
status: completed
priority: P2
branch: "main"
created: "2026-07-17T21:47:00+07:00"
completed: "2026-07-17"
---

# Dokploy Frontend Deployment

## Overview

Prepare the existing frontend for Dokploy without changing application behavior. Build with Node, serve the generated SPA with Nginx, preserve deep links, expose a health endpoint, and document exact handoff values.

## Scope

- Add `Dockerfile`, `.dockerignore`, and `deploy/nginx.conf`.
- Add `docs/deployment.md` for local and Dokploy operations.
- Verify source build and the final container runtime contract.

## Out of Scope

- VPS provisioning, Dokploy installation, DNS/SSL mutations, or production credentials.
- Backend, database, registry CI, or application feature changes.

## Phases

| Phase | Name | Status |
|---|---|---|
| 1 | [Container Runtime Contract](./phase-01-container-runtime-contract.md) | Completed |
| 2 | [Deployment Documentation and Dokploy Handoff](./phase-02-deployment-documentation-and-dokploy-handoff.md) | Completed |
| 3 | [Local Verification and Release Gate](./phase-03-local-verification-and-release-gate.md) | Completed |

## Dependencies

- Docker Desktop for local image/runtime verification.
- A Dokploy instance, Git connection, domain, and DNS access for actual go-live.

## Acceptance Evidence

- Lint and Vite build passed.
- Fresh Docker image build passed with 0 dependency vulnerabilities reported by `npm ci`.
- `/healthz`, SPA deep routes, strict static 404s, cache policy, and Docker health passed.
- Final code review reported no remaining actionable findings.
