import { Palette } from 'lucide-react';
import type { MockupId } from '../../types/design';
import { MOODS, applyMood } from '../../lib/palettes';
import { useDesign } from '../../store/designStore';
import { Panel } from '../ui/misc';
import { cx } from '../../lib/utils';

export function MoodBar({ activeMood, onMood }: { activeMood: string | null; onMood: (id: string, mockup: MockupId) => void }) {
  const { set } = useDesign();

  return (
    <Panel title="QR Mood" hint="one tap, full look">
      <div className="grid grid-cols-4 gap-1.5">
        {MOODS.map((m) => {
          const active = activeMood === m.id;
          const swatch = m.gradient
            ? `linear-gradient(135deg, ${m.gradient.from}, ${m.gradient.to})`
            : m.fg;
          return (
            <button
              key={m.id}
              onClick={() => {
                set((d) => applyMood(d, m), { key: 'mood', force: true });
                onMood(m.id, m.mockup);
              }}
              aria-pressed={active}
              title={m.blurb}
              className={cx(
                'group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all duration-150',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan',
                active
                  ? 'border-brand-violet/60 bg-brand-violet/10 shadow-[0_0_0_1px_rgba(124,58,237,0.25)]'
                  : 'border-transparent hover:bg-black/5 dark:hover:bg-white/10',
              )}
            >
              <span aria-hidden className="h-2.5 w-8 rounded-full" style={{ background: swatch }} />
              <span
                className={cx(
                  'text-[11px] font-semibold',
                  active ? 'text-brand-violet dark:text-violet-300' : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white',
                )}
              >
                {m.name}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <Palette size={13} aria-hidden />
        Moods set palette, dot style, background and mockup — everything stays fully editable.
      </p>
    </Panel>
  );
}
