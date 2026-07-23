import { useEffect, useMemo, useState } from 'react';

import type { AdminStoreListItem } from '../../../server/src/modules/stores/stores.admin.schemas';
import StoreForm from '../../components/admin/forms/StoreForm';
import AdminDrawer from '../../components/admin/ui/AdminDrawer';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAdminStores, usePublishStore } from '../../services/admin/stores.service';

const pageSize = 10;

function StoresContent() {
  usePageMeta('Quản lý cửa hàng');
  const stores = useAdminStores();
  const publishStore = usePublishStore();
  const { showToast } = useToast();
  const [pendingUnpublish, setPendingUnpublish] = useState<AdminStoreListItem>();
  const [drawerStore, setDrawerStore] = useState<number | null>();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((stores.data?.length ?? 0) / pageSize));
  const visibleStores = useMemo(() => (stores.data ?? []).slice((page - 1) * pageSize, page * pageSize), [page, stores.data]);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  function changePublished(store: AdminStoreListItem, next: boolean) {
    if (!next) return setPendingUnpublish(store);
    publishStore.mutate({ id: store.id, input: { isPublished: true } }, { onSuccess: () => showToast('Đã hiển thị cửa hàng.'), onError: (error) => showToast(error.message, 'error') });
  }

  return (
    <section>
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p><h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Cửa hàng</h1></div>
        <button type="button" onClick={() => setDrawerStore(null)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Thêm cửa hàng</button>
      </header>
      <p className="mb-7 text-[14px] text-admin-muted">Quản lý danh sách chi nhánh hiển thị ở trang “Cửa hàng”.</p>

      {stores.isPending && <p className="py-10 text-center text-admin-muted">Đang tải dữ liệu…</p>}
      {stores.isError && <p role="alert" className="py-8 text-admin-danger">{stores.error.message}</p>}
      {!stores.isPending && !stores.isError && (
        <div className="grid gap-7 md:grid-cols-2">
          {visibleStores.map((store) => (
            <article key={store.id} className="flex gap-4 border-b border-admin-border pb-6">
              <img src={getImageUrl(store.image)} alt="" className="h-[104px] w-[140px] shrink-0 rounded-[12px] object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2.5"><h2 className="text-[16px] font-bold text-admin-ink">{store.name}</h2><button type="button" onClick={() => setDrawerStore(store.id)} className="shrink-0 text-[13px] font-semibold text-admin-accent-strong">Sửa</button></div>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.4] text-admin-muted">{store.address}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-2"><span className="text-[12.5px] text-admin-muted-2">{store.phone}</span><span className="text-[12.5px] font-semibold text-admin-success">● {store.hours}</span></div>
                <div className="mt-2.5 flex items-center gap-2.5"><PublishSwitch active={store.isPublished} disabled={publishStore.isPending} onChange={(next) => changePublished(store, next)} /><StatusBadge active={store.isPublished} /></div>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && <nav aria-label="Phân trang cửa hàng" className="mt-6 flex items-center justify-center gap-5 border-t border-admin-border pt-5"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="min-h-11 text-[13px] font-bold disabled:opacity-35">← Trước</button><span className="text-[13px] text-admin-muted-2">Trang {page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="min-h-11 text-[13px] font-bold disabled:opacity-35">Sau →</button></nav>}

      <AdminDrawer open={drawerStore !== undefined} title={drawerStore === null ? 'Thêm cửa hàng' : 'Sửa cửa hàng'} onClose={() => setDrawerStore(undefined)}>{drawerStore !== undefined && <StoreForm key={drawerStore ?? 'new'} storeId={drawerStore ?? undefined} onDone={() => setDrawerStore(undefined)} />}</AdminDrawer>
      <ConfirmDialog open={Boolean(pendingUnpublish)} title="Ẩn cửa hàng?" message="Cửa hàng sẽ biến mất khỏi trang công khai nhưng dữ liệu vẫn được giữ." confirmLabel="Ẩn cửa hàng" pending={publishStore.isPending} onCancel={() => setPendingUnpublish(undefined)} onConfirm={() => { if (!pendingUnpublish) return; publishStore.mutate({ id: pendingUnpublish.id, input: { isPublished: false } }, { onSuccess: () => { setPendingUnpublish(undefined); showToast('Đã ẩn cửa hàng.'); }, onError: (error) => showToast(error.message, 'error') }); }} />
    </section>
  );
}

export default function AdminStoresPage() {
  return <ToastProvider><StoresContent /></ToastProvider>;
}
