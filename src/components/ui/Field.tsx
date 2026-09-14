import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cx } from '../../lib/utils';

export function Field({
  label,
  error,
  hint,
  children,
  className,
  labelExtra,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (ids: { id: string; describedBy?: string }) => React.ReactNode;
  className?: string;
  labelExtra?: React.ReactNode;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
        {labelExtra}
      </div>
      {children({ id, describedBy })}
      {error ? (
        <p id={errId} role="alert" className="flex items-start gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputBase =
  'w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 dark:bg-navy-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-violet/60 focus:border-brand-violet ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const inputTone = (error?: boolean) =>
  error
    ? 'border-rose-400 dark:border-rose-500/70 focus:ring-rose-400/50'
    : 'border-black/10 dark:border-white/12 hover:border-black/20 dark:hover:border-white/25';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ invalid, className, ...rest }, ref) => (
    <input ref={ref} className={cx(inputBase, inputTone(invalid), className)} {...rest} />
  ),
);
Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ invalid, className, rows = 3, ...rest }, ref) => (
    <textarea ref={ref} rows={rows} className={cx(inputBase, inputTone(invalid), 'resize-y', className)} {...rest} />
  ),
);
TextArea.displayName = 'TextArea';

export function Select({
  invalid,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className={cx(inputBase, inputTone(invalid), 'cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.6rem_center] bg-[length:14px]', className)} style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")" }} {...rest}>
      {children}
    </select>
  );
}
