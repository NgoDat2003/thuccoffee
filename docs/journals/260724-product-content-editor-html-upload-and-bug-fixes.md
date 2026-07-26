# Product Content Editor: HTML-Mode Image Upload, Span/Div Support Rejection, Closure Bug Fix

**Date**: 2026-07-24
**Severity**: Critical (for the closure bug) + Medium (operational friction)
**Component**: ContentEditor.tsx, Tiptap extension prototype (discarded), Docker build cache
**Status**: Resolved (all bugs fixed and verified); merge/push to main+origin+work pending immediately after this entry
**Commits**: On branch `fix/product-content-editor`, not yet merged at time of writing

## What Happened

Session built on the earlier `260724-product-content-editor` work (ported asset prefix handling to product editor, added public API rendering). That work locked legacy blog posts with `<span style>` / `<div style>` tags into raw HTML mode (because Tiptap round-trip mangled hex colors + doubled tags). This session investigated whether adding Tiptap extension support for `<span style>`/`<div style>` would let legacy posts edit in WYSIWYG mode instead of staying locked, tested it against the real 267-post corpus, found it fundamentally unworkable, and rejected the approach. That left a real UX gap: HTML-lock mode had zero way to upload new images (no toolbar exists in the raw-textarea branch). Built a feature to close that gap. Code review caught a critical bug in the new feature (closure over a stale prop value during the async upload), fixed it, re-verified. User manually confirmed in browser afterward.

## The Brutal Truth

The HTML-mode image upload feature started with a straightforward idea — add a button, invoke the existing upload handler, insert the result. Initial implementation looked clean locally. Code review found a **silent data loss bug** that would corrupt multi-image uploads: the implementation captured the `value` prop in a closure at render time, then `await`ed an async upload, then spliced the new image into that stale captured string. If the user kept typing during the upload (which takes real time), their new keystrokes got written to the live textarea but then **discarded entirely** when the stale string was written back. No error, no warning — just silently lost keystrokes.

That's the kind of bug that passes local testing (because humans don't typically type during file uploads) but would corrupt actual user content in production. A non-obvious async/closure interaction that only surfaced under the pressure of code review reading the raw implementation, not simulator-thinking it through.

The span/div support investigation was emotionally harder — spent time building a working Tiptap extension, testing it against 245 real legacy posts, finding zero success, and having to admit "this approach doesn't work." That's a sunk-cost-fallacy moment, where the rational thing is to move on, but it *feels* like waste. It wasn't — ruling out a dead-end based on empirical evidence against real data is exactly the work that prevents shipping broken features later.

## Technical Details

### 1. HTML-Mode Image Upload Feature

