import { useEffect, useId, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Xác nhận', pending = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={onCancel}
      className="m-auto w-[min(92vw,28rem)] rounded-[14px] border border-admin-border bg-admin-bg p-0 text-admin-ink shadow-2xl backdrop:bg-admin-sidebar/60"
    >
      <div className="p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Xác nhận thao tác</p>
        <h2 id={titleId} className="mt-1 text-[22px] font-black tracking-[-0.02em]">{title}</h2>
        <p id={messageId} className="mt-2 text-[14px] leading-6 text-admin-muted">{message}</p>
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" disabled={pending} onClick={onCancel} className="min-h-11 px-4 text-[13px] font-semibold text-admin-muted disabled:opacity-50">Hủy</button>
          <button type="button" disabled={pending} onClick={onConfirm} className="min-h-11 rounded-full bg-admin-danger px-5 text-[13px] font-bold text-admin-surface disabled:opacity-60">{pending ? 'Đang xử lý…' : confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
