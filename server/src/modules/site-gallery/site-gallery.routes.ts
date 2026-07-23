import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { ApiError } from '../../common/api-error.js';
import { ok } from '../../common/api-response.js';
import { db } from '../../db/client.js';
import { siteGallery } from '../../db/schema.js';

export const galleryItemSchema = z.object({
  id: z.number().int(),
  storageKey: z.string(),
  altText: z.string(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export const upsertGalleryItemSchema = z.object({
  storageKey: z.string().trim().min(1).max(500),
  altText: z.string().trim().max(300),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
}).strict();

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });

export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type UpsertGalleryItemInput = z.infer<typeof upsertGalleryItemSchema>;

export const siteGalleryRoutes = Router();

// Public: ảnh gallery trang chủ đang bật, theo sortOrder.
siteGalleryRoutes.get('/', async (_req, res) => {
  const rows = await db
    .select({
      id: siteGallery.id,
      storageKey: siteGallery.storageKey,
      altText: siteGallery.altText,
      sortOrder: siteGallery.sortOrder,
      isActive: siteGallery.isActive,
    })
    .from(siteGallery)
    .where(eq(siteGallery.isActive, true))
    .orderBy(asc(siteGallery.sortOrder), asc(siteGallery.id));
  res.json(ok(galleryItemSchema.array().parse(rows)));
});

export const siteGalleryAdminRoutes = Router();

siteGalleryAdminRoutes.get('/', async (_req, res) => {
  const rows = await db
    .select({
      id: siteGallery.id,
      storageKey: siteGallery.storageKey,
      altText: siteGallery.altText,
      sortOrder: siteGallery.sortOrder,
      isActive: siteGallery.isActive,
    })
    .from(siteGallery)
    .orderBy(asc(siteGallery.sortOrder), asc(siteGallery.id));
  res.json(ok(galleryItemSchema.array().parse(rows)));
});

siteGalleryAdminRoutes.post('/', async (req, res) => {
  const input = upsertGalleryItemSchema.parse(req.body);
  const [created] = await db.insert(siteGallery).values(input).returning();
  if (!created) throw new Error('Insert gallery item did not return a row.');
  res.status(201).json(ok(galleryItemSchema.parse(created)));
});

siteGalleryAdminRoutes.put('/:id', async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const input = upsertGalleryItemSchema.parse(req.body);
  const [updated] = await db
    .update(siteGallery)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(siteGallery.id, id))
    .returning();
  if (!updated) throw ApiError.notFound('Không tìm thấy ảnh gallery.');
  res.json(ok(galleryItemSchema.parse(updated)));
});

siteGalleryAdminRoutes.delete('/:id', async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const [deleted] = await db
    .delete(siteGallery)
    .where(eq(siteGallery.id, id))
    .returning({ id: siteGallery.id });
  if (!deleted) throw ApiError.notFound('Không tìm thấy ảnh gallery.');
  res.status(204).end();
});
