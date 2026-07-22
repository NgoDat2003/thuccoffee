import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import { uploadsRoutes } from '../uploads/uploads.routes.js';
import { productsAdminRoutes } from '../products/products.admin.routes.js';
import { categoriesAdminRoutes } from '../categories/categories.admin.routes.js';

export const adminRoutes = Router();

adminRoutes.use('/uploads', uploadsRoutes);
adminRoutes.use('/products', productsAdminRoutes);
adminRoutes.use('/categories', categoriesAdminRoutes);

adminRoutes.get('/me', (req, res) => {
  res.json(ok(req.user!));
});
