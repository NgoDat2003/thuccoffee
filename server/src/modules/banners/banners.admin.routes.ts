import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { ok } from '../../common/api-response.js';
import { db } from '../../db/client.js';
import { banners } from '../../db/schema.js';
import {
  activateAdminBannerSchema,
  adminBannerIdParamsSchema,
  createAdminBannerSchema,
  updateAdminBannerSchema,
  type AdminBanner,
} from './banners.admin.schemas.js';

const adminBannerSelect = {
  id: banners.id,
  type: banners.type,
  image: banners.image,
  altText: banners.altText,
  linkUrl: banners.linkUrl,
  sortOrder: banners.sortOrder,
  isActive: banners.isActive,
  createdAt: banners.createdAt,
  updatedAt: banners.updatedAt,
};

type AdminBannerRow = {
  id: number;
  type: string;
  image: string;
  altText: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toAdminBanner(row: AdminBannerRow): AdminBanner {
  return {
    ...row,
    type: row.type as AdminBanner['type'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function requireAdminBanner(id: number): Promise<AdminBanner> {
  const [row] = await db
    .select(adminBannerSelect)
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);
  if (!row) throw ApiError.notFound('Không tìm thấy banner.');
  return toAdminBanner(row);
}

export const bannersAdminRoutes = Router();

bannersAdminRoutes.get('/', async (_req, res) => {
  const rows = await db
    .select(adminBannerSelect)
    .from(banners)
    .orderBy(asc(banners.type), asc(banners.sortOrder), asc(banners.id));
  res.json(ok(rows.map(toAdminBanner)));
});

bannersAdminRoutes.post('/', async (req, res) => {
  const input = createAdminBannerSchema.parse(req.body);
  const [created] = await db
    .insert(banners)
    .values(input)
    .returning({ id: banners.id });
  if (!created) throw new Error('Insert banner did not return an id.');
  res.status(201).json(ok(await requireAdminBanner(created.id)));
});

bannersAdminRoutes.put('/:id', async (req, res) => {
  const { id } = adminBannerIdParamsSchema.parse(req.params);
  const input = updateAdminBannerSchema.parse(req.body);
  const [updated] = await db
    .update(banners)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(banners.id, id))
    .returning({ id: banners.id });
  if (!updated) throw ApiError.notFound('Không tìm thấy banner.');
  res.json(ok(await requireAdminBanner(id)));
});

bannersAdminRoutes.patch('/:id/activate', async (req, res) => {
  const { id } = adminBannerIdParamsSchema.parse(req.params);
  const input = activateAdminBannerSchema.parse(req.body);
  const [updated] = await db
    .update(banners)
    .set({ isActive: input.isActive, updatedAt: new Date() })
    .where(eq(banners.id, id))
    .returning({ id: banners.id });
  if (!updated) throw ApiError.notFound('Không tìm thấy banner.');
  res.json(ok(await requireAdminBanner(id)));
});

// Ngoại lệ duy nhất của policy "delete = unpublish": banner là trang trí
// thuần, không có URL public riêng và không được nội dung nào tham chiếu,
// nên hard delete an toàn.
bannersAdminRoutes.delete('/:id', async (req, res) => {
  const { id } = adminBannerIdParamsSchema.parse(req.params);
  const [deleted] = await db
    .delete(banners)
    .where(eq(banners.id, id))
    .returning({ id: banners.id });
  if (!deleted) throw ApiError.notFound('Không tìm thấy banner.');
  res.status(204).end();
});
