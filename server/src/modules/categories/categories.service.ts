import { asc } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { categories } from '../../db/schema.js';
import { categorySchema, type Category } from './categories.schemas.js';

export async function listCategories(): Promise<Category[]> {
  const rows = await db
    .select({
      key: categories.key,
      label: categories.label,
      kind: categories.kind,
      badgeColor: categories.badgeColor,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.label));

  return categorySchema.array().parse(rows);
}
