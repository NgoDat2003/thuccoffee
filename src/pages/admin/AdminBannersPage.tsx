import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { AdminBanner, BannerType } from '../../../server/src/modules/banners/banners.admin.schemas';
import AdminTable, {
  type AdminTableColumn,
} from '../../components/admin/ui/AdminTable';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useActivateBanner,
  useAdminBanners,
  useDeleteBanner,
} from '../../services/admin/banners.service';

const bannerTabs: Array<{ type: BannerType; label: string }> = [
  { type: 'slider', label: 'Slider trang chủ' },
  { type: 'promotion', label: 'Khuyến mãi' },
  { type: 'right', label: 'Cột phải' },
];

function BannersContent() {
  usePageMeta('Quản lý banner');
  const banners = useAdminBanners();
  const activateBanner = useActivateBanner();
  const deleteBanner = useDeleteBanner();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<BannerType>('slider');
  const [pendingDelete, setPendingDelete] = useState<AdminBanner>();

  const tabBanners = useMemo(
    () => (banners.data ?? []).filter((banner) => banner.type === activeTab),
    [banners.data, activeTab],
  );

  const columns: Array<AdminTableColumn<AdminBanner>> = [
    {
      key: 'image',
      label: 'Ảnh',
      render: (banner) => (
        <img src={getImageUrl(banner.image)} alt={banner.altText} className="h-12 w-24 rounded-lg object-cover" />
      ),
    },
    { key: 'altText', label: 'Mô tả', render: (banner) => banner.altText },
    {
      key: 'linkUrl',
      label: 'Liên kết',
      render: (banner) => banner.linkUrl
        ? <span className="block max-w-48 truncate text-xs text-stone-500">{banner.linkUrl}</span>
        : '—',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (banner) => (
        <div className="flex items-center gap-3">
          <StatusBadge active={banner.isActive} />
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
        </div>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      sortValue: (banner) => banner.sortOrder,
      render: (banner) => banner.sortOrder,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (banner) => (
        <div className="flex gap-3">
          <Link className="font-medium text-primary" to={'/admin/banners/' + banner.id}>Sửa</Link>
          <button type="button" onClick={() => setPendingDelete(banner)} className="text-red-700">Xóa</button>
        </div>
      ),
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Banner</h1>
          <p className="mt-1 text-sm text-stone-600">Quản lý banner theo vị trí hiển thị.</p>
        </div>
        <Link to="/admin/banners/new" className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-white">
          Thêm banner
        </Link>
      </div>

      <div role="tablist" aria-label="Loại banner" className="mt-6 flex gap-2 border-b border-stone-200">
        {bannerTabs.map((tab) => (
          <button
            key={tab.type}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={[
              'px-4 py-2.5 text-sm font-medium',
              activeTab === tab.type
                ? 'border-b-2 border-primary text-primary'
                : 'text-stone-600 hover:text-stone-900',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {banners.isError ? (
          <p role="alert" className="py-8 text-red-700">{banners.error.message}</p>
        ) : (
          <AdminTable
            rows={tabBanners}
            columns={columns}
            rowKey={(banner) => banner.id}
            isLoading={banners.isPending}
            emptyText="Chưa có banner nào ở vị trí này."
          />
        )}
      </div>

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
