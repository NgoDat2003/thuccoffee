import { and, asc, count, eq } from 'drizzle-orm';

import { ApiError } from '../../common/api-error.js';
import { isUniqueViolation } from '../../common/db-errors.js';
import { db } from '../../db/client.js';
import { mediaAttachments, stores } from '../../db/schema.js';
import type {
  AdminStore,
  AdminStoreListItem,
  CreateAdminStoreInput,
  PublishAdminStoreInput,
  ReplaceAdminStoreGalleryInput,
  UpdateAdminStoreInput,
} from './stores.admin.schemas.js';

const adminStoreSelect = {
  id: stores.id,
  name: stores.name,
  slug: stores.slug,
  address: stores.address,
  phone: stores.phone,
  hours: stores.hours,
  image: stores.image,
  region: stores.region,
  isPublished: stores.isPublished,
  sortOrder: stores.sortOrder,
  createdAt: stores.createdAt,
  updatedAt: stores.updatedAt,
};

type AdminStoreRow = {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  region: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

function toIsoTimestamps(row: AdminStoreRow) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// Gallery của store là các attachment role='gallery'. Mọi truy vấn gallery
// phải đủ 3 điều kiện owner_type + owner_id + role để không đụng role khác
// ('cover', 'detail') của cùng record.
function galleryScope(storeId: number) {
  return and(
    eq(mediaAttachments.ownerType, 'store'),
    eq(mediaAttachments.ownerId, storeId),
    eq(mediaAttachments.role, 'gallery'),
  );
}

export async function listAdminStores(): Promise<AdminStoreListItem[]> {
  const [rows, galleryCounts] = await Promise.all([
    db
      .select(adminStoreSelect)
      .from(stores)
      .orderBy(asc(stores.sortOrder), asc(stores.name)),
    db
      .select({ ownerId: mediaAttachments.ownerId, total: count() })
      .from(mediaAttachments)
      .where(and(
        eq(mediaAttachments.ownerType, 'store'),
        eq(mediaAttachments.role, 'gallery'),
      ))
      .groupBy(mediaAttachments.ownerId),
  ]);

  const countByStore = new Map(galleryCounts.map((row) => [row.ownerId, row.total]));
  return rows.map((row) => ({
    ...toIsoTimestamps(row),
    galleryCount: countByStore.get(row.id) ?? 0,
  }));
}

export async function getAdminStore(id: number): Promise<AdminStore> {
  const [row] = await db
    .select(adminStoreSelect)
    .from(stores)
    .where(eq(stores.id, id))
    .limit(1);
  if (!row) throw ApiError.notFound('Không tìm thấy cửa hàng.');

  const gallery = await db
    .select({
      storageKey: mediaAttachments.storageKey,
      sortOrder: mediaAttachments.sortOrder,
    })
    .from(mediaAttachments)
    .where(galleryScope(id))
    .orderBy(asc(mediaAttachments.sortOrder), asc(mediaAttachments.id));

  return { ...toIsoTimestamps(row), gallery };
}

export async function createAdminStore(
  input: CreateAdminStoreInput,
): Promise<AdminStore> {
  try {
    const [created] = await db
      .insert(stores)
      .values({
        name: input.name,
        slug: input.slug,
        address: input.address,
        phone: input.phone,
        hours: input.hours,
        image: input.image,
        region: input.region,
        sortOrder: input.sortOrder,
      })
      .returning({ id: stores.id });
    if (!created) throw new Error('Insert store did not return an id.');
    return getAdminStore(created.id);
  } catch (cause) {
    if (isUniqueViolation(cause)) {
      throw ApiError.conflict('Slug cửa hàng đã tồn tại.');
    }
    throw cause;
  }
}

export async function updateAdminStore(
  id: number,
  input: UpdateAdminStoreInput,
): Promise<AdminStore> {
  const [updated] = await db
    .update(stores)
    .set({
      name: input.name,
      address: input.address,
      phone: input.phone,
      hours: input.hours,
      image: input.image,
      region: input.region,
      sortOrder: input.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, id))
    .returning({ id: stores.id });
  if (!updated) throw ApiError.notFound('Không tìm thấy cửa hàng.');
  return getAdminStore(id);
}

export async function publishAdminStore(
  id: number,
  input: PublishAdminStoreInput,
): Promise<AdminStore> {
  const [updated] = await db
    .update(stores)
    .set({ isPublished: input.isPublished, updatedAt: new Date() })
    .where(eq(stores.id, id))
    .returning({ id: stores.id });
  if (!updated) throw ApiError.notFound('Không tìm thấy cửa hàng.');
  return getAdminStore(id);
}

// Replace toàn bộ thay vì add/remove lẻ: idempotent và né uniqueIndex
// (owner_type, owner_id, storage_key, role) khi đổi thứ tự ảnh.
export async function replaceAdminStoreGallery(
  id: number,
  input: ReplaceAdminStoreGalleryInput,
): Promise<AdminStore> {
  const [existing] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.id, id))
    .limit(1);
  if (!existing) throw ApiError.notFound('Không tìm thấy cửa hàng.');

  await db.transaction(async (tx) => {
    await tx.delete(mediaAttachments).where(galleryScope(id));
    if (input.items.length > 0) {
      await tx.insert(mediaAttachments).values(
        input.items.map((item) => ({
          ownerType: 'store',
          ownerId: id,
          storageKey: item.storageKey,
          role: 'gallery',
          sortOrder: item.sortOrder,
        })),
      );
    }
  });

  return getAdminStore(id);
}
