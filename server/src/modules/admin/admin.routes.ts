import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import { uploadsRoutes } from '../uploads/uploads.routes.js';
import { productsAdminRoutes } from '../products/products.admin.routes.js';
import { categoriesAdminRoutes } from '../categories/categories.admin.routes.js';
import { blogAdminRoutes } from '../blog/blog.admin.routes.js';
import { storesAdminRoutes } from '../stores/stores.admin.routes.js';
import { bannersAdminRoutes } from '../banners/banners.admin.routes.js';
import { siteSettingsAdminRoutes } from '../site-settings/site-settings.admin.routes.js';

export const adminRoutes = Router();

adminRoutes.use('/uploads', uploadsRoutes);
adminRoutes.use('/products', productsAdminRoutes);
adminRoutes.use('/categories', categoriesAdminRoutes);
adminRoutes.use('/blog', blogAdminRoutes);
adminRoutes.use('/stores', storesAdminRoutes);
adminRoutes.use('/banners', bannersAdminRoutes);
adminRoutes.use('/site-settings', siteSettingsAdminRoutes);

adminRoutes.get('/me', (req, res) => {
  res.json(ok(req.user!));
});
