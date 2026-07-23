import { useEffect, useMemo, useState } from 'react';

import type { AdminBanner, BannerType } from '../../../server/src/modules/banners/banners.admin.schemas';
import BannerForm from '../../components/admin/forms/BannerForm';
import AdminDrawer from '../../components/admin/ui/AdminDrawer';
import { Pagination } from '../../components/admin/ui/AdminTable';
import AdminTableToolbar from '../../components/admin/ui/AdminTableToolbar';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import { useActivateBanner, useAdminBanners, useDeleteBanner } from '../../services/admin/banners.service';

const pageSize = 10;
const placementOrder: BannerType[] = ['slider', 'promotion', 'right'];
const placementMeta: Record<BannerType, { label: string; short: string; detail: string; ratio: string }> = {
  slider: {
    label: 'Slider trang chủ',
    short: 'Trình chiếu',
    detail: 'Mọi banner đang bật trong nhóm này đều là một slide của carousel trang chủ.',
    ratio: 'aspect-[21/9]',
  },
  promotion: {
    label: 'Khuyến mãi',
    short: 'Khối ưu đãi',
    detail: 'Trang công khai hiện chỉ lấy banner khuyến mãi đang bật đầu tiên, không phải slide.',
    ratio: 'aspect-[16/7]',
  },
  right: {
    label: 'Cột phải',
    short: 'Vị trí dự phòng',
    detail: 'Loại hợp lệ trong dữ liệu nhưng frontend công khai hiện chưa có vùng render.',
    ratio: 'aspect-[4/3]',
  },
};

type BannerStatus = 'all' | 'active' | 'inactive';

