import { Router } from 'express';
import { asc } from 'drizzle-orm';
import { ok } from '../../common/api-response.js';
import { db } from '../../db/client.js';
import { productOptions } from '../../db/schema.js';

// Master data option phục vụ form sản phẩm — read-only, catalog seed cố định.
export const productOptionsAdminRoutes = Router();

productOptionsAdminRoutes.get('/', async (_req, res) => {
  const rows = await db
    .select({ id: productOptions.id, name: productOptions.name, sortOrder: productOptions.sortOrder })
    .from(productOptions)
    .orderBy(asc(productOptions.sortOrder), asc(productOptions.name));
  res.json(ok(rows));
});
