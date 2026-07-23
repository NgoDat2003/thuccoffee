import { asc, eq } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { db } from '../../db/client.js';
import { categories } from '../../db/schema.js';
import type {
  AdminCategory,
  UpdateAdminCategoryInput,
} from './categories.admin.schemas.js';

const adminCategorySelect = {
  id: categories.id,
  key: categories.key,
  label: categories.label,
  sortOrder: categories.sortOrder,
};

export async function listAdminCategories(): Promise<AdminCategory[]> {
  return db
    .select(adminCategorySelect)
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.label));
}

export async function updateAdminCategory(
  id: number,
  input: UpdateAdminCategoryInput,
): Promise<AdminCategory> {
  const [updated] = await db
    .update(categories)
    .set({ label: input.label, sortOrder: input.sortOrder })
    .where(eq(categories.id, id))
    .returning(adminCategorySelect);

  if (!updated) {
    throw ApiError.notFound('Không tìm thấy danh mục.');
  }

  return updated;
}