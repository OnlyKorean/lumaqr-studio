import React, { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { cx, normalizeHex } from '../../lib/utils';

/**
 * Color swatch + native picker + HEX text input.
 * HEX commits on valid blur/Enter and reverts on invalid input.
 */
export function ColorField({
  label,
  value,
  onChange,
  disabled,
  className,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const [text, setText] = useState(value);
  const [touched, setTouched] = useState(false);

  React.useEffect(() => {
    if (!touched) setText(value);
  }, [value, touched]);

  const commit = () => {
    const n = normalizeHex(text);
    if (n) onChange(n);
    else setText(value);
    setTouched(false);
  };

  return (
    <div className={cx('space-y-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <div className={cx('flex items-center gap-2', disabled && 'opacity-50 pointer-events-none')}>
        <span className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-black/10 shadow-sm dark:border-white/15">
          <span aria-hidden className="absolute inset-0" style={{ backgroundColor: value }} />
          <input
            id={id}
            type="color"
            aria-label={`${label} color picker`}
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
            disabled={disabled}
            onChange={(e) => {
              setText(e.target.value.toUpperCase());
              setTouched(false);
              onChange(e.target.value.toUpperCase());
            }}
            className="absolute -inset-2 size-14 cursor-pointer opacity-0"
          />
        </span>
        <input
          type="text"
          aria-label={`${label} HEX value`}
          spellCheck={false}
          maxLength={7}
          value={text}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value);
            setTouched(true);
            // Commit live only on complete input; #rgb expands on blur/Enter.
            const n = e.target.value.length === 7 ? normalizeHex(e.target.value) : null;
            if (n) onChange(n);
          }}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className="w-full flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-800 shadow-sm focus:border-brand-violet focus:outline-none focus:ring-2 focus:ring-brand-violet/60 dark:border-white/12 dark:bg-navy-900/70 dark:text-slate-100"
        />
        <span
          aria-hidden
          className={cx(
            'flex size-5 items-center justify-center rounded-full',
            normalizeHex(text) ? 'bg-brand-lime/20 text-lime-600 dark:text-brand-lime' : 'text-slate-300 dark:text-slate-600',
          )}
        >
          <Check size={12} />
        </span>
      </div>
    </div>
  );
}
