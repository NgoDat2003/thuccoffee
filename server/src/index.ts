import 'dotenv/config';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from './common/env.js';
import { errorHandler, notFoundHandler } from './common/error-handler.js';
import { healthRoutes } from './modules/health/health.routes.js';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(pinoHttp());

app.use('/api/health', healthRoutes);

// 404 cho route không khớp, rồi error handler cuối chuỗi.
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Backend chạy ở http://localhost:${env.PORT}`);
});
