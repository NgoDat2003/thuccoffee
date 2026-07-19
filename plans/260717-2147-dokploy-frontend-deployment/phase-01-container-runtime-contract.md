---
phase: 1
title: "Container Runtime Contract"
status: completed
effort: "Small"
---

# Phase 1: Container Runtime Contract

## Overview

Create a repeatable Node build stage and an Nginx-only runtime on port 80.

## Implementation Steps

1. Add `.dockerignore` to exclude dependencies, builds, reports, secrets, and local state.
2. Add a multi-stage `Dockerfile` using `npm ci`, `npm run build`, and an Nginx runtime.
3. Add `deploy/nginx.conf` with `/healthz`, SPA fallback, gzip, baseline headers, strict static 404s, immutable asset caching, and non-cacheable HTML.

## Success Criteria

- [x] Runtime image contains only Nginx config and `dist/`.
- [x] Port 80 and the Docker healthcheck are explicit.
- [x] Docker build context excludes local secrets and unrelated large artifacts.

