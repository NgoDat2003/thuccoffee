import { Router } from 'express';

import { ApiError } from '../../common/api-error.js';
import { ok } from '../../common/api-response.js';
import { validateParams } from '../../common/validate.js';
import { storeParamsSchema, type StoreParams } from './stores.schemas.js';
import { getStoreBySlug, listStores } from './stores.service.js';

export const storesRoutes = Router();

storesRoutes.get('/', async (_req, res) => {
  res.json(ok(await listStores()));
});

storesRoutes.get('/:slug', validateParams(storeParamsSchema), async (_req, res) => {
  const { slug } = res.locals.validatedParams as StoreParams;
  const store = await getStoreBySlug(slug);

  if (!store) {
    throw ApiError.notFound('Không tìm thấy cửa hàng.');
  }

  res.json(ok(store));
});
