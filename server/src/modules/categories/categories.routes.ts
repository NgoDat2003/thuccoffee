import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import { listCategories } from './categories.service.js';

export const categoriesRoutes = Router();

categoriesRoutes.get('/', async (_req, res) => {
  res.json(ok(await listCategories()));
});
