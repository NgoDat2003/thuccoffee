import { and, asc, eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { mediaAttachments, stores } from '../../db/schema.js';
import {
  storeDetailSchema,
  storeSchema,
  type Store,
  type StoreDetail,
} from './stores.schemas.js';

const publicStoreFields = {
  name: stores.name,
  slug: stores.slug,
  address: stores.address,
  phone: stores.phone,
  hours: stores.hours,
  image: stores.image,
  mapEmbedUrl: stores.mapEmbedUrl,
};

export async function listStores(): Promise<Store[]> {
  const rows = await db
    .select(publicStoreFields)
    .from(stores)
    .where(eq(stores.isPublished, true))
    .orderBy(asc(stores.sortOrder), asc(stores.name));

  return storeSchema.array().parse(rows);
}

export async function getStoreBySlug(
  slug: string,
): Promise<StoreDetail | undefined> {
  const [row] = await db
    .select({ id: stores.id, ...publicStoreFields })
    .from(stores)
    .where(and(eq(stores.slug, slug), eq(stores.isPublished, true)))
    .limit(1);

  if (!row) {
    return undefined;
  }

  const galleryRows = await db
    .select({ storageKey: mediaAttachments.storageKey })
    .from(mediaAttachments)
    .where(and(
      eq(mediaAttachments.ownerType, 'store'),
      eq(mediaAttachments.ownerId, row.id),
      eq(mediaAttachments.role, 'gallery'),
    ))
    .orderBy(asc(mediaAttachments.sortOrder), asc(mediaAttachments.id));

  const { id: _id, ...store } = row;
  return storeDetailSchema.parse({
    ...store,
    gallery: galleryRows.map(({ storageKey }) => storageKey),
  });
}
