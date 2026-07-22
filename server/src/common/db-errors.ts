// Nhận diện unique violation (Postgres 23505) từ lỗi Drizzle/pg. Driver bọc
// lỗi gốc trong chuỗi `cause`, nên dò tối đa vài tầng thay vì chỉ nhìn bề mặt.
export function isUniqueViolation(cause: unknown): boolean {
  let current = cause;
  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof current !== 'object' || current === null) return false;
    if ('code' in current && current.code === '23505') return true;
    current = 'cause' in current ? current.cause : undefined;
  }
  return false;
}
