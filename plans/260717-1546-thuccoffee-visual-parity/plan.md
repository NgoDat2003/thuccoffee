---
title: "Thức Coffee Visual Parity Fixes"
description: "Fix visual-parity and route/data gaps in the static React clone so it matches thuccoffee.com.vn."
status: completed
priority: P1
effort: 26h
branch: "main"
tags: [frontend, react, visual-parity, clone, tailwind]
blockedBy: [260717-1000-thuccoffee-static-clone]
blocks: []
created: "2026-07-17"
createdBy: "ck:plan"
source: skill
---

# Thức Coffee Visual Parity Fixes

## Overview

Follow-on to the completed `260717-1000-thuccoffee-static-clone` (100% built, but diverges from source). The gap audit found the clone shrank scope vs the real site: wrong shared shell (footer/header/hero), dead menu-category deep-links, blog pagination that redirects, incomplete store/product media, and paraphrased static copy. This plan closes those gaps against exact source CSS values and real crawled content — no new crawl. Fix order = audit severity: P0 shared shell first (touches every route), then routes/data (2-5), then static content (6), then QA (7).

Source of truth: `plans/260717-1000-thuccoffee-static-clone/reports/{brainstorm-visual-parity-fixes,clone-website-gap-audit,source-website-scout-report}.md`, `thuccoffee-site-crawl.json`, `source-full-media-manifest.json`, `research/site-style.css`.

## Phases

| Phase | Name | Status | Depends on |
|-------|------|--------|-----------|
| 1 | [Shared shell rebuild](./phase-01-shared-shell-rebuild.md) | Completed | — |
| 2 | [Menu category deep-links](./phase-02-menu-category-deep-links.md) | Completed | 1 |
| 3 | [Blog expansion and pagination](./phase-03-blog-expansion-and-pagination.md) | Completed | 1 |
| 4 | [Store default-detail and galleries](./phase-04-store-default-detail-and-galleries.md) | Completed | 1 |
| 5 | [Product data enrichment](./phase-05-product-data-enrichment.md) | Completed | 1 |
| 6 | [Static page content rewrite](./phase-06-static-page-content-rewrite.md) | Completed | 1 |
| 7 | [Final QA sweep](./phase-07-final-qa-sweep.md) | Completed | 1-6 |

Phase 1 is the hard blocker (global tokens + header height + breadcrumb removal touch every route). Phases 2-6 are independent of each other (distinct files) and can run in parallel after 1. Phase 7 verifies everything.

## Dependencies

- **Cross-plan:** builds on output of `260717-1000-thuccoffee-static-clone` (done).
- **Two origin download passes** (phases 4 & 5) reuse `scripts/download-images.sh` over `http://` (broken origin cert) with HEAD pre-flight + Content-Type gate + hard-fail.
- **Routing hazard:** category route (phase 2) and product route share `/menu/*` — disambiguation is the trickiest change; see phase 2.
- **Breakpoint tension:** source parity needs 768px nav switch, but the prior plan chose 1024px to avoid nav crowding — mega-menu must be re-sized to fit 768px (phase 1 risk).
