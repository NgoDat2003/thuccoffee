import { useEffect, useState } from 'react';

import type { AdminCategory } from '../../../server/src/modules/categories/categories.admin.schemas';
import AdminTable, {
  type AdminTableColumn,
} from '../../components/admin/ui/AdminTable';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminCategories,
  useUpdateCategory,
} from '../../services/admin/categories.service';

interface CategoryDraft {
  label: string;
  sortOrder: string;
}

function CategoriesContent() {
  usePageMeta('Quản lý danh mục');
  const categories = useAdminCategories();
  const updateCategory = useUpdateCategory();
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState<Record<number, CategoryDraft>>({});

  useEffect(() => {
    if (!categories.data) return;
    setDrafts(Object.fromEntries(categories.data.map((category) => [
      category.id,
      { label: category.label, sortOrder: String(category.sortOrder) },
    ])));
  }, [categories.data]);

  function updateDraft(id: number, patch: Partial<CategoryDraft>) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] ?? { label: '', sortOrder: '0' }), ...patch },
    }));
  }

  function save(category: AdminCategory) {
    const draft = drafts[category.id];
    if (!draft) return;
    updateCategory.mutate(
      {
        id: category.id,
        input: {
          label: draft.label,
          sortOrder: Number(draft.sortOrder),
        },
      },
      {
        onSuccess: () => showToast('Đã cập nhật danh mục.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  const columns: Array<AdminTableColumn<AdminCategory>> = [
    {
      key: 'key',
      label: 'Key cố định',
      sortValue: (category) => category.key,
      render: (category) => <code className="text-xs">{category.key}</code>,
    },
    {
      key: 'label',
      label: 'Tên hiển thị',
      render: (category) => (
        <input
          value={drafts[category.id]?.label ?? category.label}
          onChange={(event) => updateDraft(category.id, { label: event.target.value })}
          className="min-w-48 rounded-lg border border-stone-300 px-3 py-2"
        />
      ),
    },
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      sortValue: (category) => category.sortOrder,
      render: (category) => (
        <input
          type="number"
          value={drafts[category.id]?.sortOrder ?? String(category.sortOrder)}
          onChange={(event) => updateDraft(category.id, { sortOrder: event.target.value })}
          className="w-24 rounded-lg border border-stone-300 px-3 py-2"
        />
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (category) => (
        <button
          type="button"
          disabled={updateCategory.isPending}
          onClick={() => save(category)}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          Lưu
        </button>
      ),
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <h1 className="text-2xl font-bold text-stone-900">Danh mục</h1>
      <p className="mt-2 text-sm text-stone-600">
        Key được khóa để không làm hỏng URL và bộ lọc menu công khai.
      </p>
      <div className="mt-6">
        {categories.isError ? (
          <p role="alert" className="py-8 text-red-700">{categories.error.message}</p>
        ) : (
          <AdminTable
            rows={categories.data ?? []}
            columns={columns}
            rowKey={(category) => category.id}
            isLoading={categories.isPending}
          />
        )}
      </div>
    </section>
  );
}

export default function AdminCategoriesPage() {
  return <ToastProvider><CategoriesContent /></ToastProvider>;
}