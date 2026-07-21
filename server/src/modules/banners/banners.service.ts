import { asc, eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { banners } from '../../db/schema.js';
import { bannerSchema, type Banner } from './banners.schemas.js';

export async function listActiveBanners(): Promise<Banner[]> {
  const rows = await db
    .select({
      type: banners.type,
      image: banners.image,
      altText: banners.altText,
      linkUrl: banners.linkUrl,
      sortOrder: banners.sortOrder,
    })
    .from(banners)
    .where(eq(banners.isActive, true))
    .orderBy(asc(banners.sortOrder), asc(banners.id));

  return bannerSchema.array().parse(rows);
}
