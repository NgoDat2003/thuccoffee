import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';

import { ApiError } from './api-error.js';
import type { ApiResponse } from './api-response.js';

function errorBody(
  code: string,
  message: string,
  details?: unknown,
): ApiResponse<never> {
  return { success: false, error: { code, message, details } };
}

// Route không khớp: trả 404 đúng hình dạng bọc thay vì trang HTML mặc định.
export function notFoundHandler(_req: Request, res: Response): void {
  res
    .status(404)
    .json(errorBody('NOT_FOUND', 'Không tìm thấy tài nguyên.'));
}

// Middleware cuối chuỗi. Bọc mọi lỗi về một hình dạng; ngoại lệ ngoài dự tính
// thành 500 với thông báo chung, không lộ stack trace ra client.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File vượt quá 5MB.'
      : 'Dữ liệu upload không hợp lệ.';
    res.status(400).json(errorBody('BAD_REQUEST', message));
    return;
  }

  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json(errorBody(err.code, err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res
      .status(400)
      .json(errorBody('BAD_REQUEST', 'Dữ liệu không hợp lệ.', details));
    return;
  }

  req.log?.error({ err }, 'Lỗi không xử lý được');
  res
    .status(500)
    .json(errorBody('INTERNAL_ERROR', 'Đã xảy ra lỗi máy chủ.'));
}
