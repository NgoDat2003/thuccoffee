import { Router } from 'express';
import { asc, inArray, sql } from 'drizzle-orm';

import { ok } from '../../common/api-response.js';
import { db } from '../../db/client.js';
import { siteSettings } from '../../db/schema.js';
import { updateAdminSiteSettingsSchema } from './site-settings.admin.schemas.js';
import { publicSettingKeys } from './site-settings.service.js';

export const siteSettingsAdminRoutes = Router();

siteSettingsAdminRoutes.get('/', async (_req, res) => {
  const rows = await db
    .select({
      key: siteSettings.key,
      value: siteSettings.value,
      updatedAt: siteSettings.updatedAt,
    })
    .from(siteSettings)
    .where(inArray(siteSettings.key, [...publicSettingKeys]))
    .orderBy(asc(siteSettings.key));
  res.json(ok(rows.map((row) => ({
    ...row,
    updatedAt: row.updatedAt.toISOString(),
  }))));
});

siteSettingsAdminRoutes.put('/', async (req, res) => {
  const input = updateAdminSiteSettingsSchema.parse(req.body);
  const entries = Object.entries(input) as Array<[string, string]>;

  await db
    .insert(siteSettings)
    .values(entries.map(([key, value]) => ({ key, value, updatedAt: new Date() })))
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: sql`excluded.value`,
        updatedAt: new Date(),
      },
    });

  const rows = await db
    .select({
      key: siteSettings.key,
      value: siteSettings.value,
      updatedAt: siteSettings.updatedAt,
    })
    .from(siteSettings)
    .where(inArray(siteSettings.key, entries.map(([key]) => key)));
  res.json(ok(rows.map((row) => ({
    ...row,
    updatedAt: row.updatedAt.toISOString(),
  }))));
});
