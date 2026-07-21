// Mọi phản hồi có body đều bọc trong kiểu này. Discriminated union theo
// `success` để phía tiêu thụ không đọc nhầm `data` ở nhánh lỗi.

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | {
      success: false;
      error: { code: string; message: string; details?: unknown };
    };

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function okPaginated<T>(
  data: T,
  meta: PaginationMeta,
): ApiResponse<T> {
  return { success: true, data, meta };
}
