import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import { ApiError } from '../../common/api-error.js';
import { env } from '../../common/env.js';
import { minioClient } from '../../lib/minio-client.js';
import {
  allowedImageExtensions,
  type AllowedImageExtension,
  type UploadKind,
} from './uploads.schemas.js';

const contentTypes: Record<AllowedImageExtension, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};


function hasMagicBytes(buffer: Buffer, extension: AllowedImageExtension): boolean {
  if (extension === '.png') {
    return buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  }
  if (extension === '.jpg' || extension === '.jpeg') {
    return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  }
  if (extension === '.gif') {
    return buffer.subarray(0, 4).equals(Buffer.from('GIF8', 'ascii'));
  }

  // Keep WebP in the documented allow-list: both RIFF and WEBP markers are
  // required because either marker alone is not enough to identify the format.
  return buffer.subarray(0, 4).equals(Buffer.from('RIFF', 'ascii'))
    && buffer.subarray(8, 12).equals(Buffer.from('WEBP', 'ascii'));
}

export function validateImage(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
): AllowedImageExtension {
  const extension = extname(originalName).toLowerCase();

  if (!allowedImageExtensions.includes(extension as AllowedImageExtension)) {
    throw ApiError.badRequest('Định dạng file không được hỗ trợ.');
  }

  const validatedExtension = extension as AllowedImageExtension;
  if (mimetype !== contentTypes[validatedExtension]) {
    throw ApiError.badRequest('MIME type không khớp với phần mở rộng file.');
  }

  if (!hasMagicBytes(buffer, validatedExtension)) {
    throw ApiError.badRequest('Nội dung file không khớp định dạng ảnh.');
  }

  return validatedExtension;
}

export function buildObjectKey(
  kind: UploadKind,
  extension: AllowedImageExtension,
): string {
  return kind + '/' + randomUUID() + extension;
}

export async function uploadImage(
  kind: UploadKind,
  buffer: Buffer,
  originalName: string,
  mimetype: string,
): Promise<string> {
  const extension = validateImage(buffer, originalName, mimetype);
  const objectKey = buildObjectKey(kind, extension);

  await minioClient.putObject(
    env.MINIO_BUCKET,
    objectKey,
    buffer,
    buffer.length,
    { 'Content-Type': contentTypes[extension] },
  );

  return objectKey;
}
