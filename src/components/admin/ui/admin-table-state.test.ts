import { describe, expect, it } from 'vitest';

import {
  adminPageItems,
  clampAdminPage,
  nextAdminSort,
  paginateAdminRows,
  sortAdminRows,
} from './admin-table-state';

describe('admin table state', () => {
  it('cycles a column through ascending, descending, and unsorted', () => {
    const ascending = nextAdminSort(null, 'name');
    const descending = nextAdminSort(ascending, 'name');

    expect(ascending).toEqual({ key: 'name', direction: 'asc' });
    expect(descending).toEqual({ key: 'name', direction: 'desc' });
    expect(nextAdminSort(descending, 'name')).toBeNull();
    expect(nextAdminSort(descending, 'price')).toEqual({ key: 'price', direction: 'asc' });
  });

  it('sorts Vietnamese strings without mutating the input array', () => {
    const rows = [{ name: 'Trà' }, { name: 'Cà phê' }, { name: 'Bánh' }];
    const result = sortAdminRows(rows, (row) => row.name, 'asc');

    expect(result.map((row) => row.name)).toEqual(['Bánh', 'Cà phê', 'Trà']);
    expect(rows.map((row) => row.name)).toEqual(['Trà', 'Cà phê', 'Bánh']);
  });

  it('sorts numbers and paginates the sorted rows', () => {
    const rows = [{ order: 30 }, { order: 10 }, { order: 20 }];
    const sorted = sortAdminRows(rows, (row) => row.order, 'desc');

    expect(sorted.map((row) => row.order)).toEqual([30, 20, 10]);
    expect(paginateAdminRows(sorted, 2, 2)).toEqual([{ order: 10 }]);
  });

  it('clamps pages and builds the compact pagination window', () => {
    expect(clampAdminPage(9, 3)).toBe(3);
    expect(clampAdminPage(0, 3)).toBe(1);
    expect(adminPageItems(5, 20)).toEqual([1, '…', 4, 5, 6, '…', 20]);
    expect(adminPageItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});
