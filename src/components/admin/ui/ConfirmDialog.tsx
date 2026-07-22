import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      className="m-auto w-[min(92vw,28rem)] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-stone-900">{title}</h2>
        <p className="mt-2 text-stone-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="rounded-lg border border-stone-300 px-4 py-2.5 font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="rounded-lg bg-red-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Đang xử lý…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}