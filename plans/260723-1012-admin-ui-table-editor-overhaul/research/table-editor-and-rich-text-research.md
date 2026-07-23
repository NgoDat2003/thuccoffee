# Ant-inspired table and rich-text compatibility research

Date: 2026-07-23  
Sources: official component/framework documentation and current package manifests.

## Table decision

Do not install Ant Design. Use its controlled interaction model as the reference:
pagination, filters, sorter, selection, loading/empty rows, `onChange` action, and
accessible native table semantics. The existing Tailwind component is small enough to
extend and must retain the THUC admin visual tokens.

Reference: <https://ant.design/components/table/>

Deliberately exclude virtual scrolling, column drag/resize, multi-sort, expandable/tree
rows, and page-size selection. They add complexity without solving the reported issues.

## Editor decision

Use Tiptap v3 only behind a legacy compatibility gate. Pin all Tiptap packages to the
same exact version and lazy-load the Blog Form route. Tiptap React currently declares
React 19 support and provides official HTML, Image, Link, Underline, and Table support.

References:

- <https://tiptap.dev/docs/editor/getting-started/install/react>
- <https://tiptap.dev/docs/editor/api/commands/content/set-content>
- <https://tiptap.dev/docs/editor/api/editor>
- <https://tiptap.dev/docs/guides/output-json-html>
- <https://tiptap.dev/docs/editor/extensions/nodes/image>
- <https://tiptap.dev/docs/editor/extensions/nodes/table>

Tiptap is not a sanitizer. The backend remains authoritative. Its schema may normalize
or drop legacy `div`, `span`, inline styles, `dir`, table attributes, or `rowspan`.
Therefore Visual mode is allowed only when the corpus check proves compatibility;
otherwise the post remains editable in HTML source mode with a visible warning.

## Compatibility rules

- Keep PostgreSQL HTML storage; no JSON migration.
- An untouched body must remain byte-identical.
- After a real edit, require semantic DOM/media preservation rather than serializer-byte
  equality.
- `blog-asset:<objectKey>` remains the stored image source. Node views may resolve a
  display URL but `getHTML()` must emit the marker.
- External HTTPS images remain readable; new images use the existing upload endpoint.
- Disable unsupported editor output (`th`, `thead`, `colspan`, code, blockquote, strike,
  base64 image, table merge/split/resize) instead of weakening the sanitizer.
- Preview only HTML returned by authenticated server preview.

## Verification focus

- Tri-state table sort, server/client mode, reset/clamp, Vietnamese strings,
  indeterminate selection, loading/empty semantics, ARIA, and pagination gaps.
- All 267 blog bodies through sanitizer/editor/sanitizer round-trip classification.
- Marker persistence, media count, simple table structure, external URL preservation,
  unsafe protocol/style/event removal, dirty hydration, and title-only byte preservation.
- Browser coverage for contenteditable, upload, drawer, and current-page selection.
