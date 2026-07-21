// Lỗi có chủ đích từ tầng nghiệp vụ. Mang sẵn HTTP status và mã hằng để
// error handler bọc lại đúng hình dạng mà không phải suy đoán.
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static notFound(message: string, details?: unknown): ApiError {
    return new ApiError(404, 'NOT_FOUND', message, details);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, 'CONFLICT', message, details);
  }
}
