import { useEffect, useMemo, useState } from 'react';

import type { AdminBanner, BannerType } from '../../../server/src/modules/banners/banners.admin.schemas';
import BannerForm from '../../components/admin/forms/BannerForm';
import AdminDrawer from '../../components/admin/ui/AdminDrawer';
import { Pagination } from '../../components/admin/ui/AdminTable';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import { useActivateBanner, useAdminBanners, useDeleteBanner } from '../../services/admin/banners.service';

const pageSize = 10;
const typeLabels: Record<BannerType, string> = { slider: 'Slider trang chủ', promotion: 'Khuyến mãi', right: 'Cột phải' };

function BannersContent() {
  usePageMeta('Quản lý banner');
  const banners = useAdminBanners();
  const activateBanner = useActivateBanner();
  const deleteBanner = useDeleteBanner();
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<AdminBanner>();
  const [drawerBanner, setDrawerBanner] = useState<number | null>();
  const [page, setPage] = useState(1);
  const orderedBanners = useMemo(() => [...(banners.data ?? [])].sort((a, b) => a.type.localeCompare(b.type) || a.sortOrder - b.sortOrder), [banners.data]);
  const totalPages = Math.max(1, Math.ceil(orderedBanners.length / pageSize));
  const visibleBanners = orderedBanners.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  return (
    <section>
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p><h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Banner</h1></div>
        <button type="button" onClick={() => setDrawerBanner(null)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Thêm banner</button>
      </header>
      <p className="mb-7 text-[14px] text-admin-muted">Quản lý ảnh trình chiếu và banner theo vị trí hiển thị.</p>
      {banners.isPending && <p className="py-10 text-center text-admin-muted">Đang tải dữ liệu…</p>}
      {banners.isError && <p role="alert" className="py-8 text-admin-danger">{banners.error.message}</p>}
      {!banners.isPending && !banners.isError && <div>{visibleBanners.map((banner) => (
        <article key={banner.id} className="flex flex-wrap items-center gap-[18px] border-b border-admin-border-soft py-[18px]">
          <img src={getImageUrl(banner.image)} alt={banner.altText} className="h-[66px] w-[150px] shrink-0 rounded-[10px] object-cover" />
          <div className="min-w-[180px] flex-1"><h2 className="text-[14.5px] font-semibold text-admin-ink">{banner.altText}</h2><p className="mt-0.5 text-[12.5px] text-admin-muted-2">{typeLabels[banner.type]} · Thứ tự {banner.sortOrder}</p></div>
          <div className="flex shrink-0 items-center gap-2.5"><PublishSwitch active={banner.isActive} disabled={activateBanner.isPending} onChange={(next) => activateBanner.mutate({ id: banner.id, input: { isActive: next } }, { onSuccess: () => showToast(next ? 'Đã bật banner.' : 'Đã tắt banner.'), onError: (error) => showToast(error.message, 'error') })} /><StatusBadge active={banner.isActive} /></div>
          <button type="button" onClick={() => setDrawerBanner(banner.id)} className="shrink-0 text-[13px] font-semibold text-admin-accent-strong">Sửa</button>
          <button type="button" onClick={() => setPendingDelete(banner)} className="shrink-0 text-[13px] font-semibold text-admin-danger">Xóa</button>
        </article>
      ))}</div>}
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      <AdminDrawer open={drawerBanner !== undefined} title={drawerBanner === null ? 'Thêm banner' : 'Sửa banner'} onClose={() => setDrawerBanner(undefined)}>{drawerBanner !== undefined && <BannerForm key={drawerBanner ?? 'new'} bannerId={drawerBanner ?? undefined} onDone={() => setDrawerBanner(undefined)} />}</AdminDrawer>
      <ConfirmDialog open={Boolean(pendingDelete)} title="Xóa banner?" message="Banner sẽ bị xóa vĩnh viễn — banner không được nội dung nào tham chiếu nên thao tác này an toàn." confirmLabel="Xóa banner" pending={deleteBanner.isPending} onCancel={() => setPendingDelete(undefined)} onConfirm={() => { if (!pendingDelete) return; deleteBanner.mutate(pendingDelete.id, { onSuccess: () => { setPendingDelete(undefined); showToast('Đã xóa banner.'); }, onError: (error) => showToast(error.message, 'error') }); }} />
    </section>
  );
}

export default function AdminBannersPage() {
  return <ToastProvider><BannersContent /></ToastProvider>;
}
