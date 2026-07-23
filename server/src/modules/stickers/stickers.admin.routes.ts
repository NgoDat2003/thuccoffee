import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { ok } from '../../common/api-response.js';
import { db } from '../../db/client.js';
import { productOptions, stickers } from '../../db/schema.js';
import {
  adminStickerIdParamsSchema,
  upsertAdminStickerSchema,
  type AdminSticker,
} from './stickers.admin.schemas.js';

function toAdminSticker(row: {
  id: number;
  label: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}): AdminSticker {
  return {
    id: row.id,
    label: row.label,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const stickersAdminRoutes = Router();

// Master data option phục vụ form sản phẩm — read-only, catalog seed cố định.
export const productOptionsAdminRoutes = Router();

productOptionsAdminRoutes.get('/', async (_req, res) => {
  const rows = await db
    .select({ id: productOptions.id, name: productOptions.name, sortOrder: productOptions.sortOrder })
    .from(productOptions)
    .orderBy(asc(productOptions.sortOrder), asc(productOptions.name));
  res.json(ok(rows));
});

stickersAdminRoutes.get('/', async (_req, res) => {
  const rows = await db.select().from(stickers).orderBy(asc(stickers.label));
  res.json(ok(rows.map(toAdminSticker)));
});

stickersAdminRoutes.post('/', async (req, res) => {
  const input = upsertAdminStickerSchema.parse(req.body);
  const [created] = await db.insert(stickers).values(input).returning();
  if (!created) throw new Error('Insert sticker did not return a row.');
  res.status(201).json(ok(toAdminSticker(created)));
});

stickersAdminRoutes.put('/:id', async (req, res) => {
  const { id } = adminStickerIdParamsSchema.parse(req.params);
  const input = upsertAdminStickerSchema.parse(req.body);
  const [updated] = await db
    .update(stickers)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(stickers.id, id))
    .returning();
  if (!updated) throw ApiError.notFound('Không tìm thấy sticker.');
  res.json(ok(toAdminSticker(updated)));
});

stickersAdminRoutes.delete('/:id', async (req, res) => {
  const { id } = adminStickerIdParamsSchema.parse(req.params);
  // FK product_stickers ON DELETE CASCADE gỡ link khỏi sản phẩm.
  const [deleted] = await db
    .delete(stickers)
    .where(eq(stickers.id, id))
    .returning({ id: stickers.id });
  if (!deleted) throw ApiError.notFound('Không tìm thấy sticker.');
  res.status(204).end();
});
