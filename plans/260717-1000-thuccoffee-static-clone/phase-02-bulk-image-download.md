---
phase: 2
title: "bulk-image-download"
status: pending
effort: "2h"
---

# Phase 2: Bulk Image Download

## Context Links
- Master image list (92 URLs): `research/crawl-report.md` §"Full Image URL Master List" + `research/images.txt`
- Product thumb mapping: `research/crawl-report.md` product table (thumb column per SKU)

## Overview
- **Priority:** P1 (blocks data layer + all UI — real assets required)
- **Status:** Pending
- One-time fetch of all 92 images from origin over **plain HTTP** into `src/assets/images/` subfolders.
- Dedicated, isolated, early phase. No UI work here.

## Key Insights
- MUST use `http://www.thuccoffee.com.vn` — HTTPS cert is mismatched (points at unrelated domain). HTTP returns real content.
- Paths in list already begin with `/s-media/...` or `/Content/images/...` → prepend origin only.
- Two filename families under `/s-media/`:
  - `thumbs-{hash}_{name}.ext` — product/social **thumbnails** (grid/list views).
  - `{hash}_{name}.ext` (no `thumbs-` prefix) — **full-res** (detail-page lightbox). BOTH needed.
- Product full-res is same base name as thumb minus `thumbs-` prefix (verified: `thumbs-847b9f4d_berry-mango.jpg` ↔ `847b9f4d_berry-mango.jpg`).
- 45 thumbs + 45 full-res + 2 UI icons = 92 (per crawl breakdown).
- Filenames carry a hash prefix → globally unique, safe to flatten one folder per category. Keep original filenames (data layer references them verbatim).

## Requirements
### Functional
- All 92 URLs downloaded; 0 missing / 0-byte files. Verify count + sizes.
- Files organized into `src/assets/images/{products,blog,stores,site}/` by usage.
### Non-functional
- **Idempotent + resume-safe (red-team fix — Failure Mode Analyst finding):** download to a `.tmp` suffix, atomic-rename to final name only on success. Re-run skips files whose final (non-`.tmp`) name already exists AND passes the size/type check — so an interrupted `ck plan cook` run can resume cheaply without re-downloading or mistaking a truncated file for complete.
- **Hard fail-gate (red-team fix — Failure Mode Analyst + Security Adversary findings):** script exits non-zero if fail count > 0 OR if any downloaded file's `Content-Type`/magic bytes don't match `image/*`. Phase 3 must not start until this phase's script exits 0 — no silent proceed on partial failure.

## Architecture
- **Input:** `scripts/image-urls.txt` — the 92 paths (copied from `images.txt`), optionally annotated with target subfolder.
- **Script:** `scripts/download-images.sh` (bash + curl loop). Simple, one-time.
- **Output:** files under `src/assets/images/{sub}/{original-filename}`.
- **Data flow:** read URL list → `curl http://origin{path} -o dest` → post-check filesize>0.

### Subfolder assignment (by usage, planner's mapping)
- `products/` — 42 product thumbs (`thumbs-*_<product>.jpg/png`) + their 42 full-res counterparts.
- `blog/` — 5 blog covers (`c8918c3a_social-post.jpg`, `2fc62206_social-1.jpg`, `9d5cb020_combo-dem-social.jpg`, `1fbf3667_combo-chieu-social.jpg`, `493fc115_combo-sang-social.jpg`) + related social/promo graphics used on home.
- `stores/` — store photos (`1498c923_thuc-nts.jpg`, `170ff33_thuc2d41.jpg`, `2fa7f203_thuc37ltt1.jpg`, `698435b6_thuc-duong41.jpg`, other `thuc-*`/store cover jpgs).
- `site/` — logo (`151b6674_circlelogo-white-blue-jul2023.png`), UI icons (`/Content/images/icon-coffee.png`, `icon-delivery.png`), badge svgs (`5e78229d_bestsales.svg`, `5e88548f_newproduct.svg`), banner/cover images, gallery/misc.
- **Every line in `scripts/image-urls.txt` must carry an explicit target-subfolder annotation before the script runs (red-team fix — Security Adversary finding: "optional" annotation made re-runs non-reproducible for ~20 ambiguous files).** When unsure → `site/`, but the choice must be written down, not decided ad hoc at download time.

