import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cx } from '../lib/utils';

type Kind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: Kind;
  message: string;
}

interface ToastValue {
  toast: (kind: Kind, message: string) => void;
}

const Ctx = createContext<ToastValue | null>(null);

const ICONS = {
  success: <CheckCircle2 size={17} className="shrink-0 text-brand-lime" aria-hidden />,
  error: <XCircle size={17} className="shrink-0 text-rose-400" aria-hidden />,
  info: <Info size={17} className="shrink-0 text-brand-cyan" aria-hidden />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (kind: Kind, message: string) => {
      const id = idRef.current++;
      setToasts((t) => [...t.slice(-3), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cx(
              'pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm shadow-card backdrop-blur-md',
              'animate-toast-in bg-navy-800/90 border-white/10 text-slate-100',
            )}
          >
            {ICONS[t.kind]}
            <span className="min-w-0 flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-0.5 text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be used inside <ToastProvider>');
  return v;
}
