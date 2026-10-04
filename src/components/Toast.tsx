import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'info' | 'error' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  notify: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-toast-in flex items-center gap-3 rounded-2xl border px-5 py-3.5 backdrop-blur-2xl shadow-2xl min-w-[280px] max-w-sm"
            style={{
              borderColor:
                toast.type === 'success'
                  ? 'rgba(16,185,129,0.4)'
                  : toast.type === 'error'
                  ? 'rgba(239,68,68,0.4)'
                  : toast.type === 'warning'
                  ? 'rgba(245,158,11,0.4)'
                  : 'rgba(6,182,212,0.4)',
              background:
                toast.type === 'success'
                  ? 'rgba(16,185,129,0.12)'
                  : toast.type === 'error'
                  ? 'rgba(239,68,68,0.12)'
                  : toast.type === 'warning'
                  ? 'rgba(245,158,11,0.12)'
                  : 'rgba(6,182,212,0.12)',
            }}
          >
            <span
              className="flex h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background:
                  toast.type === 'success'
                    ? '#10B981'
                    : toast.type === 'error'
                    ? '#EF4444'
                    : toast.type === 'warning'
                    ? '#F59E0B'
                    : '#06B6D4',
                boxShadow: `0 0 12px ${
                  toast.type === 'success'
                    ? '#10B981'
                    : toast.type === 'error'
                    ? '#EF4444'
                    : toast.type === 'warning'
                    ? '#F59E0B'
                    : '#06B6D4'
                }`,
              }}
            />
            <span className="text-sm font-medium text-white/90">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
