---
phase: 2
title: "Deployment Documentation and Dokploy Handoff"
status: completed
effort: "Small"
---

# Phase 2: Deployment Documentation and Dokploy Handoff

## Overview

Document the exact local and Dokploy deployment contract without storing credentials.

## Implementation Steps

1. Add `docs/deployment.md` with build, run, health, deep-link, static 404, cache, and health-state checks.
2. Specify Git source, branch, build path, Dockerfile context/stage, domain path/port/TLS/certificate, and auto-deploy.
3. Document rollback modes and common 404/502/cache/build-memory failure diagnosis.
4. Reserve the future backend and database as separate Dokploy services.

## Success Criteria

- [x] Every required Dokploy UI value is documented or explicitly `TBD`.
- [x] No token, private URL, credential, or `.env` content is present.
- [x] Frontend/backend service separation is clear.
