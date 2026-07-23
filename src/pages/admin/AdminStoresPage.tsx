import { useEffect, useMemo, useState } from 'react';

import type { AdminStoreListItem } from '../../../server/src/modules/stores/stores.admin.schemas';
import StoreForm from '../../components/admin/forms/StoreForm';
import AdminDrawer from '../../components/admin/ui/AdminDrawer';
import AdminTableToolbar from '../../components/admin/ui/AdminTableToolbar';
import { Pagination } from '../../components/admin/ui/AdminTable';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAdminStores, usePublishStore } from '../../services/admin/stores.service';

const pageSize = 10;
type StoreStatus = 'all' | 'published' | 'hidden';
type StoreSort = 'order' | 'name';

function StoresContent() {
  usePageMeta('Quản lý cửa hàng');
  const stores = useAdminStores();
  const publishStore = usePublishStore();
  const { showToast } = useToast();
  const [pendingUnpublish, setPendingUnpublish] = useState<AdminStoreListItem>();
  const [drawerStore, setDrawerStore] = useState<number | null>();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState<StoreStatus>('all');
  const [sort, setSort] = useState<StoreSort>('order');
  const [page, setPage] = useState(1);

  const regions = useMemo(() => (
    [...new Set((stores.data ?? []).map((store) => store.region).filter((value): value is string => Boolean(value)))]
      .sort((a, b) => a.localeCompare(b, 'vi'))
  ), [stores.data]);

  const filteredStores = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    return [...(stores.data ?? [])]
      .filter((store) => (
        (!query || store.name.toLocaleLowerCase('vi').includes(query) || store.address.toLocaleLowerCase('vi').includes(query))
        && (!region || store.region === region)
        && (status === 'all' || (status === 'published' ? store.isPublished : !store.isPublished))
      ))
      .sort((a, b) => sort === 'name'
        ? a.name.localeCompare(b.name, 'vi') || a.id - b.id
        : a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi'));
  }, [region, search, sort, status, stores.data]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / pageSize));
  const visibleStores = filteredStores.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [region, search, sort, status]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function changePublished(store: AdminStoreListItem, next: boolean) {
    if (!next) return setPendingUnpublish(store);
    publishStore.mutate(
      { id: store.id, input: { isPublished: true } },
      {
        onSuccess: () => showToast('Đã hiển thị cửa hàng.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  const activeFilterCount = Number(Boolean(search)) + Number(Boolean(region)) + Number(status !== 'all');

  return (
    <section className="w-full min-w-0">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
          <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Cửa hàng</h1>
        </div>
        <button type="button" onClick={() => setDrawerStore(null)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Thêm cửa hàng
        </button>
      </header>
      <p className="mb-7 text-[14px] text-admin-muted">Quản lý địa điểm, ảnh đại diện và thư viện ảnh của từng chi nhánh.</p>

      <AdminTableToolbar
        resultCount={filteredStores.length}
        activeFilterCount={activeFilterCount}
        onClearFilters={() => {
          setSearch('');
          setRegion('');
          setStatus('all');
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm tên hoặc địa chỉ"
          aria-label="Tìm cửa hàng"
          className="min-w-[220px] flex-1 rounded-[10px] border border-admin-border-input bg-admin-surface px-3.5 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15"
        />
        <select aria-label="Lọc khu vực" value={region} onChange={(event) => setRegion(event.target.value)} className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15">
          <option value="">Tất cả khu vực</option>
          {regions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select aria-label="Lọc trạng thái cửa hàng" value={status} onChange={(event) => setStatus(event.target.value as StoreStatus)} className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15">
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
        <select aria-label="Sắp xếp cửa hàng" value={sort} onChange={(event) => setSort(event.target.value as StoreSort)} className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15">
          <option value="order">Thứ tự hiển thị</option>
          <option value="name">Tên A–Z</option>
        </select>
      </AdminTableToolbar>

      {stores.isPending && (
        <div role="status" className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-[190px] animate-pulse rounded-[16px] border border-admin-border bg-admin-surface" />)}
        </div>
      )}
      {stores.isError && <p role="alert" className="py-8 text-admin-danger">{stores.error.message}</p>}
      {!stores.isPending && !stores.isError && visibleStores.length === 0 && (
        <div className="rounded-[16px] border border-dashed border-admin-border bg-admin-surface px-6 py-16 text-center text-admin-muted">Không tìm thấy cửa hàng phù hợp.</div>
      )}
      {!stores.isPending && !stores.isError && visibleStores.length > 0 && (
        <div className="grid gap-5 xl:grid-cols-2">
          {visibleStores.map((store) => (
            <article key={store.id} className="group overflow-hidden rounded-[16px] border border-admin-border bg-admin-surface shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="flex h-full min-w-0 flex-col sm:flex-row">
                <img src={getImageUrl(store.image)} alt="" className="aspect-[16/9] w-full shrink-0 object-cover sm:aspect-auto sm:w-[190px]" />
                <div className="flex min-w-0 flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-admin-accent-strong">{store.region || 'Chưa gán khu vực'}</p>
                      <h2 className="mt-1 truncate text-[17px] font-black text-admin-ink">{store.name}</h2>
                    </div>
                    <button type="button" onClick={() => setDrawerStore(store.id)} className="shrink-0 rounded-full border border-admin-border px-3 py-1.5 text-[12px] font-bold text-admin-accent-strong hover:border-admin-accent">Sửa</button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-[1.5] text-admin-muted">{store.address}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-admin-muted-2">
                    <span>{store.phone}</span>
                    <span className="text-right">{store.hours}</span>
                    <span>Thứ tự {store.sortOrder}</span>
                    <span className="text-right">{store.galleryCount} ảnh gallery</span>
                  </div>
                  <div className="mt-auto flex items-center gap-2.5 pt-4">
                    <PublishSwitch active={store.isPublished} disabled={publishStore.isPending} onChange={(next) => changePublished(store, next)} />
                    <StatusBadge active={store.isPublished} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} totalRows={filteredStores.length} onPageChange={setPage} />

      <AdminDrawer size="wide" open={drawerStore !== undefined} title={drawerStore === null ? 'Thêm cửa hàng' : 'Sửa cửa hàng'} onClose={() => setDrawerStore(undefined)}>
        {drawerStore !== undefined && <StoreForm key={drawerStore ?? 'new'} storeId={drawerStore ?? undefined} onDone={() => setDrawerStore(undefined)} />}
      </AdminDrawer>
      <ConfirmDialog
        open={Boolean(pendingUnpublish)}
        title="Ẩn cửa hàng?"
        message="Cửa hàng sẽ biến mất khỏi trang công khai nhưng dữ liệu vẫn được giữ."
        confirmLabel="Ẩn cửa hàng"
        pending={publishStore.isPending}
        onCancel={() => setPendingUnpublish(undefined)}
        onConfirm={() => {
          if (!pendingUnpublish) return;
          publishStore.mutate(
            { id: pendingUnpublish.id, input: { isPublished: false } },
            {
              onSuccess: () => {
                setPendingUnpublish(undefined);
                showToast('Đã ẩn cửa hàng.');
              },
              onError: (error) => showToast(error.message, 'error'),
            },
          );
        }}
      />
    </section>
  );
}

export default function AdminStoresPage() {
  return <ToastProvider><StoresContent /></ToastProvider>;
}
