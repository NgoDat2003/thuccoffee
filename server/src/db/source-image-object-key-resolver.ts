import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type ResolveImageObjectKey = (value: string, collisionPrefix?: string) => string;

const sourceImagesRoot = fileURLToPath(
  new URL('../../../frontend/src/assets/images/', import.meta.url),
);

async function listImageObjectKeys(
  directory = sourceImagesRoot,
  prefix = '',
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const objectKeys: string[] = [];

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      objectKeys.push(...await listImageObjectKeys(
        path.join(directory, entry.name),
        relativePath,
      ));
    } else if (entry.isFile()) {
      objectKeys.push(relativePath);
    }
  }

  return objectKeys;
}

export async function createSourceImageObjectKeyResolver(): Promise<ResolveImageObjectKey> {
  const objectKeys = await listImageObjectKeys();
  const objectKeySet = new Set(objectKeys);
  const keysByBasename = new Map<string, string[]>();

  for (const objectKey of objectKeys) {
    const basename = path.posix.basename(objectKey);
    keysByBasename.set(basename, [
      ...(keysByBasename.get(basename) ?? []),
      objectKey,
    ]);
  }

  return (value, collisionPrefix) => {
    const normalizedValue = value.replaceAll('\\', '/');
    if (normalizedValue.includes('/')) {
      if (!objectKeySet.has(normalizedValue)) {
        throw new Error(`Image object key does not exist: ${normalizedValue}`);
      }
      return normalizedValue;
    }

    const candidates = keysByBasename.get(normalizedValue) ?? [];
    if (candidates.length === 1) return candidates[0]!;

    const contextualKey = collisionPrefix
      ? `${collisionPrefix}/${normalizedValue}`
      : null;
    if (contextualKey && candidates.includes(contextualKey)) return contextualKey;

    if (candidates.length === 0) {
      throw new Error(`Image basename does not exist: ${normalizedValue}`);
    }
    throw new Error(
      `Ambiguous image basename ${normalizedValue}: ${candidates.join(', ')}`,
    );
  };
}
