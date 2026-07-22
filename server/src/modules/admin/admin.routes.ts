import { Router } from 'express';

import { ok } from '../../common/api-response.js';

export const adminRoutes = Router();

adminRoutes.get('/me', (req, res) => {
  res.json(ok(req.user!));
});
