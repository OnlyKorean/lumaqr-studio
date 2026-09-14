import React from 'react';
import { cx } from '../../lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx('animate-spin', className ?? 'size-5')} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Badge({ children, tone = 'neutral', className }: { children: React.ReactNode; tone?: 'neutral' | 'violet' | 'cyan' | 'lime' | 'amber' | 'rose'; className?: string }) {
  const tones = {
    neutral: 'bg-black/5 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    violet: 'bg-brand-violet/15 text-brand-violet dark:text-violet-300',
    cyan: 'bg-brand-cyan/15 text-cyan-700 dark:text-brand-cyan',
    lime: 'bg-brand-lime/15 text-lime-700 dark:text-brand-lime',
    amber: 'bg-amber-400/15 text-amber-700 dark:text-amber-300',
    rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  } as const;
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide', tones[tone], className)}>
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.4rem] items-center justify-center rounded-md border border-black/10 bg-black/5 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600 dark:border-white/15 dark:bg-white/10 dark:text-slate-200">
      {children}
    </kbd>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/10 px-6 py-14 text-center dark:border-white/15', className)}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-violet/10 text-brand-violet dark:text-brand-cyan">{icon}</div>
      <div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-white">{title}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

/** Card section used across the creator workspace. */
export function Panel({
  title,
  hint,
  right,
  children,
  className,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('rounded-2xl border border-black/8 bg-white p-4 shadow-card-light sm:p-5 dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
          {title}
          {hint ? <span className="hidden font-normal normal-case tracking-normal text-slate-400 sm:inline dark:text-slate-500">— {hint}</span> : null}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}
