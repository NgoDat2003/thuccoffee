import 'dotenv/config';

import { readdir } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

import { env } from '../common/env.js';
import { minioClient } from '../lib/minio-client.js';

const imagesDirectory = resolve(import.meta.dirname, '../../../src/assets/images');

const contentTypeByExtension: Readonly<Record<string, string>> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const unicodeCodepointFilenamePattern = /^[0-9a-f]{4,6}(?:_[0-9a-f]{4,6})*\.png$/;
const namedEmojiFilenames = new Set(['heart.png', 'lightbulb.png']);

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function getContentType(filePath: string): string {
  const extension = extname(filePath).toLowerCase();
  const contentType = contentTypeByExtension[extension];

  if (!contentType) {
    throw new Error(`Unsupported image extension: ${filePath}`);
  }

  return contentType;
}

function isEmojiImage(objectKey: string): boolean {
  if (!objectKey.startsWith('blog/')) return false;

  const filename = objectKey.slice('blog/'.length);
  return unicodeCodepointFilenamePattern.test(filename) || namedEmojiFilenames.has(filename);
}

async function seedImages(): Promise<void> {
  const files = (await listFiles(imagesDirectory)).sort();
  const images = files.map((filePath) => ({
    filePath,
    objectKey: relative(imagesDirectory, filePath).split(sep).join('/'),
  }));
  const managedImages = images.filter(({ objectKey }) => !isEmojiImage(objectKey));

  for (const { filePath, objectKey } of managedImages) {
    await minioClient.fPutObject(env.MINIO_BUCKET, objectKey, filePath, {
      'Content-Type': getContentType(filePath),
    });
  }

  console.log([
    `Image seed completed: ${managedImages.length} files uploaded to bucket ${env.MINIO_BUCKET}`,
    `${images.length - managedImages.length} emoji files skipped.`,
  ].join('; '));
}

try {
  await seedImages();
} catch (error) {
  console.error('Image seed failed:', error);
  process.exitCode = 1;
}
