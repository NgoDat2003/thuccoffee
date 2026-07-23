import { useEffect, useState, type FormEvent } from 'react';

import type { AdminCategory } from '../../../server/src/modules/categories/categories.admin.schemas';
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

// Một dòng danh mục: label + thứ tự sửa tại chỗ, nút Lưu chỉ hiện khi có
// thay đổi; key hiển thị dạng chip mono readonly; đếm sản phẩm để admin biết
// vì sao chưa xóa được.
function CategoryRow({ category, onDelete }: {
  category: AdminCategory;
  onDelete: (category: AdminCategory) => void;
}) {
  const { showToast } = useToast();
  const updateCategory = useUpdateCategory();
  const [label, setLabel] = useState(category.label);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));

  useEffect(() => {
    setLabel(category.label);
    setSortOrder(String(category.sortOrder));
  }, [category.label, category.sortOrder]);

  const isDirty = label !== category.label || Number(sortOrder) !== category.sortOrder;

  function save() {
    updateCategory.mutate(
      { id: category.id, input: { label, sortOrder: Number(sortOrder) } },
      {
        onSuccess: () => showToast('Đã lưu danh mục.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-admin-border-soft py-4">
      <div className="min-w-[240px] flex-1">
        <input aria-label={'Tên danh mục ' + category.key} value={label} onChange={(event) => setLabel(event.target.value)} className={inputClass} />
        <p className="mt-1.5 flex items-center gap-2 text-[12px] text-admin-muted-2">
          <code className="rounded-[6px] bg-admin-border-soft px-2 py-0.5 font-mono text-[11.5px] text-admin-muted">/{category.key}</code>
          {category.productCount > 0
            ? category.productCount + ' sản phẩm'
            : 'Chưa có sản phẩm'}
        </p>
      </div>
      <div className="w-24">
        <input aria-label={'Thứ tự ' + category.key} type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className={inputClass} />
      </div>
      <div className="flex w-[140px] justify-end gap-3">
        {isDirty && (
          <button type="button" disabled={updateCategory.isPending} onClick={save} className="rounded-full bg-admin-accent px-4 py-2 text-[13px] font-bold text-white disabled:opacity-60">
            {updateCategory.isPending ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
        <button
          type="button"
          disabled={category.productCount > 0}
          title={category.productCount > 0 ? 'Gỡ sản phẩm khỏi danh mục trước khi xóa' : undefined}
          onClick={() => onDelete(category)}
          className="text-[13px] font-semibold text-admin-danger disabled:cursor-not-allowed disabled:opacity-35"
        >
          Xóa
        </button>
      </div>
    </li>
  );
}

function CategoriesContent() {
  usePageMeta('Quản lý danh mục');
  const categories = useAdminCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const { showToast } = useToast();
  const [newLabel, setNewLabel] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminCategory>();

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

  return (
    <section>
      <header className="mb-2">
        <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Danh mục</h1>
      </header>
      <p className="mb-7 max-w-2xl text-[14px] text-admin-muted">
        Danh mục xuất hiện trên menu công khai. Key sinh tự động từ tên và không
        đổi được sau khi tạo — đổi tên chỉ đổi nhãn hiển thị.
      </p>

      <form onSubmit={handleCreate} className="mb-8 flex max-w-xl gap-3">
        <input
          value={newLabel}
          onChange={(event) => setNewLabel(event.target.value)}
          placeholder="Tên danh mục mới, ví dụ: Món theo mùa"
          className={inputClass}
        />
        <button type="submit" disabled={createCategory.isPending || !newLabel.trim()} className="shrink-0 rounded-full bg-admin-ink px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50">
          {createCategory.isPending ? 'Đang tạo…' : 'Thêm danh mục'}
        </button>
      </form>

      {categories.isPending && <p className="py-10 text-center text-admin-muted">Đang tải danh mục…</p>}
      {categories.isError && <p role="alert" className="py-8 text-admin-danger">{categories.error.message}</p>}
      {categories.data && (
        <ul className="max-w-3xl border-t border-admin-border">
          {categories.data.map((category) => (
            <CategoryRow key={category.id} category={category} onDelete={setPendingDelete} />
          ))}
        </ul>
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
