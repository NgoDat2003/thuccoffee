import 'dotenv/config';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './common/env.js';
import { errorHandler, notFoundHandler } from './common/error-handler.js';
import { bannersRoutes } from './modules/banners/banners.routes.js';
import { blogRoutes } from './modules/blog/blog.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { productsRoutes } from './modules/products/products.routes.js';
import { siteSettingsRoutes } from './modules/site-settings/site-settings.routes.js';
import { storesRoutes } from './modules/stores/stores.routes.js';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(pinoHttp());

app.use('/api/health', healthRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/site-settings', siteSettingsRoutes);

// 404 cho route không khớp, rồi error handler cuối chuỗi.
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Backend chạy ở http://localhost:${env.PORT}`);
});
