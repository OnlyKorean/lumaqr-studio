import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import type { ScanScore } from '../../lib/score';
import { cx } from '../../lib/utils';

const COLORS = {
  Excellent: 'text-brand-lime dark:text-brand-lime',
  Good: 'text-brand-cyan dark:text-brand-cyan',
  'Needs improvement': 'text-amber-500 dark:text-amber-400',
} as const;

const RING = {
  Excellent: '#A3E635',
  Good: '#22D3EE',
  'Needs improvement': '#F59E0B',
} as const;

export function ScoreCard({ score }: { score: ScanScore }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  const off = C * (1 - score.score / 100);

  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-card-light dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none">
      <div className="flex items-center gap-4">
        <div className="relative size-[76px] shrink-0" role="img" aria-label={`Scanability score ${score.score} out of 100 — ${score.label}`}>
          <svg viewBox="0 0 76 76" className="size-full -rotate-90">
            <circle cx="38" cy="38" r={R} fill="none" strokeWidth="7" className="stroke-black/8 dark:stroke-white/10" />
            <circle
              cx="38"
              cy="38"
              r={R}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              stroke={RING[score.label]}
              strokeDasharray={C}
              strokeDashoffset={off}
              style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.4,0,0.2,1), stroke 300ms' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-black tabular-nums text-slate-900 dark:text-white">
            {score.score}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Scanability score</p>
          <p className={cx('text-base font-bold', COLORS[score.label])}>{score.label}</p>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Contrast · quiet zone · logo · error correction · capacity</p>
        </div>
      </div>

      {score.issues.length > 0 && (
        <ul className="mt-3 space-y-1.5" aria-live="polite">
          {score.issues.map((i) => (
            <li key={i.text} className="flex items-start gap-2 text-xs leading-snug text-slate-600 dark:text-slate-300">
              {i.level === 'good' && <CheckCircle2 size={14} className="mt-px shrink-0 text-brand-lime" aria-hidden />}
              {i.level === 'warn' && <TriangleAlert size={14} className="mt-px shrink-0 text-amber-500" aria-hidden />}
              {i.level === 'bad' && <XCircle size={14} className="mt-px shrink-0 text-rose-500" aria-hidden />}
              {i.text}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 flex items-center gap-1.5 border-t border-black/5 pt-2.5 text-[11px] text-slate-400 dark:border-white/8 dark:text-slate-500">
        <Info size={12} aria-hidden />
        Estimate from design physics — verify with a real scan via Scan Preview.
      </p>
    </div>
  );
}
