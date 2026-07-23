import { useState, type FormEvent } from 'react';

import type { AdminSticker } from '../../../server/src/modules/stickers/stickers.admin.schemas';
import AdminTable, { type AdminTableColumn } from '../../components/admin/ui/AdminTable';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminStickers,
  useCreateSticker,
  useDeleteSticker,
} from '../../services/admin/stickers.service';

const inputClass = 'rounded-[10px] border border-admin-border-input bg-admin-surface px-3.5 py-2.5 text-[16px] text-admin-ink outline-none transition-shadow placeholder:text-admin-muted-2 focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15';

// Sticker là badge gắn lên sản phẩm (NEW, HOT…). Tạo/xóa ở đây; gắn vào từng
// sản phẩm trong form sản phẩm.
function StickersContent() {
  usePageMeta('Quản lý sticker');
  const stickers = useAdminStickers();
  const createSticker = useCreateSticker();
  const deleteSticker = useDeleteSticker();
  const { showToast } = useToast();
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#c8102e');
  const [pendingDelete, setPendingDelete] = useState<AdminSticker>();

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!label.trim()) return;
    createSticker.mutate(
      { label: label.trim(), color },
      {
        onSuccess: (created) => {
          setLabel('');
          showToast(`Đã tạo sticker “${created.label}”.`);
        },
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  const columns: Array<AdminTableColumn<AdminSticker>> = [
    {
      key: 'label',
      label: 'Nhãn',
      sortValue: (sticker) => sticker.label,
      render: (sticker) => (
        <span className="text-[14.5px] font-semibold text-admin-ink">{sticker.label}</span>
      ),
    },
    {
      key: 'color',
      label: 'Màu',
      headerClassName: '!text-center',
      cellClassName: 'text-center',
      render: (sticker) => (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full border border-admin-border" style={{ backgroundColor: sticker.color }} aria-hidden="true" />
          <code className="font-mono text-[12px] text-admin-muted">{sticker.color}</code>
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      headerClassName: '!text-center',
      cellClassName: 'text-center',
      render: (sticker) => (
        <button type="button" onClick={() => setPendingDelete(sticker)} className="text-[13px] font-semibold text-admin-danger">
          Xóa
        </button>
      ),
    },
  ];

  return (
    <section className="w-full min-w-0">
      <header className="mb-2">
        <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Sticker</h1>
      </header>
      <p className="mb-7 max-w-2xl text-[14px] text-admin-muted">
        Sticker là badge hiển thị trên sản phẩm (ví dụ NEW, HOT). Sau khi tạo,
        gắn sticker cho từng sản phẩm trong form sản phẩm. Xóa sticker sẽ gỡ
        khỏi mọi sản phẩm đang gắn.
      </p>

      <form onSubmit={handleCreate} className="mb-8 flex flex-wrap items-center gap-3">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Nhãn sticker, ví dụ: NEW"
          className={inputClass + ' max-w-xs'}
        />
        <label className="flex items-center gap-2 text-[14px] text-admin-muted">
          Màu
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            aria-label="Màu sticker"
            className="h-10 w-14 cursor-pointer rounded border border-admin-border-input"
          />
        </label>
        <button type="submit" disabled={createSticker.isPending || !label.trim()} className="shrink-0 rounded-full bg-admin-ink px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50">
          {createSticker.isPending ? 'Đang tạo…' : 'Thêm sticker'}
        </button>
      </form>

      {stickers.isError ? (
        <p role="alert" className="py-8 text-admin-danger">{stickers.error.message}</p>
      ) : (
        <AdminTable
          rows={stickers.data ?? []}
          columns={columns}
          rowKey={(sticker) => sticker.id}
          isLoading={stickers.isPending}
          emptyText="Chưa có sticker nào."
          pageSize={10}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xóa sticker?"
        message={pendingDelete ? `Sticker “${pendingDelete.label}” sẽ bị xóa và gỡ khỏi mọi sản phẩm.` : ''}
        confirmLabel="Xóa sticker"
        pending={deleteSticker.isPending}
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteSticker.mutate(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(undefined);
              showToast('Đã xóa sticker.');
            },
            onError: (error) => showToast(error.message, 'error'),
          });
        }}
      />
    </section>
  );
}

export default function AdminStickersPage() {
  return <ToastProvider><StickersContent /></ToastProvider>;
}
