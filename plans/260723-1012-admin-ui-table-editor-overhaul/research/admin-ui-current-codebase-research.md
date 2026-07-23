# Current admin UI code audit

Date: 2026-07-23  
Scope: read-only inspection of the checked-out `main` branch.

## Findings

- `AdminLayout.tsx` globally caps admin main at 1180px after a fixed 232px sidebar.
  `AdminCategoriesPage.tsx` adds another `max-w-4xl`, causing the reported unused width.
- `AdminTable.tsx` already supports client sort, client/server pagination, reset keys,
  and visible-row callbacks. Its sorting is always local, so Blog currently sorts only
  the ten records returned for the active server page.
- Products rely on visible-page selection and partial-failure bulk publish. Categories
  rely on one-row inline edit, immutable keys, and delete guards. These are invariants.
- Stores already use a two-column media-card grid; Banners already use media rows.
  Their sameness comes mostly from shared spacing and a 560px drawer, not a shared table.
- Blog Form stores a controlled raw HTML string, blocks dirty navigation, and previews
  through the authenticated backend.
- Create, update, and preview share `sanitizeBlogContent`. Its allow-list was derived
  from 267 posts and preserves `blog-asset:`. Existing smoke tests protect unsafe HTML,
  five longest real posts, and byte-preserving save.
- Importing the sanitizer into the frontend previously added 65.62kB gzip; the accepted
  server-preview path added about 1.95kB. Keep the sanitizer server-side.
- No frontend unit/E2E harness exists. API smokes do not prove responsive layout,
  sorting UI, selection, drawer focus, or rich-text behavior.

## Key file evidence

- `src/components/admin/AdminLayout.tsx`
- `src/components/admin/ui/AdminTable.tsx`
- `src/components/admin/ui/AdminDrawer.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminCategoriesPage.tsx`
- `src/pages/admin/AdminBlogPage.tsx`
- `src/pages/admin/AdminBlogFormPage.tsx`
- `src/pages/admin/AdminStoresPage.tsx`
- `src/pages/admin/AdminBannersPage.tsx`
- `server/src/modules/blog/blog-content-sanitizer.ts`
- `server/src/modules/blog/blog.admin.service.ts`
- `server/scripts/smoke-admin-blog.ts`
- `docs/admin-blog-preview-decision.md`

## Principal risks

1. Widening the global shell also widens Settings and Blog Form unless constrained.
2. A visual editor can normalize legacy HTML before the user changes it.
3. A page-local blog sort looks global but returns a false order across 267 posts.
4. Hydrating the dirty baseline from the submitted local value can differ from the
   sanitized HTML actually stored by the server.
