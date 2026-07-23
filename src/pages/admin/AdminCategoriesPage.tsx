import { useMemo, useState, type FormEvent } from 'react';

import type { AdminCategory } from '../../../server/src/modules/categories/categories.admin.schemas';
import AdminTable, { type AdminTableColumn } from '../../components/admin/ui/AdminTable';
import AdminTableToolbar from '../../components/admin/ui/AdminTableToolbar';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../services/admin/categories.service';

const inputClass = 'w-full rounded-[10px] border border-admin-border-input bg-admin-surface px-3.5 py-2.5 text-[16px] text-admin-ink outline-none transition-shadow placeholder:text-admin-muted-2 focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15';
const smallInputClass = 'w-full rounded-[8px] border border-admin-border-input bg-admin-surface px-2.5 py-1.5 text-[14px] text-admin-ink outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/15';

// Danh sách hiển thị dạng bảng đọc-được; chỉ dòng đang bấm Sửa mới đổi sang
// input inline — tránh cảnh cả trang toàn ô nhập dở dang.
function CategoriesContent() {
  usePageMeta('Quản lý danh mục');
  const categories = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { showToast } = useToast();
  const [newLabel, setNewLabel] = useState('');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminCategory>();
  const [editingId, setEditingId] = useState<number>();
  const [draft, setDraft] = useState({ label: '', sortOrder: '0' });

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setDraft({ label: category.label, sortOrder: String(category.sortOrder) });
  }

  function saveEdit(category: AdminCategory) {
    updateCategory.mutate(
      { id: category.id, input: { label: draft.label, sortOrder: Number(draft.sortOrder) } },
      {
        onSuccess: () => {
          setEditingId(undefined);
          showToast('Đã lưu danh mục.');
        },
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newLabel.trim()) return;
    const nextOrder = Math.max(0, ...(categories.data ?? []).map((item) => item.sortOrder + 1));
    createCategory.mutate(
      { label: newLabel.trim(), sortOrder: nextOrder },
      {
        onSuccess: (created) => {
          setNewLabel('');
          showToast(`Đã tạo danh mục “${created.label}” (/${created.key}).`);
        },
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    if (!query) return categories.data ?? [];
    return (categories.data ?? []).filter((category) => (
      category.label.toLocaleLowerCase('vi').includes(query)
      || category.key.toLocaleLowerCase('vi').includes(query)
    ));
  }, [categories.data, search]);

  const columns: Array<AdminTableColumn<AdminCategory>> = [
    {
      key: 'label',
      label: 'Tên danh mục',
      sortValue: (category) => category.label,
      render: (category) => editingId === category.id ? (
        <input
          aria-label={'Tên danh mục ' + category.key}
          value={draft.label}
          onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
          className={smallInputClass + ' min-w-[180px]'}
        />
      ) : (
        <span className="text-[14.5px] font-semibold text-admin-ink">{category.label}</span>
      ),
    },
    {
      key: 'key',
      label: 'Key (URL)',
      headerClassName: '!text-center',
      cellClassName: 'text-center',
      render: (category) => (
        <code className="rounded-[6px] bg-admin-border-soft px-2 py-1 font-mono text-[12px] text-admin-muted">/{category.key}</code>
      ),
    },
    {
      key: 'productCount',
      label: 'Sản phẩm',
      headerClassName: '!text-center',
      cellClassName: 'text-center',
      sortValue: (category) => category.productCount,
      render: (category) => (
        <span className={category.productCount > 0 ? 'font-semibold text-admin-ink-soft' : 'text-admin-muted-2'}>
          {category.productCount}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      headerClassName: '!text-center',
      cellClassName: 'text-center',
      sortValue: (category) => category.sortOrder,
      render: (category) => editingId === category.id ? (
        <input
          aria-label={'Thứ tự ' + category.key}
          type="number"
          value={draft.sortOrder}
          onChange={(event) => setDraft((current) => ({ ...current, sortOrder: event.target.value }))}
          className={smallInputClass + ' w-20'}
        />
      ) : (
        category.sortOrder
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      headerClassName: '!text-center',
      cellClassName: 'text-center',
      render: (category) => (
        <div className="flex justify-center gap-4">
          {editingId === category.id ? (
            <>
              <button type="button" disabled={updateCategory.isPending} onClick={() => saveEdit(category)} className="text-[13px] font-bold text-admin-accent disabled:opacity-50">
                {updateCategory.isPending ? 'Đang lưu…' : 'Lưu'}
              </button>
              <button type="button" onClick={() => setEditingId(undefined)} className="text-[13px] font-semibold text-admin-muted-2">Hủy</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => startEdit(category)} className="text-[13px] font-semibold text-admin-accent-strong">Sửa</button>
              <button
                type="button"
                disabled={category.productCount > 0}
                title={category.productCount > 0 ? 'Gỡ sản phẩm khỏi danh mục trước khi xóa' : undefined}
                onClick={() => setPendingDelete(category)}
                className="text-[13px] font-semibold text-admin-danger disabled:cursor-not-allowed disabled:opacity-35"
              >
                Xóa
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="w-full min-w-0">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
          <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Danh mục</h1>
        </div>
      </header>
      <p className="mb-7 max-w-2xl text-[14px] text-admin-muted">
        Danh mục xuất hiện trên menu công khai. Key sinh tự động từ tên và không
        đổi được sau khi tạo — đổi tên chỉ đổi nhãn hiển thị.
      </p>

      <form onSubmit={handleCreate} className="mb-8 flex gap-3">
        <input
          value={newLabel}
          onChange={(event) => setNewLabel(event.target.value)}
          placeholder="Tên danh mục mới, ví dụ: Món theo mùa"
          className={inputClass + ' max-w-md'}
        />
        <button type="submit" disabled={createCategory.isPending || !newLabel.trim()} className="shrink-0 rounded-full bg-admin-ink px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50">
          {createCategory.isPending ? 'Đang tạo…' : 'Thêm danh mục'}
        </button>
      </form>

      <AdminTableToolbar
        resultCount={filteredCategories.length}
        activeFilterCount={Number(Boolean(search))}
        onClearFilters={() => setSearch('')}
      >
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm tên hoặc key danh mục"
          aria-label="Tìm danh mục"
          className="min-w-[220px] flex-1 rounded-[10px] border border-admin-border-input bg-admin-surface px-3.5 py-2.5 text-[14px] text-admin-ink outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15"
        />
      </AdminTableToolbar>

      {categories.isError ? (
        <p role="alert" className="py-8 text-admin-danger">{categories.error.message}</p>
      ) : (
        <AdminTable
          rows={filteredCategories}
          columns={columns}
          rowKey={(category) => category.id}
          isLoading={categories.isPending}
          emptyText="Không tìm thấy danh mục phù hợp."
          pageSize={10}
          clientResetKey={search}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xóa danh mục?"
        message={pendingDelete ? `Danh mục “${pendingDelete.label}” chưa có sản phẩm nào và sẽ bị xóa vĩnh viễn.` : ''}
        confirmLabel="Xóa danh mục"
        pending={deleteCategory.isPending}
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteCategory.mutate(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(undefined);
              showToast('Đã xóa danh mục.');
            },
            onError: (error) => showToast(error.message, 'error'),
          });
        }}
      />
    </section>
  );
}

export default function AdminCategoriesPage() {
  return <ToastProvider><CategoriesContent /></ToastProvider>;
}
