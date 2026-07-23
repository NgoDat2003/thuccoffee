---
phase: 5
title: "Integration and visual verification"
status: completed
effort: "1 day"
dependsOn: [1, 2, 3, 4]
---

# Phase 5: Integration and visual verification

## Overview

Run the full regression matrix against freshly rebuilt Compose services and compare the
admin visually and behaviorally at desktop, tablet, and mobile sizes.

## Related Code Files

- Add: `playwright.config.ts`
- Add: `e2e/admin-ui-overhaul.spec.ts`
- Modify: `package.json`, `package-lock.json`
- Output: `test-results/admin-ui-overhaul/`

The Playwright spec reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment,
creates records with an `e2e-admin-ui-` prefix, and deletes them in teardown. Never
hardcode credentials or leave test media/content behind.

## Verification Commands

```powershell
docker compose up -d --build
docker compose ps
npm run test:admin-ui
npm run lint
npm run build
npm run test:admin-e2e
Push-Location server
npm run lint
npm run build
npm run smoke:auth
npm run smoke:upload
npm run smoke:admin-products
npm run smoke:admin-blog
npm run smoke:admin-stores
npm run smoke:admin-banners-settings
npm run smoke:api
npm run smoke:images
Pop-Location
```

## Implementation Steps

1. Rebuild/recreate the existing Compose stack without `down -v`; wait for Postgres,
   MinIO, backend, and frontend health before any smoke or browser test.
2. Run all commands above. Test teardown must remove products, posts, stores, banners,
   uploads, and setting changes created by the test run.
3. Browser-test Products, Categories, Blog list/form, Stores/gallery, Banners, Settings,
   login/logout, drawer keyboard behavior, dirty guard, filters, global sort, pagination,
   selection, CRUD, upload, preview, publish, delete, and public-site reflection.
4. Capture deterministic screenshots at 375, 768, 1024, 1440, and 1920px into the
   output directory. Assert no page-level horizontal overflow; tables may scroll.
5. Inspect Vite manifest/chunks: Tiptap modules must be absent from public entry chunks
   and public-entry gzip growth must be <=5 KiB from the recorded Phase 1 baseline.
6. Fill the plan Validation Log with commands, check counts, screenshot paths, bundle
   measurements, cleanup evidence, limitations, and intentional deviations.

## Success Criteria

- [x] Root tests/lint/build and server lint/build are green.
- [x] All eight existing smoke suites are green against newly rebuilt containers.
- [x] Combined Playwright UI matrix plus API smoke suites cover CRUD, filter, sort, pagination, upload, cleanup, and public reflection. Browser-only CRUD is limited where resources intentionally have no delete endpoint.
- [x] Category uses full width; Store/Banner are specialized; Blog has safe Visual/HTML
      editing; public pages reflect mutations after query invalidation.
- [x] Responsive screenshots show no clipped controls or page-level overflow.
- [x] Keyboard focus, table semantics, dialog ESC, labels, destructive confirmations,
      and editor controls are usable.
- [x] Tiptap chunk isolation, gzip threshold, teardown, and Validation Log are evidenced.
