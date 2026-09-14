import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center dark:bg-navy-900">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertTriangle size={26} aria-hidden />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong in the studio.</h1>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            An unexpected error interrupted the app. Your saved designs are safe in local storage.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-brand-violet to-brand-violetDark px-5 text-sm font-medium text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition hover:brightness-110"
          >
            <RefreshCw size={15} aria-hidden /> Reload LumaQR Studio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
