# Admin CMS Expansion: Scope Reversal After Code Review

**Date**: 2026-07-24 19:30
**Severity**: Medium
**Component**: Admin CMS (Tiptap editor, product fields, gallery/FAQ pages)
**Status**: Resolved
**Commit**: `c5987bf` (28 files changed, `feat/public-parity-cms-scope`)

## What Happened

Three independent CMS features queued in one brainstorm session:
1. Expand Tiptap blog editor toolbar (blockquote, code, tables, text-align, color/highlight)
2. Add new nullable `content` field to products, reuse editor component
3. Split combined "Gallery & FAQ" admin page into two separate pages

Plan validated with 12 verified facts, identified—and **explicitly rejected**—a scope-creep item (YouTube embed) that wasn't user-requested. Implemented all 3 phases, ran code review, discovered architecture contradiction, reversed original design decision mid-implementation, fixed two real bugs, and validated via byte-identity regression test on 267 production blog posts.

## The Brutal Truth

The original plan locked product content into a "minimal whitelist" (no tables, blockquotes, code) to avoid applying unvalidated blog patterns to a new field. That sounded cautious. But **code review exposed the lie**: `ContentEditor` was reused as-is with the full blog toolbar, creating a UI/backend mismatch where highlighted text vanished on save with no error, merge-cell markup turned into broken text, etc.

Had to choose: either add toolbar parameter complexity (two modes of a shared component) or expand product's sanitizer to match the UI. User chose simpler architecture — reverse the original decision. It felt like admitting the plan was wrong. It was.

The frustrating part: the contradiction was latent in the original decision itself ("reuse component, keep product whitelist minimal") but wasn't visible until implementation forced it concrete. Plan validation didn't catch it because validation verified file paths and caller counts, not whether design tradeoffs were realistic.

## Technical Details

**Finding #1 — Architecture contradiction:**
- `src/components/admin/content-editor/ContentEditor.tsx` (renamed from `BlogContentEditor`) uses `createBlogEditorExtensions()` for both blog and product
- `src/modules/products/products-content-sanitizer.ts` (Phase 2, original) allowed: `p, br, strong, em, u, h1-h3, ul/ol/li, a, img, div, span` — denied tables, blockquotes, code
- User creates table in product editor → markup saves with `<table>` → sanitizer strips `<table>` → frontend renders disconnected text "cellquotecode"
- No error raised; editor shows table, database has text fragments

**Finding #2 — Missing highlight tag:**
- `<mark>` tag (from `@tiptap/extension-highlight`) not in `allowedTags` for both sanitizers
- User highlights text, saves → `<mark>` stripped → text unstyled, no user feedback

**Finding #3 — Heading text-align stripped:**
- `style` attribute missing from `allowedAttributes` for `h1`, `h2`, `h3` in both sanitizers
- TextAlign applies inline style (e.g., `style="text-align: center"`) to all heading levels
- Heading alignment silently lost on save

Verified all three via direct `sanitize-html` package call, not code inspection alone.

**Finding #4 — Unrelated diff:**
- `AdminPagesPage.tsx` had stray `max-w` edits creeping into working tree from unrelated merge
- Reverted via `git checkout --`

## What We Tried

1. **Original plan decision**: product sanitizer stays minimal, avoid over-applying blog patterns to unvalidated field → locked in Validation Log Q3
2. **Code review found contradiction**: toolbar and sanitizer misaligned on what's allowed
3. **Debated fix with user**:
   - Option A: Narrow toolbar for products (parameterize extensions per owner type)
   - Option B: Widen product sanitizer to match blog (simpler architecture, one component one feature set)
   - **Chosen**: Option B — reverse original decision

## Root Cause Analysis

The plan framed product content as "field for the future" and tried to be conservative by keeping its whitelist minimal. But **the decision didn't account for component reuse math**: if `ContentEditor` is a single, reusable component with one set of extensions, its toolbar *is* its contract. You can't whitelist half the toolbar's output. You either (a) add conditional logic to strip toolbar buttons, or (b) widen the backend to accept what the UI generates.

Adding conditional logic = complexity. Widening whitelist = simpler code, but reverses the original "be conservative" thesis. User chose simpler.

The plan validation step should have caught this during "Architecture" review (Question 2 about component reuse) by asking: "if toolbar and sanitizer diverge, which one wins?" It didn't; validation was focused on file paths and caller counts, not design coherence under constraints.

## Lessons Learned

**On scope creep from AI suggestions:**
- YouTube embed was in brainstorm output because the instruction was "enable all Tiptap extensions available" — that triggered pattern-completion bias. User didn't request it. Plan validation asked "did you actually ask for this?" and removed it. This worked.

**On conservative design decisions:**
- "Be minimal until we have production data" is sound for schema design (you can add columns later). It's *not* sound for component/API contracts that others will reuse as-is. If you commit a component to shared use, its capability surface = its contract. Can't narrow it at runtime.
- Future check: When locking design decisions about shared components, ask "what happens if this gets reused with different inputs than we anticipated?" Don't just check file paths exist.

**On code-review finding verification:**
- Received a "false positive" review flag about `&nbsp;` byte mismatch between two files. Rather than trust the reviewer's test output, ran the actual `sanitize-html` call independently. The reviewer's test had a typo; the actual files were correct. 
- Lesson: trust review findings that are independently verifiable (bugs you can reproduce), skeptical of findings that depend on reviewer's test setup. Always ask "did they run the actual code or analyze the code?"

**On phase file currency:**
- Phase 2 description now contradicts actual implementation (says "keep minimal whitelist" but code has full blog whitelist). Could rewrite phase file, but chose to annotate Validation Log instead: clear timestamp, clear rationale for reversal, let reader understand it was a deliberate decision not a doc bug. Phase files are historical once completed; Validation Log is decision record.

## Next Steps

1. ✅ Commit to `feat/public-parity-cms-scope` — ready for review/merge
2. Monitor product content editor in production: if data/UX feedback suggests some tags *should* stay disabled (e.g., embargo tables on products for UI reasons), add toolbar parameterization then. Until then, YAGNI.
3. Track component reuse in future plans: review questions should include "what's the full capability surface of this component?" and "is it the same for all use cases?" before locking decisions

## Emotions

Annoyed at myself for not catching the contradiction earlier — the plan validation found YouTube/video was AI-proposed, why didn't it flag "toolbar capability vs. sanitizer whitelist" as a potential mismatch? Satisfying to see code review catch real bugs (mark tag, heading style-attr, table mismatch) through independent verification, not just "code looks wrong." The false-positive finding proved that skepticism toward AI analysis is justified — always re-verify before accepting a finding as ground truth.
