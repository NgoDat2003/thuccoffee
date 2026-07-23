import { useEffect, useRef, type ReactNode } from 'react';

interface AdminDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'default' | 'wide';
  className?: string;
}

export default function AdminDrawer({
  open,
  title,
  onClose,
  children,
  size = 'default',
  className = '',
}: AdminDrawerProps) {
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
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`admin-drawer m-0 ml-auto h-dvh max-h-none max-w-none border-0 bg-admin-bg p-0 text-admin-ink shadow-2xl backdrop:bg-admin-sidebar/60 ${
        size === 'wide' ? 'w-[min(100vw,720px)]' : 'w-[min(100vw,560px)]'
      } ${className}`}
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-admin-border px-6 py-5 sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-admin-accent-strong">Thức Coffee</p>
            <h2 className="mt-1 text-[24px] font-black tracking-[-0.02em]">{title}</h2>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="flex size-11 items-center justify-center rounded-full border border-admin-border text-admin-muted hover:text-admin-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></svg>
          </button>
        </header>
        <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-6 py-7 sm:px-8">{children}</div>
      </div>
    </dialog>
  );
}
