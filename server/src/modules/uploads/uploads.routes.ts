import { Router } from 'express';
import multer from 'multer';

import { ApiError } from '../../common/api-error.js';
import { ok } from '../../common/api-response.js';
import { MAX_UPLOAD_BYTES, uploadKindSchema } from './uploads.schemas.js';
import { uploadImage } from './uploads.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

export const uploadsRoutes = Router();

uploadsRoutes.post('/', upload.single('file'), async (req, res) => {
  // Multipart fields only exist after Multer has parsed the request.
  const kind = uploadKindSchema.parse(req.body.kind);

  if (!req.file) {
    throw ApiError.badRequest('Vui lòng chọn file ảnh.');
  }

  const objectKey = await uploadImage(
    kind,
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
  );

  res.status(201).json(ok({ objectKey }));
});