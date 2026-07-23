---
phase: 4
title: "Rich-text blog editor with legacy HTML safety"
status: completed
effort: "3 days"
dependsOn: [1, 2]
---

# Phase 4: Rich-text blog editor with legacy HTML safety

## Overview

Replace the generic HTML textarea with a visual editor without silently rewriting the
267 existing posts. Tiptap is an authoring surface; backend sanitization and HTML
storage remain authoritative.

## Related Code Files

- Modify: `package.json`, `package-lock.json`, `src/routes.tsx`
- Modify: `src/pages/admin/AdminBlogFormPage.tsx`
- Add: `src/components/admin/blog-editor/BlogContentEditor.tsx`
- Add: `src/components/admin/blog-editor/BlogEditorToolbar.tsx`
- Add: `src/components/admin/blog-editor/blog-editor-extensions.ts`
- Add: `src/components/admin/blog-editor/blog-editor-compatibility.ts`
- Add: `src/components/admin/blog-editor/blog-editor-compatibility.test.ts`
- Add: `src/components/admin/blog-editor/BlogAssetImage.tsx`
- Modify: `server/src/modules/blog/blog.admin.service.ts`
- Modify: `server/scripts/smoke-admin-blog.ts`
- Reference: `src/services/admin/blog.service.ts`
- Reference: `src/services/admin/uploads.service.ts`
- Reference: `server/src/modules/blog/blog-content-sanitizer.ts`
- Reference: `docs/admin-blog-preview-decision.md`

## Dependency and editor contract

Pin version `3.27.4` for `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`,
`@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-underline`,
and `@tiptap/extension-table`. Lazy-load the Blog Form/editor so Tiptap never enters
the public initial chunks.

```ts
interface BlogContentEditorProps {
  value: string;                    // canonical raw HTML from API
  onChange(value: string): void;    // only after an actual editor/source edit
  onUploadImage(file: File): Promise<string>; // returns objectKey
  compatibility: 'visual' | 'source-only';
}
```

## Implementation Steps

1. Before Tiptap integration, extend the server smoke with a full-corpus sanitizer
   inventory for every current post: tags, attributes/styles, links, ordered images,
   text, table cells, `rowspan`, and marker counts. Untouched bodies must sanitize
   byte-for-byte; abort Visual rollout if that precondition fails.
2. Install/configure only sanitizer-supported authoring features: H1-H3, paragraph,
   bold, italic, underline, links, ordered/bullet lists, hard break, horizontal rule,
   image, and simple table. Disable code, strike, blockquote, base64 images, header
   cells, resize, merge/split, and attributes not allowed by the backend.
3. Add Visual/HTML tabs. Preserve `originalRawHtml`; metadata-only edits submit the
   original bytes. Unsupported legacy markup opens in source-only mode with a warning
   instead of dropping `div`, `span`, styles, `dir`, `rowspan`, or table attributes.
4. After Tiptap is installed, test each body as
   `sanitize -> setContent -> getHTML -> sanitize`. Compare normalized text, ordered
   tag tree, supported attributes/styles, link targets, image `src/alt/order`, and
   table cell/rowspan structure. Any difference forces source-only mode.
5. Use the real upload contract:
   `const { objectKey } = await upload.mutateAsync({ file, kind: 'blog' })`.
   Insert/persist `src="blog-asset:<objectKey>"`; the node view resolves only display
   URLs. Preserve external HTTPS images; reject base64 and environment-specific URLs.
6. Keep authenticated server preview. Never render unsanitized `editor.getHTML()`.
   After create/update, hydrate form and dirty baseline from the server response.
7. In `updateAdminBlog`, compare submitted content to the current DB body. When equal,
   carry the stored value through without sanitizer/serialization; sanitize only an
   actually changed body. Keep the request schema and endpoint payload unchanged.
8. Preserve slug lock, date field, dirty-navigation blocker, separate publish mutation,
   validation mapping, safe preview button, and existing public/admin invalidation.

## Success Criteria

- [x] Blog Form offers usable visual editing plus explicit HTML source mode.
- [x] Every current post is classified; no post loses markup silently on open/save.
- [x] Title/date-only save keeps content bytes exactly unchanged.
- [x] Edited compatible posts preserve text, tag order, supported attrs/styles, links,
      images and table structure after server sanitization.
- [x] `blog-asset:` survives editor, preview, save, reload, and public rendering.
- [x] Unsafe HTML is removed by preview/write; frontend never becomes the sanitizer.
- [x] Tiptap is absent from public entry chunks; public gzip delta is <=5 KiB.
- [x] Root tests/lint/build and server lint/build/extended `smoke:admin-blog` pass.
- [x] A corpus-gate failure never weakens the sanitizer; source-only fallback ships.
