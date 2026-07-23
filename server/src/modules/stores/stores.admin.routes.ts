import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import {
  adminStoreIdParamsSchema,
  createAdminStoreSchema,
  publishAdminStoreSchema,
  replaceAdminStoreGallerySchema,
  updateAdminStoreSchema,
} from './stores.admin.schemas.js';
import {
  createAdminStore,
  getAdminStore,
  listAdminStores,
  publishAdminStore,
  replaceAdminStoreGallery,
  updateAdminStore,
} from './stores.admin.service.js';

export const storesAdminRoutes = Router();

storesAdminRoutes.get('/', async (_req, res) => {
  res.json(ok(await listAdminStores()));
});

storesAdminRoutes.get('/:id', async (req, res) => {
  const { id } = adminStoreIdParamsSchema.parse(req.params);
  res.json(ok(await getAdminStore(id)));
});

storesAdminRoutes.post('/', async (req, res) => {
  const input = createAdminStoreSchema.parse(req.body);
  res.status(201).json(ok(await createAdminStore(input)));
});

storesAdminRoutes.put('/:id', async (req, res) => {
  const { id } = adminStoreIdParamsSchema.parse(req.params);
  const input = updateAdminStoreSchema.parse(req.body);
  res.json(ok(await updateAdminStore(id, input)));
});

storesAdminRoutes.patch('/:id/publish', async (req, res) => {
  const { id } = adminStoreIdParamsSchema.parse(req.params);
  const input = publishAdminStoreSchema.parse(req.body);
  res.json(ok(await publishAdminStore(id, input)));
});

storesAdminRoutes.put('/:id/gallery', async (req, res) => {
  const { id } = adminStoreIdParamsSchema.parse(req.params);
  const input = replaceAdminStoreGallerySchema.parse(req.body);
  res.json(ok(await replaceAdminStoreGallery(id, input)));
});
