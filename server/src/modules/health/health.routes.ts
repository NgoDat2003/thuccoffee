import { Router } from 'express';

import { ok } from '../../common/api-response.js';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.json(ok({ status: 'ok' }));
});
