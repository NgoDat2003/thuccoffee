import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { AdminProduct } from '../../../server/src/modules/products/products.admin.schemas';
import ProductForm from '../../components/admin/forms/ProductForm';
import AdminDrawer from '../../components/admin/ui/AdminDrawer';
import AdminTable, { type AdminTableColumn } from '../../components/admin/ui/AdminTable';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAdminProducts, usePublishProduct } from '../../services/admin/products.service';

function ProductsContent() {
  usePageMeta('Quản lý sản phẩm');
  const products = useAdminProducts();
  const publishProduct = usePublishProduct();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('all');
  const [pendingUnpublish, setPendingUnpublish] = useState<AdminProduct>();
  const [pendingBulkHide, setPendingBulkHide] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [visibleProductIds, setVisibleProductIds] = useState<number[]>([]);
  const [drawerProduct, setDrawerProduct] = useState<number | null>();

  const categoryOptions = useMemo(() => {
    const values = new Map<number, string>();
    for (const product of products.data ?? []) for (const category of product.categories) values.set(category.id, category.label);
    return [...values.entries()];
  }, [products.data]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('vi');
    return (products.data ?? []).filter((product) => (
      (!q || product.name.toLocaleLowerCase('vi').includes(q) || product.slug.includes(q))
      && (!categoryId || product.categories.some((category) => String(category.id) === categoryId))
      && (status === 'all' || (status === 'published' ? product.isPublished : !product.isPublished))
    ));
  }, [categoryId, products.data, search, status]);

  const handleVisibleRowsChange = useCallback((rows: AdminProduct[]) => {
    const nextIds = rows.map((product) => product.id);
    setVisibleProductIds((current) => current.length === nextIds.length && current.every((id, index) => id === nextIds[index]) ? current : nextIds);
    setSelectedIds((current) => {
      const next = new Set([...current].filter((id) => nextIds.includes(id)));
      return next.size === current.size && [...next].every((id) => current.has(id)) ? current : next;
    });
  }, []);

  const selectedVisibleIds = visibleProductIds.filter((id) => selectedIds.has(id));
  const allSelected = visibleProductIds.length > 0 && selectedVisibleIds.length === visibleProductIds.length;
  const toggleSelected = (id: number) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = () => setSelectedIds((current) => {
    const next = new Set(current);
    for (const id of visibleProductIds) {
      if (allSelected) next.delete(id); else next.add(id);
    }
    return next;
  });

  function changePublished(product: AdminProduct, next: boolean) {
    if (!next) return setPendingUnpublish(product);
    publishProduct.mutate({ id: product.id, input: { isPublished: true } }, {
      onSuccess: () => showToast('Đã hiển thị sản phẩm.'),
      onError: (error) => showToast(error.message, 'error'),
    });
  }

  async function publishSelected(isPublished: boolean) {
    const results = await Promise.all(selectedVisibleIds.map(async (id) => {
      try {
        await publishProduct.mutateAsync({ id, input: { isPublished } });
        return { id, ok: true as const };
      } catch (error) {
        return { id, ok: false as const, error };
      }
    }));
    const failedIds = results.filter((result) => !result.ok).map((result) => result.id);
    const successCount = results.length - failedIds.length;
    setSelectedIds(new Set(failedIds));
    setPendingBulkHide(false);
    if (failedIds.length > 0) {
      showToast(`Đã cập nhật ${successCount} sản phẩm; ${failedIds.length} sản phẩm lỗi và vẫn được chọn.`, 'error');
    } else {
      showToast(isPublished ? 'Đã hiển thị các sản phẩm đã chọn.' : 'Đã ẩn các sản phẩm đã chọn.');
    }
  }

  const columns: Array<AdminTableColumn<AdminProduct>> = [
    { key: 'select', label: <input type="checkbox" aria-label="Chọn tất cả sản phẩm ở trang hiện tại" checked={allSelected} onChange={toggleAll} />, render: (p) => <input type="checkbox" aria-label={'Chọn ' + p.name} checked={selectedIds.has(p.id)} onChange={() => toggleSelected(p.id)} /> },
    { key: 'product', label: 'Sản phẩm', sortValue: (p) => p.name, render: (p) => <div className="flex min-w-[220px] items-center gap-[13px]"><img src={getImageUrl(p.thumb)} alt="" className="size-[46px] shrink-0 rounded-[9px] object-cover" /><div><p className="text-[14.5px] font-semibold text-admin-ink">{p.name}</p><p className="text-[12px] text-admin-muted-2">{p.slug}</p></div></div> },
    { key: 'price', label: 'Giá', sortValue: (p) => p.price ?? 0, render: (p) => <span className="font-semibold text-admin-ink-soft">{p.price === null ? '—' : p.price.toLocaleString('vi-VN') + 'đ'}</span> },
    { key: 'categories', label: 'Danh mục', render: (p) => p.categories.map((item) => item.label).join(', ') || '—' },
    { key: 'status', label: 'Trạng thái', render: (p) => <div className="flex items-center gap-2.5"><PublishSwitch active={p.isPublished} disabled={publishProduct.isPending} onChange={(next) => changePublished(p, next)} /><StatusBadge active={p.isPublished} /></div> },
    { key: 'sortOrder', label: 'Thứ tự', sortValue: (p) => p.sortOrder, render: (p) => p.sortOrder },
    { key: 'actions', label: 'Thao tác', render: (p) => <div className="flex justify-end gap-4"><button type="button" onClick={() => setDrawerProduct(p.id)} className="text-[13px] font-semibold text-admin-accent-strong">Sửa</button><Link to={'/menu/' + p.slug} target="_blank" className="text-[13px] font-semibold text-admin-muted-2">Xem</Link></div> },
  ];

  return (
    <section>
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p><h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Sản phẩm</h1></div>
        <button type="button" onClick={() => setDrawerProduct(null)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Thêm sản phẩm</button>
      </header>
      <p className="mb-[26px] text-[14px] text-admin-muted">Quản lý nội dung hiển thị trên menu.</p>

      <div className="mb-5 flex flex-wrap gap-2.5">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc slug" className="min-w-[200px] flex-1 border-0 border-b border-admin-border-input bg-transparent px-1 py-[9px] text-[14px] outline-none focus:border-admin-accent-strong" />
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-full border border-admin-border-input bg-transparent px-4 py-[9px] text-[13px]"><option value="">Tất cả danh mục</option>{categoryOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-full border border-admin-border-input bg-transparent px-4 py-[9px] text-[13px]"><option value="all">Tất cả trạng thái</option><option value="published">Đang hiển thị</option><option value="hidden">Đã ẩn</option></select>
      </div>

      {selectedVisibleIds.length > 0 && <div className="mb-4 flex items-center gap-3 rounded-full bg-admin-ink px-5 py-2.5 text-admin-bg"><span className="text-[13px] font-semibold">Đã chọn {selectedVisibleIds.length} sản phẩm</span><button type="button" disabled={publishProduct.isPending} onClick={() => void publishSelected(true)} className="ml-auto rounded-full bg-admin-ink-soft px-3.5 py-1.5 text-[12.5px] font-semibold">Hiển thị</button><button type="button" disabled={publishProduct.isPending} onClick={() => setPendingBulkHide(true)} className="rounded-full bg-admin-ink-soft px-3.5 py-1.5 text-[12.5px] font-semibold">Ẩn</button></div>}

      {products.isError ? <p role="alert" className="py-8 text-admin-danger">{products.error.message}</p> : <AdminTable rows={filteredProducts} columns={columns} rowKey={(p) => p.id} isLoading={products.isPending} emptyText="Không tìm thấy sản phẩm phù hợp." pageSize={10} clientResetKey={`${search}|${categoryId}|${status}`} onVisibleRowsChange={handleVisibleRowsChange} />}

      <AdminDrawer open={drawerProduct !== undefined} title={drawerProduct === null ? 'Thêm sản phẩm' : 'Sửa sản phẩm'} onClose={() => setDrawerProduct(undefined)}>{drawerProduct !== undefined && <ProductForm key={drawerProduct ?? 'new'} productId={drawerProduct ?? undefined} onDone={() => setDrawerProduct(undefined)} />}</AdminDrawer>
      <ConfirmDialog open={Boolean(pendingUnpublish)} title="Ẩn sản phẩm?" message="Sản phẩm sẽ biến mất khỏi menu công khai nhưng dữ liệu vẫn được giữ." confirmLabel="Ẩn sản phẩm" pending={publishProduct.isPending} onCancel={() => setPendingUnpublish(undefined)} onConfirm={() => { if (!pendingUnpublish) return; publishProduct.mutate({ id: pendingUnpublish.id, input: { isPublished: false } }, { onSuccess: () => { setPendingUnpublish(undefined); showToast('Đã ẩn sản phẩm.'); }, onError: (error) => showToast(error.message, 'error') }); }} />
      <ConfirmDialog open={pendingBulkHide} title="Ẩn các sản phẩm đã chọn?" message={`${selectedVisibleIds.length} sản phẩm sẽ biến mất khỏi menu công khai nhưng dữ liệu vẫn được giữ.`} confirmLabel="Ẩn hàng loạt" pending={publishProduct.isPending} onCancel={() => setPendingBulkHide(false)} onConfirm={() => void publishSelected(false)} />
    </section>
  );
}

export default function AdminProductsPage() {
  return <ToastProvider><ProductsContent /></ToastProvider>;
}
