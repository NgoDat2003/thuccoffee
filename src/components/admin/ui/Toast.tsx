/* oxlint-disable react/only-export-components -- provider and hook form one small toast API. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastKind = 'success' | 'error';

interface ToastMessage {
  text: string;
  kind: ToastKind;
}

interface ToastContextValue {
  showToast: (text: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage>();
  const showToast = useCallback((text: string, kind: ToastKind = 'success') => setToast({ text, kind }), []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(undefined), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div role="status" className={[
          'fixed right-5 bottom-5 z-50 max-w-sm rounded-full border px-5 py-3 text-[13px] font-semibold shadow-lg',
          toast.kind === 'success'
            ? 'border-admin-ink-soft bg-admin-ink text-admin-bg'
            : 'border-admin-danger bg-admin-danger text-admin-surface',
        ].join(' ')}>{toast.text}</div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider.');
  return value;
}
