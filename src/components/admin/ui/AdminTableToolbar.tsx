import type { ReactNode } from 'react';

interface AdminTableToolbarProps {
  children: ReactNode;
  resultCount?: number;
  activeFilterCount?: number;
  onClearFilters?: () => void;
}

export default function AdminTableToolbar({
  children,
  resultCount,
  activeFilterCount = 0,
  onClearFilters,
}: AdminTableToolbarProps) {
  return (
    <div className="mb-5 rounded-[14px] border border-admin-border bg-admin-surface p-3.5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <div className="flex flex-wrap items-center gap-2.5">
        {children}
        {(resultCount !== undefined || activeFilterCount > 0) && (
          <div className="ml-auto flex min-h-10 items-center gap-3 px-1 text-[12.5px] text-admin-muted-2">
            {resultCount !== undefined && (
              <span>
                <strong className="font-bold text-admin-ink-soft">{resultCount}</strong> kết quả
              </span>
            )}
            {activeFilterCount > 0 && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="font-semibold text-admin-accent-strong underline-offset-4 hover:underline"
              >
                Xóa {activeFilterCount} bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
