import 'dotenv/config';

import { basename } from 'node:path/posix';

import { eq } from 'drizzle-orm';

import { env } from '../src/common/env.js';
import { closeDatabase, db } from '../src/db/client.js';
import {
  banners,
  blogPosts,
  mediaAttachments,
  products,
  siteSettings,
  stores,
} from '../src/db/schema.js';
import { minioClient } from '../src/lib/minio-client.js';

const VALID_PREFIX = /^(?:banners|blog|products|site|stores)\//;
const BLOG_ASSET_PATTERN = /blog-asset:([^"']+)/g;
const STATIC_IMAGE_KEYS = [
  'site/icon-coffee.png',
  'site/icon-delivery.png',
  'site/151b6674_circlelogo-white-blue-jul2023.png',
  'stores/698435b6_thuc-duong41.jpg',
  'blog/249fc9a9_post-17042023.png',
  'site/751cd7ba_2.png',
  'site/a030442e_4.png',
  'site/56e70517_z6157733703207-60f39403ff895814bcae5bee6e3dbfba.jpg',
  'site/6cdd14d1_74.jpg',
  'site/38477004_z4196149101339-58b3de8b5ff9725fda6c9c627d63726b.jpg',
  'site/170ff33_thuc2d41.jpg',
  'site/48270e72_z6157795668203-258e0e9a0e1ce535d1d0782e3199ea9a.jpg',
  'site/9ead2735_z6157794639130-42110afa99c0a14e5f9c8fdd6d5e84a5.jpg',
  'site/a96b3f5c_z6157794642418-4e22336e67fc1feac49709d2e700744e.jpg',
  'site/c3bc3b1c_z6155463159164-bfe0689d79840c400bbaad0696aeec0c.jpg',
] as const;

const protocol = env.MINIO_USE_SSL ? 'https' : 'http';
const publicBaseUrl = `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET}`;

interface ImageReference {
  source: string;
  key: string;
}

async function listObjectKeys(): Promise<string[]> {
  const keys: string[] = [];
  const stream = minioClient.listObjectsV2(env.MINIO_BUCKET, '', true);

  for await (const item of stream) {
    if (item.name) keys.push(item.name);
  }

  return keys.sort();
}

function addReference(
  references: ImageReference[],
  source: string,
  value: string | null,
): void {
  if (value) references.push({ source, key: value });
}

async function loadDatabaseReferences(): Promise<ImageReference[]> {
  const references: ImageReference[] = [];
  const [productRows, blogRows, storeRows, bannerRows, mediaRows, logoRows] = await Promise.all([
    db.select({ id: products.id, thumb: products.thumb, image: products.image }).from(products),
    db.select({ id: blogPosts.id, cover: blogPosts.cover, content: blogPosts.content }).from(blogPosts),
    db.select({ id: stores.id, image: stores.image }).from(stores),
    db.select({ id: banners.id, image: banners.image }).from(banners),
    db.select({ id: mediaAttachments.id, key: mediaAttachments.storageKey }).from(mediaAttachments),
    db.select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, 'logo_storage_key')),
  ]);

  for (const row of productRows) {
    addReference(references, `products.${row.id}.thumb`, row.thumb);
    addReference(references, `products.${row.id}.image`, row.image);
  }
  for (const row of blogRows) {
    addReference(references, `blog_posts.${row.id}.cover`, row.cover);
    for (const match of row.content?.matchAll(BLOG_ASSET_PATTERN) ?? []) {
      addReference(references, `blog_posts.${row.id}.content`, `blog/${match[1]}`);
    }
  }
  for (const row of storeRows) addReference(references, `stores.${row.id}.image`, row.image);
  for (const row of bannerRows) addReference(references, `banners.${row.id}.image`, row.image);
  for (const row of mediaRows) addReference(references, `media_attachments.${row.id}`, row.key);
  for (const row of logoRows) addReference(references, 'site_settings.logo_storage_key', row.value);

  return references;
}

function buildKeysByBasename(objectKeys: string[]): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const objectKey of objectKeys) {
    const filename = basename(objectKey);
    result.set(filename, [...(result.get(filename) ?? []), objectKey]);
  }

  return result;
}

function encodeObjectKey(objectKey: string): string {
  return objectKey.split('/').map(encodeURIComponent).join('/');
}

async function checkPublicObjects(objectKeys: string[]): Promise<string[]> {
  const failures: string[] = [];
  const queue = [...objectKeys];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const objectKey = queue.shift();
      if (!objectKey) return;
      const response = await fetch(`${publicBaseUrl}/${encodeObjectKey(objectKey)}`, { method: 'HEAD' });
      if (!response.ok) failures.push(`${objectKey} -> HTTP ${response.status}`);
    }
  }

  await Promise.all(Array.from({ length: 12 }, () => worker()));
  return failures;
}

async function main(): Promise<void> {
  const objectKeys = await listObjectKeys();
  const objectKeySet = new Set(objectKeys);
  const keysByBasename = buildKeysByBasename(objectKeys);
  const references = [
    ...await loadDatabaseReferences(),
    ...STATIC_IMAGE_KEYS.map((key) => ({ source: 'frontend.static', key })),
  ];
  const missingReferences: string[] = [];
  const nonFullKeys: string[] = [];

  for (const reference of references) {
    const candidates = keysByBasename.get(basename(reference.key)) ?? [];
    if (!objectKeySet.has(reference.key) && candidates.length === 0) {
      missingReferences.push(`${reference.source}: ${reference.key}`);
    }
    if (!VALID_PREFIX.test(reference.key)) {
      nonFullKeys.push(`${reference.source}: ${reference.key}`);
    }
  }

  const publicFailures = await checkPublicObjects(objectKeys);
  const ambiguousBasenames = [...keysByBasename.entries()].filter(([, keys]) => keys.length > 1);

  console.log(`Bucket objects: ${objectKeys.length}; public HEAD failures: ${publicFailures.length}`);
  console.log(`Image references: ${references.length}; missing: ${missingReferences.length}; basename-only: ${nonFullKeys.length}`);
  console.log(`Duplicate basenames in bucket: ${ambiguousBasenames.length}`);

  for (const failure of publicFailures) console.error(`PUBLIC FAIL ${failure}`);
  for (const failure of missingReferences) console.error(`MISSING ${failure}`);
  for (const failure of nonFullKeys) console.error(`PREFIX FAIL ${failure}`);

  if (publicFailures.length > 0 || missingReferences.length > 0 || nonFullKeys.length > 0) {
    process.exitCode = 1;
  } else {
    console.log(`Smoke images passed at ${publicBaseUrl}.`);
  }
}

try {
  await main();
} catch (error) {
  console.error('Smoke images failed:', error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
