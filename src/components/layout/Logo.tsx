export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="luma-logo-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill="url(#luma-logo-g)" />
      <rect x="8" y="8" width="7" height="7" rx="2" fill="#FFFFFF" />
      <rect x="17.5" y="8" width="7" height="7" rx="2" fill="#FFFFFF" opacity="0.85" />
      <rect x="8" y="17.5" width="7" height="7" rx="2" fill="#FFFFFF" opacity="0.85" />
      <rect x="17.5" y="17.5" width="3.4" height="3.4" rx="1" fill="#FFFFFF" />
      <rect x="22.2" y="17.5" width="2.4" height="2.4" rx="0.7" fill="#FFFFFF" />
      <rect x="17.5" y="22.2" width="2.4" height="2.4" rx="0.7" fill="#FFFFFF" />
      <rect x="22.2" y="22.2" width="3.4" height="3.4" rx="1" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={compact ? 26 : 30} />
      {!compact && (
        <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
          LumaQR <span className="bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent">Studio</span>
        </span>
      )}
    </span>
  );
}
