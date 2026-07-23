import { asc, count, eq } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { isUniqueViolation } from '../../common/db-errors.js';
import { db } from '../../db/client.js';
import { categories, productCategories } from '../../db/schema.js';
import type {
  AdminCategory,
  CreateAdminCategoryInput,
  UpdateAdminCategoryInput,
} from './categories.admin.schemas.js';

// Key sinh từ label: bỏ dấu tiếng Việt, lowercase, kebab-case. Key là URL
// public (/menu/<key>) nên bất biến sau khi tạo — đổi tên chỉ đổi label.
function keyFromLabel(label: string): string {
  const key = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!key) throw ApiError.badRequest('Tên danh mục cần có ký tự chữ hoặc số.');
  return key;
}

async function listWithProductCounts(): Promise<AdminCategory[]> {
  const [rows, counts] = await Promise.all([
    db
      .select({
        id: categories.id,
        key: categories.key,
        label: categories.label,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.label)),
    db
      .select({ categoryId: productCategories.categoryId, total: count() })
      .from(productCategories)
      .groupBy(productCategories.categoryId),
  ]);
  const countByCategory = new Map(counts.map((row) => [row.categoryId, row.total]));
  return rows.map((row) => ({ ...row, productCount: countByCategory.get(row.id) ?? 0 }));
}

async function requireAdminCategory(id: number): Promise<AdminCategory> {
  const category = (await listWithProductCounts()).find((row) => row.id === id);
  if (!category) throw ApiError.notFound('Không tìm thấy danh mục.');
  return category;
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  return listWithProductCounts();
}

export async function createAdminCategory(
  input: CreateAdminCategoryInput,
): Promise<AdminCategory> {
  try {
    const [created] = await db
      .insert(categories)
      .values({
        key: keyFromLabel(input.label),
        label: input.label,
        sortOrder: input.sortOrder,
      })
      .returning({ id: categories.id });
    if (!created) throw new Error('Insert category did not return an id.');
    return requireAdminCategory(created.id);
  } catch (cause) {
    if (isUniqueViolation(cause)) {
      throw ApiError.conflict('Danh mục với key này đã tồn tại.');
    }
    throw cause;
  }
}

export async function updateAdminCategory(
  id: number,
  input: UpdateAdminCategoryInput,
): Promise<AdminCategory> {
  const [updated] = await db
    .update(categories)
    .set({ label: input.label, sortOrder: input.sortOrder })
    .where(eq(categories.id, id))
    .returning({ id: categories.id });
  if (!updated) throw ApiError.notFound('Không tìm thấy danh mục.');
  return requireAdminCategory(id);
}

export async function deleteAdminCategory(id: number): Promise<void> {
  const category = await requireAdminCategory(id);
  // Chặn xóa khi còn sản phẩm liên kết — tránh sản phẩm mồ côi danh mục và
  // link menu public chết. Admin phải gỡ sản phẩm khỏi danh mục trước.
  if (category.productCount > 0) {
    throw ApiError.conflict(
      `Danh mục còn ${category.productCount} sản phẩm — gỡ sản phẩm khỏi danh mục trước khi xóa.`,
    );
  }
  await db.delete(categories).where(eq(categories.id, id));
}
