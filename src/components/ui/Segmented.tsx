import React from 'react';
import { cx } from '../../lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

/**
 * Accessible segmented control (radio semantics).
 * `columns` lets callers use a grid layout for icon-heavy option sets.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  columns,
  size = 'md',
  ariaLabel,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
  size?: 'sm' | 'md';
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx(
        'gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/8',
        columns ? 'grid' : 'flex flex-wrap',
        className,
      )}
      style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            title={o.title ?? o.label}
            onClick={() => onChange(o.value)}
            className={cx(
              'flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-2 font-medium transition-all duration-150',
              size === 'sm' ? 'py-1.5 text-[11px]' : 'py-2 text-xs',
              active
                ? 'bg-white text-slate-900 shadow-sm dark:bg-brand-violet dark:text-white'
                : 'text-slate-500 hover:bg-black/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan',
            )}
          >
            {o.icon}
            <span className="truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
