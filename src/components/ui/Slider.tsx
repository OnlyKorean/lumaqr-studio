import { useId, useRef } from 'react';
import { cx } from '../../lib/utils';

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  format,
  disabled,
  hint,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Live updates while dragging (no history entry). */
  onChange: (v: number) => void;
  /** Final value on release (pushes one history step). */
  onCommit?: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
  hint?: string;
  className?: string;
}) {
  const id = useId();
  // pointerup is followed by blur on the same interaction — collapse into one history step.
  const lastCommit = useRef<{ v: number; t: number }>({ v: NaN, t: 0 });
  const commit = (v: number) => {
    const now = Date.now();
    if (v === lastCommit.current.v && now - lastCommit.current.t < 800) return;
    lastCommit.current = { v, t: now };
    onCommit?.(v);
  };
  return (
    <div className={cx('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
        <output htmlFor={id} className="rounded-md bg-black/5 px-2 py-0.5 font-mono text-[11px] tabular-nums text-slate-600 dark:bg-white/10 dark:text-slate-200">
          {format ? format(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="luma-range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            commit(Number((e.target as HTMLInputElement).value));
          }
        }}
        onBlur={(e) => commit(Number(e.target.value))}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
