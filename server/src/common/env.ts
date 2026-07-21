import { z } from 'zod';

// Validate biến môi trường ngay lúc khởi động. Thiếu biến bắt buộc thì thoát
// kèm thông báo nêu đúng tên, thay vì lỗi khó hiểu khi có request đầu tiên.
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL là bắt buộc'),
  MINIO_ENDPOINT: z.string().min(1, 'MINIO_ENDPOINT is required'),
  MINIO_PORT: z.coerce.number().int().positive().max(65535),
  MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY is required'),
  MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY is required'),
  MINIO_BUCKET: z.string().min(1, 'MINIO_BUCKET is required'),
  MINIO_USE_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(`Cấu hình môi trường không hợp lệ:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;