function BannersContent() {
  usePageMeta('Quản lý banner');
  const banners = useAdminBanners();
  const activateBanner = useActivateBanner();
  const deleteBanner = useDeleteBanner();
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<AdminBanner>();
  const [drawerBanner, setDrawerBanner] = useState<number | null>();
  const [type, setType] = useState<'all' | BannerType>('all');
  const [status, setStatus] = useState<BannerStatus>('all');
  const [page, setPage] = useState(1);

  const groupCounts = useMemo(() => Object.fromEntries(
    placementOrder.map((placement) => [
      placement,
      (banners.data ?? []).filter((banner) => banner.type === placement).length,
    ]),
  ) as Record<BannerType, number>, [banners.data]);

  const orderedBanners = useMemo(() => [...(banners.data ?? [])]
    .filter((banner) => (
      (type === 'all' || banner.type === type)
      && (status === 'all' || (status === 'active' ? banner.isActive : !banner.isActive))
    ))
    .sort((a, b) => (
      placementOrder.indexOf(a.type) - placementOrder.indexOf(b.type)
      || a.sortOrder - b.sortOrder
      || a.id - b.id
    )), [banners.data, status, type]);

  const totalPages = Math.max(1, Math.ceil(orderedBanners.length / pageSize));
  const visibleBanners = orderedBanners.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [status, type]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visibleGroups = placementOrder
    .map((placement) => ({
      placement,
      items: visibleBanners.filter((banner) => banner.type === placement),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <section className="w-full min-w-0">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
          <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Banner</h1>
        </div>
        <button type="button" onClick={() => setDrawerBanner(null)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Thêm banner
        </button>
      </header>
      <p className="mb-6 text-[14px] text-admin-muted">Quản lý media theo đúng vị trí sử dụng. Chỉ nhóm Slider mới tạo nhiều slide trên trang chủ.</p>

      <div className="mb-5 grid gap-3 lg:grid-cols-3">
        {placementOrder.map((placement) => {
          const meta = placementMeta[placement];
          return (
            <button
              key={placement}
              type="button"
              onClick={() => setType(type === placement ? 'all' : placement)}
              aria-pressed={type === placement}
              className={`rounded-[14px] border p-4 text-left transition ${type === placement ? 'border-admin-accent bg-admin-accent/5 ring-2 ring-admin-accent/10' : 'border-admin-border bg-admin-surface hover:border-admin-accent/50'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-black uppercase tracking-[0.08em] text-admin-accent-strong">{meta.short}</span>
                <span className="rounded-full bg-admin-border-soft px-2.5 py-1 text-[12px] font-bold text-admin-ink">{groupCounts[placement]}</span>
              </div>
              <h2 className="mt-2 text-[15px] font-black text-admin-ink">{meta.label}</h2>
              <p className="mt-1.5 text-[12px] leading-[1.45] text-admin-muted">{meta.detail}</p>
            </button>
          );
        })}
      </div>

      <AdminTableToolbar
        resultCount={orderedBanners.length}
        activeFilterCount={Number(type !== 'all') + Number(status !== 'all')}
        onClearFilters={() => {
          setType('all');
          setStatus('all');
        }}
      >
        <select aria-label="Lọc vị trí banner" value={type} onChange={(event) => setType(event.target.value as 'all' | BannerType)} className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15">
          <option value="all">Tất cả vị trí</option>
          {placementOrder.map((placement) => <option key={placement} value={placement}>{placementMeta[placement].label}</option>)}
        </select>
        <select aria-label="Lọc trạng thái banner" value={status} onChange={(event) => setStatus(event.target.value as BannerStatus)} className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang bật</option>
          <option value="inactive">Đã tắt</option>
        </select>
      </AdminTableToolbar>

      {banners.isPending && <div role="status" className="h-56 animate-pulse rounded-[16px] border border-admin-border bg-admin-surface" />}
      {banners.isError && <p role="alert" className="py-8 text-admin-danger">{banners.error.message}</p>}
      {!banners.isPending && !banners.isError && visibleBanners.length === 0 && (
        <div className="rounded-[16px] border border-dashed border-admin-border bg-admin-surface px-6 py-16 text-center text-admin-muted">Không có banner phù hợp với bộ lọc.</div>
      )}
      {!banners.isPending && !banners.isError && visibleGroups.map(({ placement, items }) => (
        <section key={placement} aria-labelledby={`banner-group-${placement}`} className="mb-7">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Vị trí</p>
              <h2 id={`banner-group-${placement}`} className="mt-1 text-[19px] font-black text-admin-ink">{placementMeta[placement].label}</h2>
            </div>
            <span className="text-[12px] text-admin-muted-2">{items.length} mục trên trang này</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {items.map((banner) => (
              <article key={banner.id} className="overflow-hidden rounded-[15px] border border-admin-border bg-admin-surface shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <div className={`relative overflow-hidden bg-admin-border-soft ${placementMeta[banner.type].ratio}`}>
                  <img src={getImageUrl(banner.image)} alt={banner.altText} className="h-full w-full object-cover" />
                  <span className="absolute top-3 left-3 rounded-full bg-admin-sidebar/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white backdrop-blur">{placementMeta[banner.type].short}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[14.5px] font-bold text-admin-ink">{banner.altText}</h3>
                      <p className="mt-1 text-[12px] text-admin-muted-2">Thứ tự {banner.sortOrder}{banner.linkUrl ? ' · Có liên kết' : ' · Không liên kết'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setDrawerBanner(banner.id)} className="text-[12.5px] font-bold text-admin-accent-strong">Sửa</button>
                      <button type="button" onClick={() => setPendingDelete(banner)} className="text-[12.5px] font-bold text-admin-danger">Xóa</button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2.5 border-t border-admin-border-soft pt-3">
                    <PublishSwitch
                      active={banner.isActive}
                      disabled={activateBanner.isPending}
                      onChange={(next) => activateBanner.mutate(
                        { id: banner.id, input: { isActive: next } },
                        {
                          onSuccess: () => showToast(next ? 'Đã bật banner.' : 'Đã tắt banner.'),
                          onError: (error) => showToast(error.message, 'error'),
                        },
                      )}
                    />
                    <StatusBadge active={banner.isActive} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <Pagination page={page} totalPages={totalPages} totalRows={orderedBanners.length} onPageChange={setPage} />

      <AdminDrawer size="wide" open={drawerBanner !== undefined} title={drawerBanner === null ? 'Thêm banner' : 'Sửa banner'} onClose={() => setDrawerBanner(undefined)}>
        {drawerBanner !== undefined && <BannerForm key={drawerBanner ?? 'new'} bannerId={drawerBanner ?? undefined} onDone={() => setDrawerBanner(undefined)} />}
      </AdminDrawer>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xóa banner?"
        message="Banner sẽ bị xóa vĩnh viễn — banner không được nội dung nào tham chiếu nên thao tác này an toàn."
        confirmLabel="Xóa banner"
        pending={deleteBanner.isPending}
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteBanner.mutate(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(undefined);
              showToast('Đã xóa banner.');
            },
            onError: (error) => showToast(error.message, 'error'),
          });
        }}
      />
    </section>
  );
}

export default function AdminBannersPage() {
  return <ToastProvider><BannersContent /></ToastProvider>;
}
