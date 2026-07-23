import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import {
  adminPageItems,
  clampAdminPage,
  nextAdminSort,
  paginateAdminRows,
  sortAdminRows,
  type AdminSortState,
} from './admin-table-state';

export type { AdminSortState } from './admin-table-state';

export interface AdminTableColumn<T> {
  key: string;
  label: ReactNode;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  headerClassName?: string;
  cellClassName?: string;
}

export interface AdminTableChange {
  action: 'paginate' | 'sort';
  page: number;
  sort: AdminSortState | null;
}

interface AdminTablePagination {
  page: number;
  totalPages: number;
  totalRows?: number;
  onPageChange: (page: number) => void;
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
  pagination?: AdminTablePagination;
  mode?: 'client' | 'server';
  sort?: AdminSortState | null;
  defaultSort?: AdminSortState | null;
  onChange?: (change: AdminTableChange) => void;
  stickyHeader?: boolean;
  tableClassName?: string;
  rowClassName?: (row: T) => string;
}

function isSortableColumn<T>(
  column: AdminTableColumn<T>,
  tableMode: 'client' | 'server',
  hasChangeHandler: boolean,
): boolean {
  return Boolean(column.sortValue) && (tableMode === 'client' || hasChangeHandler);
}

function columnAriaSort(
  columnKey: string,
  sortable: boolean,
  activeSort: AdminSortState | null,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!sortable) return undefined;
  if (activeSort?.key !== columnKey) return 'none';
  return activeSort.direction === 'asc' ? 'ascending' : 'descending';
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
  mode,
  sort,
  defaultSort = null,
  onChange,
  stickyHeader = false,
  tableClassName = '',
  rowClassName,
}: AdminTableProps<T>) {
  const tableMode = mode ?? (pagination ? 'server' : 'client');
  const [internalSort, setInternalSort] = useState<AdminSortState | null>(defaultSort);
  const [clientPage, setClientPage] = useState(1);
  const activeSort = sort === undefined ? internalSort : sort;

  const sortedRows = useMemo(() => {
    if (tableMode === 'server' || !activeSort) return rows;
    const column = columns.find((item) => item.key === activeSort.key);
    if (!column?.sortValue) return rows;
    return sortAdminRows(rows, column.sortValue, activeSort.direction);
  }, [activeSort, columns, rows, tableMode]);

  const clientTotalPages = pageSize && !pagination
    ? Math.max(1, Math.ceil(sortedRows.length / pageSize))
    : 1;
  const visibleRows = useMemo(
    () => pageSize && !pagination
      ? paginateAdminRows(sortedRows, clientPage, pageSize)
      : sortedRows,
    [clientPage, pageSize, pagination, sortedRows],
  );
  const activePagination: AdminTablePagination | undefined = pagination ?? (pageSize ? {
    page: clientPage,
    totalPages: clientTotalPages,
    totalRows: sortedRows.length,
    onPageChange: setClientPage,
  } : undefined);

  useEffect(() => {
    setClientPage(1);
  }, [clientResetKey, pageSize]);

  useEffect(() => {
    setClientPage((current) => clampAdminPage(current, clientTotalPages));
  }, [clientTotalPages]);

  useEffect(() => {
    onVisibleRowsChange?.(visibleRows);
  }, [onVisibleRowsChange, visibleRows]);

  function changeSort(column: AdminTableColumn<T>) {
    if (!isSortableColumn(column, tableMode, onChange !== undefined)) return;
    const nextSort = nextAdminSort(activeSort, column.key);
    if (sort === undefined) setInternalSort(nextSort);
    if (tableMode === 'client') setClientPage(1);
    onChange?.({ action: 'sort', page: 1, sort: nextSort });
  }

  function changePage(page: number) {
    if (!activePagination) return;
    const nextPage = clampAdminPage(page, activePagination.totalPages);
    activePagination.onPageChange(nextPage);
    onChange?.({ action: 'paginate', page: nextPage, sort: activeSort });
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-[14px] border border-admin-border bg-admin-surface">
        <table className={`min-w-full border-collapse text-[14px] ${tableClassName}`}>
          <thead className={stickyHeader ? 'sticky top-0 z-10 bg-admin-surface' : undefined}>
            <tr className="border-b border-admin-border bg-admin-border-soft/35">
              {columns.map((column) => {
                const sortable = isSortableColumn(column, tableMode, onChange !== undefined);
                const active = activeSort?.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={columnAriaSort(column.key, sortable, activeSort)}
                    className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-admin-muted-2 first:pl-4 last:pr-4 ${column.headerClassName ?? ''}`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => changeSort(column)}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-left outline-none transition-colors hover:text-admin-ink focus-visible:ring-2 focus-visible:ring-admin-accent"
                      >
                        {column.label}
                        <span aria-hidden="true" className={active ? 'text-admin-accent-strong' : 'text-admin-muted-2/60'}>
                          {active ? activeSort.direction === 'asc' ? '↑' : '↓' : '↕'}
                        </span>
                      </button>
                    ) : column.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-36 px-4 text-center text-admin-muted">
                  <span role="status" aria-live="polite">Đang tải dữ liệu…</span>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-36 px-4 text-center text-admin-muted">
                  {emptyText}
                </td>
              </tr>
            ) : visibleRows.map((row) => (
              <tr
                key={rowKey(row)}
                className={`align-middle transition-colors hover:bg-admin-border-soft/30 ${rowClassName?.(row) ?? ''}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`border-b border-admin-border-soft px-4 py-4 text-admin-muted last:pr-4 ${column.cellClassName ?? ''}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {activePagination && (
        <Pagination
          page={activePagination.page}
          totalPages={activePagination.totalPages}
          totalRows={activePagination.totalRows}
          onPageChange={changePage}
        />
      )}
    </div>
  );
}

export function IndeterminateCheckbox({
  indeterminate = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return <input ref={inputRef} type="checkbox" {...props} />;
}

export function Pagination({
  page,
  totalPages,
  totalRows,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalRows?: number;
  onPageChange: (page: number) => void;
}) {
  const arrowClass = 'flex size-8 items-center justify-center rounded-[8px] border border-admin-border text-[13px] text-admin-ink transition-colors hover:border-admin-accent hover:text-admin-accent disabled:opacity-35 disabled:hover:border-admin-border disabled:hover:text-admin-ink';
  if (totalPages <= 1 && totalRows === undefined) return null;

  return (
    <nav aria-label="Phân trang" className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-1">
      <p className="text-[12.5px] text-admin-muted-2">
        {totalRows !== undefined && (
          <><strong className="font-bold text-admin-ink-soft">{totalRows}</strong> kết quả</>
        )}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={arrowClass}>‹</button>
          {adminPageItems(page, totalPages).map((item, index) => item === '…' ? (
            <span key={`gap-${index}`} className="flex size-8 items-end justify-center pb-1 text-[13px] text-admin-muted-2" aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Trang ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={[
                'flex size-8 items-center justify-center rounded-[8px] border text-[13px] font-semibold transition-colors',
                item === page
                  ? 'border-admin-accent bg-admin-accent text-white'
                  : 'border-admin-border text-admin-ink hover:border-admin-accent hover:text-admin-accent',
              ].join(' ')}
            >
              {item}
            </button>
          ))}
          <button type="button" aria-label="Trang sau" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={arrowClass}>›</button>
        </div>
      )}
    </nav>
  );
}
