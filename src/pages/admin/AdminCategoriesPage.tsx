import { useEffect, useState } from 'react';

import type { AdminCategory } from '../../../server/src/modules/categories/categories.admin.schemas';
import AdminTable, { type AdminTableColumn } from '../../components/admin/ui/AdminTable';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAdminCategories, useUpdateCategory } from '../../services/admin/categories.service';

interface CategoryDraft { label: string; sortOrder: string; }

function CategoriesContent() {
  usePageMeta('Quản lý danh mục');
  const categories = useAdminCategories();
  const updateCategory = useUpdateCategory();
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState<Record<number, CategoryDraft>>({});

  useEffect(() => {
    if (!categories.data) return;
    setDrafts(Object.fromEntries(categories.data.map((category) => [category.id, { label: category.label, sortOrder: String(category.sortOrder) }])));
  }, [categories.data]);

  const updateDraft = (id: number, patch: Partial<CategoryDraft>) => setDrafts((current) => ({ ...current, [id]: { ...(current[id] ?? { label: '', sortOrder: '0' }), ...patch } }));
  const save = (category: AdminCategory) => {
    const draft = drafts[category.id];
    if (!draft) return;
    updateCategory.mutate({ id: category.id, input: { label: draft.label, sortOrder: Number(draft.sortOrder) } }, { onSuccess: () => showToast('Đã cập nhật danh mục.'), onError: (error) => showToast(error.message, 'error') });
  };

  const columns: Array<AdminTableColumn<AdminCategory>> = [
    { key: 'key', label: 'Key cố định', sortValue: (c) => c.key, render: (c) => <code className="rounded-[6px] bg-admin-border-soft px-2 py-1 text-[12px] text-admin-field">{c.key}</code> },
    { key: 'label', label: 'Tên hiển thị', render: (c) => <input value={drafts[c.id]?.label ?? c.label} onChange={(event) => updateDraft(c.id, { label: event.target.value })} className="min-w-48 border-0 border-b border-admin-border-input bg-transparent px-0.5 py-1.5 outline-none focus:border-admin-accent-strong" /> },
    { key: 'sortOrder', label: 'Thứ tự', sortValue: (c) => c.sortOrder, render: (c) => <input type="number" value={drafts[c.id]?.sortOrder ?? String(c.sortOrder)} onChange={(event) => updateDraft(c.id, { sortOrder: event.target.value })} className="w-[60px] border-0 border-b border-admin-border-input bg-transparent px-0.5 py-1.5 outline-none focus:border-admin-accent-strong" /> },
    { key: 'actions', label: 'Thao tác', render: (c) => <div className="text-right"><button type="button" disabled={updateCategory.isPending} onClick={() => save(c)} className="rounded-full bg-admin-ink px-[18px] py-2 text-[13px] font-semibold text-admin-bg disabled:opacity-60">Lưu</button></div> },
  ];

  return (
    <section>
      <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
      <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Danh mục</h1>
      <p className="mt-2 mb-7 text-[14px] text-admin-muted">Key được khóa để không làm hỏng URL và bộ lọc menu công khai.</p>
      {categories.isError ? <p role="alert" className="py-8 text-admin-danger">{categories.error.message}</p> : <AdminTable rows={categories.data ?? []} columns={columns} rowKey={(category) => category.id} isLoading={categories.isPending} />}
    </section>
  );
}

export default function AdminCategoriesPage() {
  return <ToastProvider><CategoriesContent /></ToastProvider>;
}
