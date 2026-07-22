import { useMemo, useState, type ReactNode } from 'react';

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface AdminTableProps<T> {
  rows: T[];
  columns: Array<AdminTableColumn<T>>;
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyText?: string;
}

export default function AdminTable<T>({
  rows,
  columns,
  rowKey,
  isLoading = false,
  emptyText = 'Không có dữ liệu.',
}: AdminTableProps<T>) {
  const [sortKey, setSortKey] = useState('');
  const [descending, setDescending] = useState(false);

  const sortedRows = useMemo(() => {
    const column = columns.find((item) => item.key === sortKey);
    if (!column?.sortValue) return rows;

    return [...rows].sort((left, right) => {
      const a = column.sortValue!(left);
      const b = column.sortValue!(right);
      const result = typeof a === 'number' && typeof b === 'number'
        ? a - b
        : String(a).localeCompare(String(b), 'vi');
      return descending ? -result : result;
    });
  }, [columns, descending, rows, sortKey]);

  function changeSort(column: AdminTableColumn<T>) {
    if (!column.sortValue) return;
    if (sortKey === column.key) {
      setDescending((value) => !value);
    } else {
      setSortKey(column.key);
      setDescending(false);
    }
  }

  if (isLoading) {
    return <p className="py-10 text-center text-stone-500">Đang tải dữ liệu…</p>;
  }

  if (rows.length === 0) {
    return <p className="py-10 text-center text-stone-500">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        <thead className="bg-stone-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left font-semibold text-stone-700">
                <button
                  type="button"
                  disabled={!column.sortValue}
                  onClick={() => changeSort(column)}
                  className="disabled:cursor-default"
                >
                  {column.label}
                  {sortKey === column.key ? (descending ? ' ↓' : ' ↑') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white">
          {sortedRows.map((row) => (
            <tr key={rowKey(row)} className="align-middle">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-stone-700">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}