## Related Code Files
### Create
- `scripts/image-urls.txt` — 92 source paths, each annotated with target subfolder (from `research/images.txt`).
- `scripts/download-images.sh` — curl download loop with origin prefix, dest routing, tmp+rename, Content-Type gate, hard fail-exit.
- `src/assets/images/products/`, `blog/`, `stores/`, `site/` — populated with downloaded assets.
### Decision: commit the script?
- Commit `scripts/download-images.sh` + `scripts/image-urls.txt` (reproducibility; tiny; documents asset provenance). Downloaded images committed as normal repo assets.

## Implementation Steps
1. Create `scripts/image-urls.txt` from `research/images.txt` (92 lines, each a `/...` path + subfolder annotation, decided up front per the bucket rules above — not during the run).
2. **Pre-flight HEAD-check sweep (red-team fix — Assumption Destroyer finding: origin's broken HTTPS cert suggests neglected infra, higher drift risk than "Low"):** `curl -I` all 92 URLs first; abort early with a clear report if more than a handful fail, rather than discovering a large-scale origin failure after building 3 phases of UI.
3. Write `scripts/download-images.sh`:
   - `ORIGIN="http://www.thuccoffee.com.vn"`
   - Loop each annotated path; download to `$dest.tmp`.
   - `curl -fSL "$ORIGIN$path" -o "$dest.tmp"` (`-f` fail on HTTP error).
   - Gate: run `file --mime-type "$dest.tmp"` (or equivalent) on every file — must start with `image/`; reject and mark FAIL otherwise (catches a 200-with-HTML-error-body, which `curl -f` alone does not catch).
   - On pass: atomic-rename `$dest.tmp` → `$dest`. On re-run, skip paths whose `$dest` already exists and passes the same type check.
   - Print per-file OK/FAIL; tally at end; **exit non-zero if any FAIL remains**.
4. Run script from repo root (bash). Script must exit 0 before proceeding — do not move to Phase 3 on a non-zero exit.
5. Verify: `find src/assets/images -type f | wc -l` == 92 (or documented delta); check no 0-byte files (`find ... -size 0`).
6. Retry any FAIL individually; if a URL 404s on origin, note in phase report and pick nearest valid asset or a `site/` placeholder — then re-run the script so it exits 0.

## Todo List
- [ ] Build `scripts/image-urls.txt` (92 paths, each with a subfolder annotation)
- [ ] HEAD-check sweep before full download
- [ ] Write `download-images.sh` (tmp+rename, Content-Type gate, hard exit-on-fail)
- [ ] Run download over HTTP; resolve FAILs until script exits 0
- [ ] Verify count == 92 and no 0-byte/non-image files (automated, all 92 — not a manual spot-check)
- [ ] Commit script + assets

## Success Criteria
- [ ] 92 files present under `src/assets/images/**` (or documented count with reason for any delta).
- [ ] No 0-byte / HTML-error-page files — verified automatically for all 92 files via Content-Type/magic-byte check, not a manual spot-check.
- [ ] Every product SKU has BOTH thumb and full-res file present.
- [ ] Logo, badges, UI icons downloaded.
- [ ] `download-images.sh` exits 0 (hard gate before Phase 3 starts).

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Origin returns HTML error page instead of image (200 w/ wrong body) | Med | Med | Automated `Content-Type`/magic-byte check on all 92 files (not spot-check); `curl -f` alone does not catch this case. |
| A cataloged URL 404s (asset removed since crawl) | **Med** (re-rated up from Low — red-team fix, Assumption Destroyer: origin's broken HTTPS cert is evidence of neglected infra) | Med | Pre-flight HEAD-check sweep catches large-scale drift early; per-file note + substitute nearest asset or `site/` placeholder for isolated 404s. |
| **Broken HTTPS cert on origin** (informational) | High | None | Use `http://` — expected, NOT a blocker; one-time fetch, no runtime dependency on origin. |
| Some full-res product images may not exist (only thumb) | Low | Low | If full-res 404s, lightbox falls back to thumb; document affected SKUs. |
| Script interrupted mid-run (session timeout, network blip) | Med | Low | `.tmp` + atomic-rename means a resume never mistakes a truncated file for complete; re-run is cheap (skips done files). |

## Security Considerations
- Downloading third-party images for a demo clone. No code execution from assets. Do not fetch/execute any remote scripts.
- Assets committed to repo; ensure no unexpected large binaries.

## Next Steps
- Phase 3 (data layer) references these filenames by path.
