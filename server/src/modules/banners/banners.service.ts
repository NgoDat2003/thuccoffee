import { and, asc, eq, isNull, lte, gte, or, sql } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { banners } from '../../db/schema.js';
import { bannerSchema, type Banner } from './banners.schemas.js';

export async function listActiveBanners(): Promise<Banner[]> {
  const now = sql`now()`;
  const rows = await db
    .select({
      type: banners.type,
      image: banners.image,
      altText: banners.altText,
      linkUrl: banners.linkUrl,
      buttonLabel: banners.buttonLabel,
      openInNewTab: banners.openInNewTab,
      sortOrder: banners.sortOrder,
    })
    .from(banners)
    .where(and(
      eq(banners.isActive, true),
      // Active window: chưa tới startsAt hoặc quá endsAt thì ẩn khỏi public.
      or(isNull(banners.startsAt), lte(banners.startsAt, now)),
      or(isNull(banners.endsAt), gte(banners.endsAt, now)),
    ))
    .orderBy(asc(banners.sortOrder), asc(banners.id));

  return bannerSchema.array().parse(rows);
}
