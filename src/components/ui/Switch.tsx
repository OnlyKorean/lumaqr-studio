import { useId } from 'react';
import { cx } from '../../lib/utils';

export function Switch({
  label,
  checked,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
        {hint ? <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p> : null}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan',
          checked ? 'bg-brand-violet' : 'bg-black/15 dark:bg-white/15',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          aria-hidden
          className={cx(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-200',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}
