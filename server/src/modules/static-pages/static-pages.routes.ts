import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { ok } from '../../common/api-response.js';
import { validateParams } from '../../common/validate.js';
import { db } from '../../db/client.js';
import { staticPages } from '../../db/schema.js';
import {
  staticPageParamsSchema,
  staticPageSchema,
  updateStaticPageSchema,
  validatePageContent,
  type StaticPage,
  type StaticPageKey,
} from './static-pages.schemas.js';

function toStaticPage(row: {
  key: string;
  title: string;
  content: string;
  updatedAt: Date;
}): StaticPage {
  return staticPageSchema.parse({
    key: row.key,
    title: row.title,
    content: row.content,
    updatedAt: row.updatedAt.toISOString(),
  });
}

export const staticPagesRoutes = Router();

staticPagesRoutes.get('/:key', validateParams(staticPageParamsSchema), async (_req, res) => {
  const { key } = res.locals.validatedParams as { key: string };
  const [row] = await db.select().from(staticPages).where(eq(staticPages.key, key)).limit(1);
  if (!row) throw ApiError.notFound('Không tìm thấy trang.');
  res.json(ok(toStaticPage(row)));
});

export const staticPagesAdminRoutes = Router();

staticPagesAdminRoutes.get('/', async (_req, res) => {
  const rows = await db.select().from(staticPages).orderBy(asc(staticPages.key));
  res.json(ok(rows.map(toStaticPage)));
});

staticPagesAdminRoutes.get('/:key', validateParams(staticPageParamsSchema), async (_req, res) => {
  const { key } = res.locals.validatedParams as { key: string };
  const [row] = await db.select().from(staticPages).where(eq(staticPages.key, key)).limit(1);
  if (!row) throw ApiError.notFound('Không tìm thấy trang.');
  res.json(ok(toStaticPage(row)));
});

staticPagesAdminRoutes.put('/:key', validateParams(staticPageParamsSchema), async (req, res) => {
  const { key } = res.locals.validatedParams as { key: StaticPageKey };
  const input = updateStaticPageSchema.parse(req.body);
  try {
    validatePageContent(key, input.content);
  } catch (cause) {
    throw ApiError.badRequest(cause instanceof Error ? cause.message : 'Content không hợp lệ.');
  }
  const [updated] = await db
    .update(staticPages)
    .set({ title: input.title, content: input.content, updatedAt: new Date() })
    .where(eq(staticPages.key, key))
    .returning();
  if (!updated) throw ApiError.notFound('Không tìm thấy trang.');
  res.json(ok(toStaticPage(updated)));
});
