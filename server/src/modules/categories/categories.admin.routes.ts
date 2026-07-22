import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import {
  adminCategoryIdParamsSchema,
  updateAdminCategorySchema,
} from './categories.admin.schemas.js';
import {
  listAdminCategories,
  updateAdminCategory,
} from './categories.admin.service.js';

export const categoriesAdminRoutes = Router();

categoriesAdminRoutes.get('/', async (_req, res) => {
  res.json(ok(await listAdminCategories()));
});

categoriesAdminRoutes.put('/:id', async (req, res) => {
  const { id } = adminCategoryIdParamsSchema.parse(req.params);
  const input = updateAdminCategorySchema.parse(req.body);
  res.json(ok(await updateAdminCategory(id, input)));
});