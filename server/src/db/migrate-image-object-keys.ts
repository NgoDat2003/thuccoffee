import 'dotenv/config';

import { basename } from 'node:path/posix';

import { eq, sql } from 'drizzle-orm';

import { env } from '../common/env.js';
import { minioClient } from '../lib/minio-client.js';
import { closeDatabase, db } from './client.js';
import {
  banners,
  blogPosts,
  mediaAttachments,
  products,
  siteSettings,
  stores,
} from './schema.js';

interface MigrationStats {
  products: number;
  blogPosts: number;
  stores: number;
  banners: number;
  mediaAttachments: number;
  logo: number;
}

async function listObjectKeys(): Promise<string[]> {
  const keys: string[] = [];
  const stream = minioClient.listObjectsV2(env.MINIO_BUCKET, '', true);

  for await (const item of stream) {
    if (item.name) keys.push(item.name);
  }

  return keys.sort();
}

function buildKeysByBasename(objectKeys: string[]): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const objectKey of objectKeys) {
    const filename = basename(objectKey);
    result.set(filename, [...(result.get(filename) ?? []), objectKey]);
  }

  return result;
}

function resolveObjectKey(
  currentValue: string,
  objectKeySet: Set<string>,
  keysByBasename: Map<string, string[]>,
  collisionPrefix?: 'stores',
): string {
  if (objectKeySet.has(currentValue)) return currentValue;

  const filename = basename(currentValue);
  const candidates = keysByBasename.get(filename) ?? [];
  if (candidates.length === 1) return candidates[0]!;

  if (collisionPrefix) {
    const contextualKey = `${collisionPrefix}/${filename}`;
    if (candidates.includes(contextualKey)) return contextualKey;
  }

  if (candidates.length === 0) {
    throw new Error(`Không tìm thấy object MinIO cho ${currentValue}`);
  }

  throw new Error(`Basename không duy nhất: ${filename} -> ${candidates.join(', ')}`);
}

async function migrate(): Promise<void> {
  const objectKeys = await listObjectKeys();
  const objectKeySet = new Set(objectKeys);
  const keysByBasename = buildKeysByBasename(objectKeys);
  const duplicateBasenames = [...keysByBasename.values()].filter((keys) => keys.length > 1);
  const [productRows, blogRows, storeRows, bannerRows, mediaRows, logoRows] = await Promise.all([
    db.select({ id: products.id, thumb: products.thumb, image: products.image }).from(products),
    db.select({ id: blogPosts.id, cover: blogPosts.cover }).from(blogPosts),
    db.select({ id: stores.id, image: stores.image }).from(stores),
    db.select({ id: banners.id, image: banners.image }).from(banners),
    db.select({
      id: mediaAttachments.id,
      ownerType: mediaAttachments.ownerType,
      storageKey: mediaAttachments.storageKey,
    }).from(mediaAttachments),
    db.select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, 'logo_storage_key')),
  ]);

  const mappedProducts = productRows.map((row) => ({
    id: row.id,
    thumb: resolveObjectKey(row.thumb, objectKeySet, keysByBasename),
    image: row.image ? resolveObjectKey(row.image, objectKeySet, keysByBasename) : null,
    changed: !objectKeySet.has(row.thumb) || Boolean(row.image && !objectKeySet.has(row.image)),
  }));
  const mappedBlogs = blogRows.map((row) => ({
    id: row.id,
    cover: resolveObjectKey(row.cover, objectKeySet, keysByBasename),
    changed: !objectKeySet.has(row.cover),
  }));
  const mappedStores = storeRows.map((row) => ({
    id: row.id,
    image: resolveObjectKey(row.image, objectKeySet, keysByBasename),
    changed: !objectKeySet.has(row.image),
  }));
  const mappedBanners = bannerRows.map((row) => ({
    id: row.id,
    image: resolveObjectKey(row.image, objectKeySet, keysByBasename),
    changed: !objectKeySet.has(row.image),
  }));
  const mappedMedia = mediaRows.map((row) => ({
    id: row.id,
    storageKey: resolveObjectKey(
      row.storageKey,
      objectKeySet,
      keysByBasename,
      row.ownerType === 'store' ? 'stores' : undefined,
    ),
    changed: !objectKeySet.has(row.storageKey),
  }));

  const logoValue = logoRows[0]?.value;
  if (!logoValue) throw new Error('Thiếu site_settings.logo_storage_key');
  const expectedLogoKey = logoValue.includes('/') ? logoValue : `site/${logoValue}`;
  if (!objectKeySet.has(expectedLogoKey)) {
    throw new Error(`Logo key không tồn tại trên MinIO: ${expectedLogoKey}`);
  }

  const stats: MigrationStats = {
    products: mappedProducts.filter((row) => row.changed).length,
    blogPosts: mappedBlogs.filter((row) => row.changed).length,
    stores: mappedStores.filter((row) => row.changed).length,
    banners: mappedBanners.filter((row) => row.changed).length,
    mediaAttachments: mappedMedia.filter((row) => row.changed).length,
    logo: logoValue.includes('/') ? 0 : 1,
  };

  await db.transaction(async (tx) => {
    for (const row of mappedProducts.filter((item) => item.changed)) {
      await tx.update(products).set({ thumb: row.thumb, image: row.image }).where(eq(products.id, row.id));
    }
    for (const row of mappedBlogs.filter((item) => item.changed)) {
      await tx.update(blogPosts).set({ cover: row.cover }).where(eq(blogPosts.id, row.id));
    }
    for (const row of mappedStores.filter((item) => item.changed)) {
      await tx.update(stores).set({ image: row.image }).where(eq(stores.id, row.id));
    }
    for (const row of mappedBanners.filter((item) => item.changed)) {
      await tx.update(banners).set({ image: row.image }).where(eq(banners.id, row.id));
    }
    for (const row of mappedMedia.filter((item) => item.changed)) {
      await tx.update(mediaAttachments)
        .set({ storageKey: row.storageKey })
        .where(eq(mediaAttachments.id, row.id));
    }
    await tx.execute(sql`
      UPDATE site_settings
      SET value = 'site/' || value
      WHERE key = 'logo_storage_key' AND value NOT LIKE '%/%'
    `);
  });

  console.log([
    `Bucket mapping ready: ${keysByBasename.size} basenames from ${objectKeys.length} objects`,
    `${duplicateBasenames.length} duplicate basenames handled by verified context`,
    `updated rows ${JSON.stringify(stats)}`,
  ].join('; '));
}

try {
  await migrate();
} catch (error) {
  console.error('Image object-key migration failed:', error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
