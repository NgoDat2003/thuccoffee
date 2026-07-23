import { useEffect, useMemo, useState, type ReactNode } from 'react';

export interface AdminTableColumn<T> {
  key: string;
  label: ReactNode;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface AdminTableProps<T> {
  rows: T[];
  columns: Array<AdminTableColumn<T>>;
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyText?: string;
  pageSize?: number;
  clientResetKey?: string | number;
  onVisibleRowsChange?: (rows: T[]) => void;
  pagination?: { page: number; totalPages: number; onPageChange: (page: number) => void; };
}

export default function AdminTable<T>({
  rows,
  columns,
  rowKey,
  isLoading = false,
  emptyText = 'Không có dữ liệu.',
  pageSize,
  clientResetKey,
  onVisibleRowsChange,
  pagination,
}: AdminTableProps<T>) {
  const [sortKey, setSortKey] = useState('');
  const [descending, setDescending] = useState(false);
  const [clientPage, setClientPage] = useState(1);

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

  const clientTotalPages = pageSize && !pagination ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
  const visibleRows = pageSize && !pagination ? sortedRows.slice((clientPage - 1) * pageSize, clientPage * pageSize) : sortedRows;
  const activePagination = pagination ?? (pageSize ? { page: clientPage, totalPages: clientTotalPages, onPageChange: setClientPage } : undefined);

  useEffect(() => { setClientPage(1); }, [clientResetKey, pageSize]);
  useEffect(() => { setClientPage((current) => Math.min(current, clientTotalPages)); }, [clientTotalPages]);
  useEffect(() => { onVisibleRowsChange?.(visibleRows); }, [onVisibleRowsChange, visibleRows]);

  function changeSort(column: AdminTableColumn<T>) {
    if (!column.sortValue) return;
    if (sortKey === column.key) setDescending((value) => !value);
    else { setSortKey(column.key); setDescending(false); }
    setClientPage(1);
  }

  if (isLoading) return <p className="py-10 text-center text-admin-muted">Đang tải dữ liệu…</p>;
  if (rows.length === 0) return <p className="py-10 text-center text-admin-muted">{emptyText}</p>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[14px]">
          <thead><tr className="border-b border-admin-border">{columns.map((column) => (
            <th key={column.key} className="px-4 pt-0 pb-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-admin-muted-2 first:pl-0 last:pr-0">
              {column.sortValue ? <button type="button" onClick={() => changeSort(column)}>{column.label}{sortKey === column.key ? (descending ? ' ↓' : ' ↑') : ''}</button> : column.label}
            </th>
          ))}</tr></thead>
          <tbody>{visibleRows.map((row) => (
            <tr key={rowKey(row)} className="align-middle">{columns.map((column) => (
              <td key={column.key} className="border-b border-admin-border-soft px-4 py-4 text-admin-muted first:pl-0 last:pr-0">{column.render(row)}</td>
            ))}</tr>
          ))}</tbody>
        </table>
      </div>
      {activePagination && activePagination.totalPages > 1 && (
        <nav aria-label="Phân trang" className="mt-6 flex items-center justify-center gap-5 border-t border-admin-border pt-5">
          <button type="button" disabled={activePagination.page <= 1} onClick={() => activePagination.onPageChange(activePagination.page - 1)} className="min-h-11 text-[13px] font-bold text-admin-ink disabled:opacity-35">← Trước</button>
          <span className="text-[13px] text-admin-muted-2">Trang {activePagination.page} / {activePagination.totalPages}</span>
          <button type="button" disabled={activePagination.page >= activePagination.totalPages} onClick={() => activePagination.onPageChange(activePagination.page + 1)} className="min-h-11 text-[13px] font-bold text-admin-ink disabled:opacity-35">Sau →</button>
        </nav>
      )}
    </div>
  );
}
