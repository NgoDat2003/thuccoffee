import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import { getPublicSiteSettings } from './site-settings.service.js';

export const siteSettingsRoutes = Router();

siteSettingsRoutes.get('/', async (_req, res) => {
  res.json(ok(await getPublicSiteSettings()));
});
