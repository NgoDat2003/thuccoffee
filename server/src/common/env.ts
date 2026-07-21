import { z } from 'zod';

// Validate biến môi trường ngay lúc khởi động. Thiếu biến bắt buộc thì thoát
// kèm thông báo nêu đúng tên, thay vì lỗi khó hiểu khi có request đầu tiên.
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL là bắt buộc'),
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
