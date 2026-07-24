import { Router } from 'express';

import { ok } from '../../common/api-response.js';
import { uploadsRoutes } from '../uploads/uploads.routes.js';
import { productsAdminRoutes } from '../products/products.admin.routes.js';
import { categoriesAdminRoutes } from '../categories/categories.admin.routes.js';
import { blogAdminRoutes } from '../blog/blog.admin.routes.js';
import { storesAdminRoutes } from '../stores/stores.admin.routes.js';
import { bannersAdminRoutes } from '../banners/banners.admin.routes.js';
import { siteSettingsAdminRoutes } from '../site-settings/site-settings.admin.routes.js';
import {
  productOptionsAdminRoutes,
} from '../product-options/product-options.admin.routes.js';
import { membershipFaqsAdminRoutes } from '../membership-faqs/membership-faqs.routes.js';
import { siteGalleryAdminRoutes } from '../site-gallery/site-gallery.routes.js';
import { staticPagesAdminRoutes } from '../static-pages/static-pages.routes.js';

export const adminRoutes = Router();

adminRoutes.use('/uploads', uploadsRoutes);
adminRoutes.use('/products', productsAdminRoutes);
adminRoutes.use('/categories', categoriesAdminRoutes);
adminRoutes.use('/blog', blogAdminRoutes);
adminRoutes.use('/stores', storesAdminRoutes);
adminRoutes.use('/banners', bannersAdminRoutes);
adminRoutes.use('/site-settings', siteSettingsAdminRoutes);
adminRoutes.use('/product-options', productOptionsAdminRoutes);
adminRoutes.use('/pages', staticPagesAdminRoutes);
adminRoutes.use('/membership-faqs', membershipFaqsAdminRoutes);
adminRoutes.use('/gallery', siteGalleryAdminRoutes);

adminRoutes.get('/me', (req, res) => {
  res.json(ok(req.user!));
});
