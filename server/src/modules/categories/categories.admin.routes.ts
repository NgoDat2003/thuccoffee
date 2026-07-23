import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import {
  adminCategoryIdParamsSchema,
  createAdminCategorySchema,
  updateAdminCategorySchema,
} from './categories.admin.schemas.js';
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
} from './categories.admin.service.js';

export const categoriesAdminRoutes = Router();

categoriesAdminRoutes.get('/', async (_req, res) => {
  res.json(ok(await listAdminCategories()));
});

categoriesAdminRoutes.post('/', async (req, res) => {
  const input = createAdminCategorySchema.parse(req.body);
  res.status(201).json(ok(await createAdminCategory(input)));
});

categoriesAdminRoutes.put('/:id', async (req, res) => {
  const { id } = adminCategoryIdParamsSchema.parse(req.params);
  const input = updateAdminCategorySchema.parse(req.body);
  res.json(ok(await updateAdminCategory(id, input)));
});

categoriesAdminRoutes.delete('/:id', async (req, res) => {
  const { id } = adminCategoryIdParamsSchema.parse(req.params);
  await deleteAdminCategory(id);
  res.status(204).end();
});
