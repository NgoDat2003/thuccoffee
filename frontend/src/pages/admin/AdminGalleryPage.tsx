import { useEffect, useMemo, useState } from 'react';

import type { GalleryItem } from '@server/src/modules/site-gallery/site-gallery.routes';
import { GalleryItemForm } from './GalleryItemForm';
import AdminDrawer from '../../components/admin/ui/AdminDrawer';
import { Pagination } from '../../components/admin/ui/AdminTable';
import AdminTableToolbar from '../../components/admin/ui/AdminTableToolbar';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminGallery,
  useDeleteGalleryItem,
  useUpdateGalleryItem,
} from '../../services/admin/static-pages.service';

const pageSize = 12;
type GalleryStatus = 'all' | 'active' | 'inactive';

function GalleryContent() {
  usePageMeta('Gallery trang chủ');
  const gallery = useAdminGallery();
  const deleteItem = useDeleteGalleryItem();
  const updateItem = useUpdateGalleryItem();
  const { showToast } = useToast();

  const [status, setStatus] = useState<GalleryStatus>('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<GalleryItem>();
  const [drawerItem, setDrawerItem] = useState<number | null>(); // null = create, undefined = closed, number = edit

  const filteredGallery = useMemo(() => {
    return [...(gallery.data ?? [])]
      .filter((item) => (
        status === 'all' || (status === 'active' ? item.isActive : !item.isActive)
      ))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [gallery.data, status]);

  const totalPages = Math.max(1, Math.ceil(filteredGallery.length / pageSize));
  const visibleItems = filteredGallery.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [status]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <section className="w-full min-w-0">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
          <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Gallery</h1>
        </div>
        <button
          type="button"
          onClick={() => setDrawerItem(null)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Thêm ảnh
        </button>
      </header>
      <p className="mb-6 text-[14px] text-admin-muted">
        Quản lý hình ảnh trong phần "Bộ sưu tập của Thức" trên trang chủ công khai.
      </p>

      <AdminTableToolbar
        resultCount={filteredGallery.length}
        activeFilterCount={Number(status !== 'all')}
        onClearFilters={() => setStatus('all')}
      >
        <select
          aria-label="Lọc trạng thái gallery"
          value={status}
          onChange={(event) => setStatus(event.target.value as GalleryStatus)}
          className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiển thị</option>
          <option value="inactive">Đã ẩn (Nháp)</option>
        </select>
      </AdminTableToolbar>

      {gallery.isPending && (
        <div role="status" className="h-56 animate-pulse rounded-[16px] border border-admin-border bg-admin-surface" />
      )}
      {gallery.isError && <p role="alert" className="py-8 text-admin-danger">{gallery.error.message}</p>}
      {!gallery.isPending && !gallery.isError && visibleItems.length === 0 && (
        <div className="rounded-[16px] border border-dashed border-admin-border bg-admin-surface px-6 py-16 text-center text-admin-muted">
          Không có ảnh phù hợp với bộ lọc.
        </div>
      )}

      {!gallery.isPending && !gallery.isError && visibleItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[15px] border border-admin-border bg-admin-surface shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
            >
              <div className="relative overflow-hidden aspect-square bg-admin-border-soft">
                <img src={getImageUrl(item.storageKey)} alt={item.altText ?? ''} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-[13.5px] font-bold text-admin-ink">
                      {item.altText || 'Ảnh Gallery'}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-admin-muted-2">Thứ tự {item.sortOrder}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDrawerItem(item.id)}
                      className="text-[12px] font-bold text-admin-accent-strong hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      className="text-[12px] font-bold text-admin-danger hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-admin-border-soft pt-2">
                  <PublishSwitch
                    active={item.isActive}
                    disabled={updateItem.isPending}
                    onChange={(next) => {
                      updateItem.mutate(
                        {
                          id: item.id,
                          input: {
                            storageKey: item.storageKey,
                            altText: item.altText ?? '',
                            sortOrder: item.sortOrder,
                            isActive: next,
                          },
                        },
                        {
                          onSuccess: () => showToast(next ? 'Đã bật ảnh gallery.' : 'Đã tắt ảnh gallery.'),
                          onError: (error) => showToast(error.message, 'error'),
                        }
                      );
                    }}
                  />
                  <StatusBadge active={item.isActive} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalRows={filteredGallery.length}
        onPageChange={setPage}
      />

      <AdminDrawer
        size="wide"
        open={drawerItem !== undefined}
        title={drawerItem === null ? 'Thêm ảnh' : 'Sửa ảnh'}
        onClose={() => setDrawerItem(undefined)}
      >
        {drawerItem !== undefined && (
          <GalleryItemForm
            key={drawerItem ?? 'new'}
            itemId={drawerItem ?? undefined}
            onDone={() => setDrawerItem(undefined)}
          />
        )}
      </AdminDrawer>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Xóa ảnh khỏi Gallery?"
        message="Ảnh sẽ bị xóa vĩnh viễn khỏi khối Bộ sưu tập trên trang chủ công khai."
        confirmLabel="Xóa ảnh"
        pending={deleteItem.isPending}
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (pendingDelete === undefined) return;
          deleteItem.mutate(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(undefined);
              showToast('Đã xóa ảnh gallery.');
            },
            onError: (error) => showToast(error.message, 'error'),
          });
        }}
      />
    </section>
  );
}

export default function AdminGalleryPage() {
  return (
    <ToastProvider>
      <GalleryContent />
    </ToastProvider>
  );
}
