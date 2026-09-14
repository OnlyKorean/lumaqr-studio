import React, { useId, useState } from 'react';
import { Info } from 'lucide-react';
import { cx } from '../../lib/utils';

/**
 * CSS-only tooltip: shows on hover and keyboard focus of the trigger.
 * `InfoTip` is the convenience variant: an info icon with a tooltip.
 */
export function Tooltip({ label, children, side = 'top', className }: { label: React.ReactNode; children: React.ReactNode; side?: 'top' | 'bottom'; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-navy-900 px-2.5 py-1.5 text-[11px] font-medium leading-snug text-slate-100 shadow-card transition-all duration-150 dark:bg-slate-700',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function InfoTip({ text, className }: { text: string; className?: string }) {
  const id = useId();
  return (
    <Tooltip label={text}>
      <button
        type="button"
        aria-label={text}
        aria-describedby={id}
        className={cx('rounded-full text-slate-400 transition hover:text-brand-violet dark:hover:text-brand-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan', className)}
        tabIndex={0}
      >
        <Info size={14} aria-hidden />
      </button>
    </Tooltip>
  );
}
