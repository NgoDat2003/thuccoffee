import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import {
  adminProductIdParamsSchema,
  createAdminProductSchema,
  publishAdminProductSchema,
  updateAdminProductSchema,
} from './products.admin.schemas.js';
import {
  createAdminProduct,
  getAdminProduct,
  listAdminProducts,
  publishAdminProduct,
  updateAdminProduct,
} from './products.admin.service.js';

export const productsAdminRoutes = Router();

productsAdminRoutes.get('/', async (_req, res) => {
  res.json(ok(await listAdminProducts()));
});

productsAdminRoutes.get('/:id', async (req, res) => {
  const { id } = adminProductIdParamsSchema.parse(req.params);
  res.json(ok(await getAdminProduct(id)));
});

productsAdminRoutes.post('/', async (req, res) => {
  const input = createAdminProductSchema.parse(req.body);
  res.status(201).json(ok(await createAdminProduct(input)));
});

productsAdminRoutes.put('/:id', async (req, res) => {
  const { id } = adminProductIdParamsSchema.parse(req.params);
  const input = updateAdminProductSchema.parse(req.body);
  res.json(ok(await updateAdminProduct(id, input)));
});

productsAdminRoutes.patch('/:id/publish', async (req, res) => {
  const { id } = adminProductIdParamsSchema.parse(req.params);
  const input = publishAdminProductSchema.parse(req.body);
  res.json(ok(await publishAdminProduct(id, input)));
});