**Rationale:** Previous session locked ~245 legacy blog posts with inline style markup into raw HTML mode (browser's `CSSStyleDeclaration` normalizes hex colors to `rgb()`, `<span>` tags get doubled during Tiptap parse/serialize, etc.). This prevents WYSIWYG editing. But it also meant **zero image upload capability in HTML mode** — the Tiptap toolbar doesn't exist when the editor is a raw textarea, so users stuck with locked content had no UI to upload new images at all.

**Implementation** (`frontend/src/components/admin/blog-editor/ContentEditor.tsx`):
- Added hidden `<input type="file">` (`htmlInputRef`) and a `htmlTextareaRef` on the textarea, rendered only in the HTML-mode branch
- Added "Tải ảnh lên" (Upload Image) button that triggers `htmlInputRef.current?.click()`
- On file selection, `uploadIntoHtml()` calls the existing `onUploadImage(file)` prop (same handler used by visual mode)
- Inserts resulting image tag into the textarea at the cursor position: `<img src="{assetUrlScheme}:{objectKey}" alt="{file.name}">`
- Cursor position (`selectionStart`/`selectionEnd`) is captured **before** the `await`, so a moving cursor during upload doesn't shift the insertion point from where the user clicked

**Code Review Finding (CRITICAL):** the first version spliced the new `<img>` tag into the `value` *prop* (`value.slice(0, start) + imgTag + value.slice(end)`) after `await onUploadImage(file)` resolved. Since `value` is a prop closed over at the time `uploadIntoHtml` was invoked, any keystrokes the user made in the textarea while the upload was in flight (a real async operation, not instant) were already reflected in the DOM and in the parent's state via the textarea's own `onChange` — but `uploadIntoHtml`'s closure still held the *old* `value`. Writing `onChange(oldValue-based-string)` overwrote the parent state back to the pre-upload snapshot, silently discarding everything typed in between.

**Fix:** read `htmlTextareaRef.current.value` (the live DOM value) at the moment of insertion instead of the closed-over `value` prop, so any keystrokes made during the upload are preserved and the new `<img>` tag is spliced into the current content, not a stale snapshot.

This is a **silent data corruption bug** — no exception, just lost user input. Would likely have shipped undetected through typical manual testing (a human doesn't usually type while a file dialog/upload is in progress). Code review discipline caught it by tracing the async/closure timing explicitly.

### 2. Span/Div Support Investigation & Rejection

**Hypothesis:** If we add a Tiptap extension to parse/serialize `<span style>` and `<div style>` tags correctly, we could edit legacy blog posts in WYSIWYG mode instead of locking them to raw HTML.

**Experiment Design:**
- Built a `StyleTagExtension` that:
  - Extends Tiptap's `Mark` and `Node` classes
  - Defined parsing rules to recognize `<span style="color: ...">` as a `textStyle` mark
  - Defined rendering rules to serialize back to raw `<span>` tags
- Ran it against the actual corpus: grabbed all 267 scraped blog posts from the live database
- Filtered to posts that had `<span style>` or `<div style>` tags (245 posts matched)
- Round-trip test: parse HTML → serialize → compare to original

**Results: 0/245 posts survived the round-trip.** Failures fell into three categories:

1. **Hex color mangling (major):** `<span style="color: #ff6b35;">text</span>` parses into Tiptap's DOM node, where `CSSStyleDeclaration.color` auto-normalizes hex to `rgb()` — serializes back as `<span style="color: rgb(255, 107, 53);">`. Not identical to source.

2. **Tag doubling / nesting (major):** `<span style="color: ..." ><span style="font-weight: ...">nested</span></span>` — Tiptap's serializer called the schema's `toDOM` twice per node in certain nesting patterns, producing extra wrapper spans or doubled closing tags.

3. **Unexpected text wrapping (moderate):** Plain text at the top level of the content (`"Some text <span>highlighted</span>"`) got wrapped in an auto-generated `<p>` tag during parse, changing the structure. Not all 245 posts exhibited this, but enough to make the feature unreliable.

**Conclusion:** The DOM's style normalization is a **fundamental limitation**, not an implementation bug. You cannot round-trip hex colors through the browser's `CSSStyleDeclaration` API and get bit-for-bit identity. Tiptap's design expects source-of-truth content to be in its schema format, not arbitrary legacy HTML. Trying to retrofit support for arbitrary legacy HTML via DOM parsing is not viable.

**Decision: Do not pursue this.** The existing HTML-lock behavior for legacy posts is **correct**, not a gap to close. Legacy posts are read-only in visual mode; users who need to edit them can switch to HTML mode and edit raw markup. That's the appropriate trade-off.

### 3. Generalized Asset Prefix Regex (Finding from Code Review)

During review of `BlogAssetImage.tsx`'s earlier fix to generalize `blog-asset:` to `<scheme>-asset:`, a similar hardcoded check was discovered in `blog-editor-compatibility.ts:97` (another shared utility for both blog and product editors). Applied the same regex generalization there, eliminating a latent bug in the product editor path.

### 4. ProductForm Missing HTML Compatibility Check

`ProductForm.tsx` (the admin form) never called `classifyBlogHtmlForVisual()` — the safety function that warns users when their HTML contains incompatible markup like `<span style>` or `<div style>` before round-tripping through Tiptap. Blog form already had this check. Added it to product form, closing an inconsistency where product content with legacy markup would silently corrupt on save with no warning (blog already had this protection).

## What We Tried

1. **Span/Div Extension Approach** → built prototype, tested against 267-post corpus, 0/245 success, concluded DOM style normalization is fundamental blocker → rejected, locked legacy posts to HTML mode as the correct trade-off
2. **HTML-Mode Image Upload (initial)** → closure-captured stale prop value → code review flagged silent data loss → re-implemented reading live DOM value at insertion time → verified fix
3. **Asset Prefix Regex Generalization** → applied to both `BlogAssetImage.tsx` and `blog-editor-compatibility.ts` to eliminate hardcoded scheme names → verified both code paths
4. **HTML Safety Check in ProductForm** → added missing `classifyBlogHtmlForVisual()` call to match blog form's behavior → ensured product gets same protections as blog

## Root Cause Analysis

**Span/Div Support Rejection (not a failure, but worth analyzing the temptation):**
The earlier decision to lock legacy posts in HTML mode was correct. The temptation to "unlock" them via Tiptap extension support came from incomplete acceptance of that trade-off — the feeling that if we just built the right feature, we could have WYSIWYG + legacy HTML both ways. Empirical testing against real data (the 267-post corpus) proved that impossible. The lesson: **trust the first-principles analysis**. When you've identified that DOM normalization will mangle your data, no amount of clever Tiptap extension design gets around that. Accept the constraint, move to the next problem.

**Closure Bug in HTML Upload (a classic async/promise antipattern):**
The bug happened because the initial implementation treated `value` like a mutable reference, not understanding that in React functional components, `value` is a **closed-over snapshot** of the prop at render time. The fix (read from the live DOM element instead) is obvious in hindsight but easy to miss when thinking through async operations in terms of "get data, transform, apply result" — you can forget to ask "when should I get the data?" The answer here is: not during render, but at the moment you need to use it (just before insertion).

## Lessons Learned

**On feature branches in response to UX gaps:**
- When a constraint (HTML-lock for legacy posts) creates a secondary UX problem (no image upload in that mode), the right fix is often a feature in the constrained mode, not a relaxation of the constraint. The HTML-mode image upload is that feature. Only regret the constraint if the feature doesn't solve the problem — here it does.

**On prototyping against real data:**
- Span/div support looked reasonable in theory. Testing against actual legacy HTML (not toy examples) was the cheapest way to kill that hypothesis. Time spent on the prototype was not wasted — it was the evidence needed to confidently reject the approach.

**On async/closure patterns in React:**
- When an event handler awaits an async operation and then manipulates state, prefer reading from the actual source-of-truth at the moment of use (DOM for uncontrolled components, ref/state for controlled), not captured closure values. The stale-value bug is a sign of reading at the wrong time.

**On code review catching silent bugs:**
- Closure bugs and data-corruption issues don't fail tests (because test frameworks don't simulate concurrent user input). They live in the gap between "does it run" and "does it corrupt user data". Code review walking through the implementation with async timing in mind is the right tool for this class of bug.

**On operational consistency (Docker BuildKit):**
- BuildKit layer cache served stale bundles in at least 2 separate unrelated incidents this session (different code changes, both required `docker compose build --no-cache` to force real rebuild). This is the same class of issue documented in the monorepo-restructure journal, suggesting it's a persistent environmental gotcha for this project's Windows/Docker Desktop setup, not a one-off. Consider it a known friction point: when fixing code that doesn't seem to propagate into containers, `--no-cache` is worth trying before deep debugging.

## Next Steps

1. ✅ All code verified: frontend `npm run lint` + `npm run build` clean, `npm run test:admin-ui` 10/10 pass
2. ✅ Code review complete (critical closure bug found and fixed, re-verified)
3. ✅ User manually verified in browser (image uploads work in HTML mode, no content lost while typing during upload, legacy posts stay correctly locked, product content displays on public page)
4. ⏭️ Commit, merge `fix/product-content-editor` into `main`, push to both `origin` and `work` remotes — this is a deliberate deployment milestone per explicit user instruction, done immediately following this journal entry

## Emotions

The closure bug caught by code review felt like a close call — the kind of production data-loss bug that passes all local testing because humans naturally upload files linearly, not during concurrent typing. Relieved that discipline (code review + thinking through async timing) caught it before merge.

The span/div investigation was emotionally harder — building a prototype, testing it rigorously, finding it doesn't work, and accepting that "the status quo (HTML-lock) is the right choice" feels like backpedaling. But that's exactly the work of engineering: testing hypotheses against reality and adjusting based on evidence, not attachment to the idea. Once we had the 0/245 result, the decision became obvious.

Frustrated (for the third time) by Docker BuildKit's stale cache behavior. It's a productivity killer when your fix doesn't show up in containers and you have to remember `--no-cache`. This should be documented more prominently somewhere in the project's dev setup, or the Dockerfile should use a technique to invalidate the cache on source changes.
