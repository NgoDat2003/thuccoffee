# Monorepo Restructure: Frontend Moved into frontend/

**Date**: 2026-07-24 14:55
**Severity**: Medium
**Component**: Repo structure, Docker build, CI, TypeScript path resolution
**Status**: Resolved
**Commits**: `908ff31`, `78cd0ae`, `db5bd17`, `9b313d1`, `af6e3bb` (`refactor/monorepo-restructure`)

## What Happened

Tech Lead requested moving all frontend source from repo root into `frontend/`
(mirroring sibling project `maycha_QAQC_app`'s layout), keeping `server/` at
its current location. Brainstormed, planned in 4 phases, executed. The plan
correctly identified the Docker build-context constraint (frontend `tsc`
imports types straight from `server/src/**/*.schemas.ts`) but missed two
categories of breakage that only surfaced during actual execution: source-level
relative-import path shifts, and a Docker container structure mismatch that
broke those same imports a second time in a different way.

## The Brutal Truth

The brainstorm report verified the Docker COPY-context constraint by reading
the Dockerfile. It did not grep the source tree for relative imports crossing
the `frontend/`↔`server/` boundary. That gap cost two full rounds of "fix,
verify, discover it's still broken" — first on the host, then again inside
the container, because the two environments needed the import to resolve
differently once the directory depth changed.

Local `tsc -b --noEmit` passing was **not sufficient evidence** the refactor
worked. It passed because I ran it from inside `frontend/`, where the fixed
relative paths were correct. The Docker build then failed with the exact same
class of error, because `COPY frontend/. .` flattened the directory into
`/app`, silently changing the effective import depth back to what it was
before the move. Two "passing" verifications in two environments, two
different-but-related bugs. Only real compiler runs against the real build
artifact caught each one.

## Technical Details

**Finding #1 — Server importing frontend seed data (caught first, low risk):**
`server/src/db/seed.ts`, `seed-images.ts`, `source-image-object-key-resolver.ts`,
`server/scripts/scrape-product-options.ts`, and `server/tsconfig.seed.json`'s
`include` list all used relative paths like `../../../src/data/*.ts` pointing
at the pre-move root. Straightforward fix: insert `frontend/` into each path.
Verified via `server npm run build` (which runs `typecheck:seed` against the
exact file list).

**Finding #2 — Frontend importing server types, path depth wrong (caught via
tsc, not caught by my own manual counting):**
37 files under `frontend/src/**` use `import type` to pull Zod schema types
from `server/src/modules/**/*.schemas.ts`. Each file's relative path depth to
`server/` depends on how deep the file sits under `src/` — files that were at
`src/services/*.ts` (2 levels) needed one more `../`; files at
`src/components/admin/forms/*.tsx` (4 levels) needed two more. I manually
counted directory depths and got it wrong for a subgroup — missed the
`components/admin/forms/` files entirely on the first pass because I'd only
listed the directories I remembered, not the ones `grep` actually found.
Running `tsc -b --noEmit` for real (after `npm install` in `frontend/`, since
`node_modules` didn't exist yet post-move) is what caught the remaining 4
files with `TS2307`. Manual path arithmetic is not a substitute for compiling.

**Finding #3 — Docker COPY flattening broke the fix that Finding #2 just made:**
After fixing all 37 relative imports to be correct **on the host**
(`frontend/src/services/x.ts` → `../../../server/...`), a direct
`docker build -f frontend/Dockerfile .` failed with the same `TS2307` errors
— but now inside the container. Root cause: `COPY frontend/. .` copies
`frontend/`'s *contents* into `/app`, so inside the container the file sits
at `/app/src/services/x.ts`, and `../../server/...` (2 levels, the *original*
pre-move depth) would have been correct — but the source now says 3 levels,
because I'd fixed it for the host layout. Host and container needed
contradictory path depths for the same file. Not fixable by picking either
depth; the two environments had genuinely different directory structures for
the same source tree.

**Resolution:** switched from relative imports to a TypeScript path alias
(`"@server/*": ["../server/*"]` in `frontend/tsconfig.app.json`, no `baseUrl`
— deprecated in this TS version) *and* changed the Dockerfile to preserve
`frontend/` and `server/` as parallel sibling directories inside the image
(`COPY frontend/. ./frontend/`, `WORKDIR /app/frontend` before build) instead
of flattening. The alias is still a relative path under the hood
(`../server/*`), so it only works if host and container have matching
directory shapes — which is now true. Confirmed via `import type` +
`verbatimModuleSyntax`: these imports are 100% type-only and get stripped
from the Vite bundle, so no `resolve.alias` change was needed on the Vite
side, only in `tsconfig.app.json` for the type-checker. Verified zero
`server/src` references in `dist/assets/*.js` before committing to that
reasoning.

**Finding #4 — `server/tsconfig.seed.json` also typechecks a file that now
uses the alias:** `frontend/src/data/products.ts` is in `tsconfig.seed.json`'s
`include` list (it's real seed data, typechecked from the `server/` side too).
It also got converted to `@server/*`. `tsconfig.seed.json` doesn't inherit
`frontend/tsconfig.app.json`'s alias, so it needed its own
`"paths": { "@server/*": ["./*"] }` (relative to `server/`, since that
tsconfig's `rootDir` is the repo root).

**Finding #5 — CI-only failure, not related to the restructure's own logic:**
First CI push failed on `server/scripts/scrape-product-options.ts` — Cannot
find module 'axios'. Confirmed via `git show main:...` this file always
imported `axios` without it being in `server/package.json`. It "worked"
before only because `npm ci` ran once at repo root with one shared
`node_modules`, and Node's module resolution walks up parent directories —
`axios` (a frontend dependency) was reachable from `server/scripts/` by
accident. Splitting into two independent `npm ci` installs (`frontend/` and
`server/`) removed that accidental path. Not a bug I introduced structurally,
but a latent bug the restructure's *side effect* (separate node_modules
trees) exposed. Fixed by adding `axios` to `server/package.json`
devDependencies, then swept the rest of `server/scripts/` + `server/src/`
for the same class of issue (found none).

## What We Tried

1. Relative path fix on host only → passed local `tsc`, failed Docker build
   (Finding #3)
2. Considered: fix Dockerfile to flatten differently, keep relative imports
   → rejected by user, who specifically wanted alias-based imports "vì đang
   restructure lại", not another one-off relative-path patch
3. Alias (`@server/*`) + Dockerfile keeps parallel directory structure → both
   verified independently (host `tsc`, then a cold-cache `docker build` by
   the code-reviewer subagent)
4. Code review flagged `server/tsconfig.seed.json`'s alias block as unused
   dead config → verified false positive by actually deleting it and
   re-running `typecheck:seed`, which failed with the exact TS2307 it was
   protecting against. Restored it. Reviewer's grep likely searched only
   inside `server/`, missing that `tsconfig.seed.json` also typechecks a
   file physically located in `frontend/`.

## Root Cause Analysis

The brainstorm's scope was Docker build context only, because that's what
the user's original request emphasized ("compose ra ngoài 1 cấp"). Nobody —
brainstorm, plan, or my own first implementation pass — asked "does any
source file reference the other side by relative path?" until `git mv` had
already happened and the first `tsc` run surfaced it organically. For a
directory-move refactor specifically, relative-import breakage is not an
edge case, it's the primary risk category, and should be the first thing
grepped for before writing any plan phase, not something discovered
mid-execution.

Second-order cause: I treated "passes locally" as sufficient before treating
"passes in the actual Docker build" as a separate, harder requirement. They
are not interchangeable checks for a refactor that changes directory shape,
because the two environments materialize that shape differently.

## Lessons Learned

**On refactors that move directories:**
- Before planning, grep the *entire* repo (not just the directories you
  intend to move) for relative imports whose target crosses the move
  boundary in either direction. Both `frontend→server` and `server→frontend`
  had breakage here; only one direction was anticipated in the brainstorm.

**On "verified" claims for path-sensitive changes:**
- `tsc -b --noEmit` passing on the host is necessary but not sufficient when
  the change also touches a Docker COPY layout. The two need independent
  verification because they can materialize different directory depths for
  identical source code. Don't stop at the first green compiler run.

**On path aliases vs. relative paths for cross-workspace type imports:**
- An alias doesn't eliminate the host/container path-depth problem — it's
  still a relative path under the hood (`../server/*`). It **does** make the
  fix a single point of truth (one `tsconfig.app.json` entry vs. 37
  scattered `../../../` counts) and removes the "which depth is this file
  at" arithmetic that caused Finding #2's missed subgroup. The real fix for
  the host/container mismatch was the Dockerfile change to preserve parallel
  structure — the alias just made that fix maintainable going forward.

**On code review findings:**
- A "dead/unused config" flag is falsifiable in seconds by deleting it and
  re-running the check it might be protecting. Did that here and it saved
  reverting a real fix based on a grep that had an incomplete search scope
  (missed a file physically outside the directory it grepped, referenced via
  `tsconfig` `include`).

**On CI vs. local:**
- A latent missing-dependency bug that "worked" for months because of shared
  `node_modules` at repo root will not survive a workspace split. If a
  restructure separates previously-shared `node_modules` trees, expect and
  budget time for exactly this class of surprise on the first clean-runner
  CI push, not before.

## Next Steps

1. ✅ Pushed to `refactor/monorepo-restructure`, CI green on both jobs
   (`lint-and-build`, `docker`), full Compose stack verified healthy locally
2. Not yet merged to `main` — awaiting user review/PR
3. User raised a follow-up idea (shared `packages/` folder for FE+BE common
   code, à la `maycha_QAQC_app`) — explicitly deferred to a separate
   brainstorm, not folded into this PR
4. `docs/local-environment-and-ci.md` has a pre-existing (unrelated to this
   refactor) inaccuracy about the CI `docker` job actually running
   containers — it doesn't, it only builds. Flagged by code review, left
   as-is, noted here for whoever does the next doc-accuracy pass

## Emotions

Two "I fixed it" moments that turned out to be only half-fixes back to back
(host-only relative path fix, then the alias without the Dockerfile change)
was humbling — each time the fix felt complete because the previous checker
went green. The pattern that actually worked was not trusting green until
the check matched the real deployment shape, not a proxy for it. Relieving
when the code-reviewer's cold-cache Docker rebuild independently confirmed
the same result I'd gotten locally — that's the kind of verification that
actually earns trust, not just repeating the same command a second time.
