import { and, asc, eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { stores } from '../../db/schema.js';
import { storeSchema, type Store } from './stores.schemas.js';

const publicStoreFields = {
  name: stores.name,
  slug: stores.slug,
  address: stores.address,
  phone: stores.phone,
  hours: stores.hours,
  image: stores.image,
};

export async function listStores(): Promise<Store[]> {
  const rows = await db
    .select(publicStoreFields)
    .from(stores)
    .where(eq(stores.isPublished, true))
    .orderBy(asc(stores.sortOrder), asc(stores.name));

  return storeSchema.array().parse(rows);
}

export async function getStoreBySlug(slug: string): Promise<Store | undefined> {
  const [row] = await db
    .select(publicStoreFields)
    .from(stores)
    .where(and(eq(stores.slug, slug), eq(stores.isPublished, true)))
    .limit(1);

  return row ? storeSchema.parse(row) : undefined;
}
