export type AdminSortDirection = 'asc' | 'desc';

export interface AdminSortState {
  key: string;
  direction: AdminSortDirection;
}

export function nextAdminSort(
  current: AdminSortState | null,
  key: string,
): AdminSortState | null {
  if (current?.key !== key) return { key, direction: 'asc' };
  if (current.direction === 'asc') return { key, direction: 'desc' };
  return null;
}

export function sortAdminRows<T>(
  rows: T[],
  getValue: (row: T) => string | number,
  direction: AdminSortDirection,
): T[] {
  return [...rows].sort((left, right) => {
    const a = getValue(left);
    const b = getValue(right);
    const result = typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a).localeCompare(String(b), 'vi');
    return direction === 'desc' ? -result : result;
  });
}

export function clampAdminPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), Math.max(1, totalPages));
}

export function paginateAdminRows<T>(rows: T[], page: number, pageSize: number): T[] {
  const safePage = clampAdminPage(page, Math.ceil(rows.length / pageSize));
  return rows.slice((safePage - 1) * pageSize, safePage * pageSize);
}

export function adminPageItems(page: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const window = [page - 1, page, page + 1]
    .filter((value) => value > 1 && value < totalPages);
  const items: Array<number | '…'> = [1];
  if ((window[0] ?? totalPages) > 2) items.push('…');
  items.push(...window);
  if ((window[window.length - 1] ?? 1) < totalPages - 1) items.push('…');
  items.push(totalPages);
  return items;
}
