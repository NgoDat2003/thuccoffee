---
phase: 3
title: "Specialized stores and banners"
status: completed
effort: "2 days"
dependsOn: [1]
---

# Phase 3: Specialized stores and banners

## Overview

Make Store and Banner feel like distinct management tools. They remain visual/media
views rather than being forced into `AdminTable`.

## Related Code Files

- Modify: `src/pages/admin/AdminStoresPage.tsx`
- Modify: `src/pages/admin/AdminBannersPage.tsx`
- Modify: `src/components/admin/forms/StoreForm.tsx`
- Modify: `src/components/admin/forms/StoreGallerySection.tsx`
- Modify: `src/components/admin/forms/BannerForm.tsx`
- Reuse: `src/components/admin/ui/AdminDrawer.tsx`
- Reuse: `src/components/admin/ImageField.tsx`
- Reference: `src/services/admin/stores.service.ts`
- Reference: `src/services/admin/banners.service.ts`

## Implementation Steps

1. Stores: build a full-width media-card workspace with search, region, publish-status,
   sort-order/name controls, result count, 10-card pagination, and stable empty/loading
   states. Preserve cover image, address/region, inline publish, edit, and order data.
2. Render Store edit in the wide drawer with clear `Thông tin cửa hàng` and `Thư viện`
   sections. Keep gallery save separate from main save; preserve duplicate-key guard,
   ownerType/ownerId/role scoping, arrow reorder, and storage-key payload.
3. Banners: group the visual workspace by exact placement enum
   `slider | promotion | right`; show group counts, aspect-ratio preview, active state,
   sort order, edit/delete, and explicit placement help so “two records” cannot be
   mistaken for “two homepage slides”.
4. Add Banner type/active filters and stable client sorting/pagination. Use fixed
   business order `slider -> promotion -> right`, not alphabetical type ordering.
5. Give BannerForm a visual placement selector and image guidance; use the wide drawer
   only when necessary. Do not merge Store/Banner form state into a generic schema.
6. Keep destructive confirmation, hard delete, activate mutation, Store gallery save,
   and all public/admin query invalidation unchanged.
7. Verify filter changes reset page 1 and post-mutation list shrinkage clamps the page.

## Success Criteria

- [x] Store is recognizably a location/gallery manager, not a generic table form.
- [x] Banner is recognizably a placement/media manager and clearly explains each type.
- [x] The banner UI never implies `promotion` or `right` records belong to the slider.
- [x] Store gallery reorder/save and duplicate protection pass unchanged.
- [x] Banner enum, activate/delete behavior, and public invalidation pass unchanged.
- [x] Both views use full width without page-level overflow at 375-1920px.
- [x] `npm run test:admin-ui`, `npm run lint`, and `npm run build` pass at root.
- [x] `npm run smoke:admin-stores` and `npm run smoke:admin-banners-settings` pass.
