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

  const showToast = useCallback((text: string, kind: ToastKind = 'success') => {
    setToast({ text, kind });
  }, []);

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
        <div
          role="status"
          className={[
            'fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg',
            toast.kind === 'success' ? 'bg-emerald-700' : 'bg-red-700',
          ].join(' ')}
        >
          {toast.text}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider.');
  return value;
}