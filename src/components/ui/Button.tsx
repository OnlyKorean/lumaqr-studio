import React from 'react';
import { cx } from '../../lib/utils';
import { Spinner } from './misc';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-brand-violet to-brand-violetDark text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:brightness-110 hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)] active:scale-[0.98] disabled:opacity-50 disabled:hover:brightness-100',
  secondary:
    'bg-navy-800 text-slate-100 border border-white/10 hover:bg-navy-700 active:scale-[0.98] dark:bg-white/10 dark:hover:bg-white/15',
  outline:
    'border border-current/30 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]',
  ghost: 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98]',
  danger: 'bg-rose-600/90 text-white hover:bg-rose-600 active:scale-[0.98]',
};

const SIZES: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg',
  sm: 'h-8.5 px-3 text-sm gap-2 rounded-xl',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-2xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        'inline-flex select-none items-center justify-center font-medium transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

export function IconButton({ label, active, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cx(
        'inline-flex size-9 items-center justify-center rounded-xl transition-all duration-150 active:scale-95',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan',
        active
          ? 'bg-brand-violet/20 text-brand-violet dark:text-brand-cyan'
          : 'text-slate-500 hover:bg-black/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
