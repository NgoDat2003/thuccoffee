import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import { listActiveBanners } from './banners.service.js';

export const bannersRoutes = Router();

bannersRoutes.get('/', async (_req, res) => {
  res.json(ok(await listActiveBanners()));
});
