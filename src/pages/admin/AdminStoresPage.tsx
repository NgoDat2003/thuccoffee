import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { AdminStoreListItem } from '../../../server/src/modules/stores/stores.admin.schemas';
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
  useAdminStores,
  usePublishStore,
} from '../../services/admin/stores.service';

function StoresContent() {
  usePageMeta('Quản lý cửa hàng');
  const stores = useAdminStores();
  const publishStore = usePublishStore();
  const { showToast } = useToast();
  const [pendingUnpublish, setPendingUnpublish] = useState<AdminStoreListItem>();

  function changePublished(store: AdminStoreListItem, next: boolean) {
    if (!next) {
      setPendingUnpublish(store);
      return;
    }
    publishStore.mutate(
      { id: store.id, input: { isPublished: true } },
      {
        onSuccess: () => showToast('Đã hiển thị cửa hàng.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  const columns: Array<AdminTableColumn<AdminStoreListItem>> = [
    {
      key: 'image',
      label: 'Ảnh',
      render: (store) => (
        <img src={getImageUrl(store.image)} alt="" className="h-12 w-12 rounded-lg object-cover" />
      ),
    },
    {
      key: 'name',
      label: 'Cửa hàng',
      sortValue: (store) => store.name,
      render: (store) => (
        <div>
          <p className="font-semibold text-stone-900">{store.name}</p>
          <p className="text-xs text-stone-500">{store.slug}</p>
        </div>
      ),
    },
    { key: 'address', label: 'Địa chỉ', render: (store) => store.address },
    { key: 'region', label: 'Khu vực', render: (store) => store.region ?? '—' },
    {
      key: 'gallery',
      label: 'Gallery',
      sortValue: (store) => store.galleryCount,
      render: (store) => store.galleryCount + ' ảnh',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (store) => (
        <div className="flex items-center gap-3">
          <StatusBadge active={store.isPublished} />
          <PublishSwitch
            active={store.isPublished}
            disabled={publishStore.isPending}
            onChange={(next) => changePublished(store, next)}
          />
        </div>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      sortValue: (store) => store.sortOrder,
      render: (store) => store.sortOrder,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (store) => (
        <div className="flex gap-3">
          <Link className="font-medium text-primary" to={'/admin/stores/' + store.id}>Sửa</Link>
          <Link className="text-stone-600" to={'/cua-hang/' + store.slug} target="_blank">Xem</Link>
        </div>
      ),
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Cửa hàng</h1>
          <p className="mt-1 text-sm text-stone-600">Quản lý danh sách và gallery cửa hàng.</p>
        </div>
        <Link to="/admin/stores/new" className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-white">
          Thêm cửa hàng
        </Link>
      </div>

      <div className="mt-6">
        {stores.isError ? (
          <p role="alert" className="py-8 text-red-700">{stores.error.message}</p>
        ) : (
          <AdminTable
            rows={stores.data ?? []}
            columns={columns}
            rowKey={(store) => store.id}
            isLoading={stores.isPending}
            emptyText="Chưa có cửa hàng nào."
          />
        )}
      </div>

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
