import { RotateCw } from 'lucide-react';
import type { DesignDoc } from '../../types/design';
import { PALETTES, applyPalette } from '../../lib/palettes';
import { useDesign } from '../../store/designStore';
import { ColorField } from '../ui/ColorField';
import { Slider } from '../ui/Slider';
import { Switch } from '../ui/Switch';
import { Panel } from '../ui/misc';
import { InfoTip } from '../ui/Tooltip';
import { cx } from '../../lib/utils';

export function ColorPanel({ doc }: { doc: DesignDoc }) {
  const { set } = useDesign();
  const d = doc.design;
  const g = d.gradient;

  return (
    <Panel title="Colors & Background">
      <div className="grid grid-cols-2 gap-3">
        <ColorField
          label="Dot color"
          value={d.fg}
          disabled={g.enabled}
          onChange={(v) => set((x) => ({ ...x, design: { ...x.design, fg: v } }), { key: 'design.fg' })}
        />
        <ColorField
          label="Background"
          value={d.bg}
          disabled={d.transparentBg}
          onChange={(v) => set((x) => ({ ...x, design: { ...x.design, bg: v } }), { key: 'design.bg' })}
        />
      </div>

      <div className="mt-3 space-y-3">
        <Switch
          label="Transparent background"
          hint="PNG exports keep alpha — best for overlays and glassmorphism"
          checked={d.transparentBg}
          onChange={(v) => set((x) => ({ ...x, design: { ...x.design, transparentBg: v } }), { key: 'design.transparentBg', force: true })}
        />
        <Switch
          label="Gradient dots"
          hint="Two-color linear gradient across the code"
          checked={g.enabled}
          onChange={(v) => set((x) => ({ ...x, design: { ...x.design, gradient: { ...x.design.gradient, enabled: v } } }), { key: 'design.gradient.enabled', force: true })}
        />
      </div>

      {g.enabled && (
        <div className="mt-3 space-y-3 rounded-xl bg-black/[0.03] p-3 dark:bg-white/5">
          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="Gradient from"
              value={g.from}
              onChange={(v) => set((x) => ({ ...x, design: { ...x.design, gradient: { ...x.design.gradient, from: v } } }), { key: 'design.gradient.from' })}
            />
            <ColorField
              label="Gradient to"
              value={g.to}
              onChange={(v) => set((x) => ({ ...x, design: { ...x.design, gradient: { ...x.design.gradient, to: v } } }), { key: 'design.gradient.to' })}
            />
          </div>
          <Slider
            label="Direction"
            value={g.angle}
            min={0}
            max={359}
            onChange={(v) => set((x) => ({ ...x, design: { ...x.design, gradient: { ...x.design.gradient, angle: v } } }), { key: 'design.gradient.angle' })}
            onCommit={(v) => set((x) => ({ ...x, design: { ...x.design, gradient: { ...x.design.gradient, angle: v } } }), { key: 'design.gradient.angle', force: true })}
            format={(v) => `${Math.round(v)}°`}
            className="flex items-center gap-3"
          />
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span
              aria-hidden
              className="inline-block size-4 rounded-full border border-black/10 dark:border-white/20"
              style={{ background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})` }}
            />
            <RotateCw size={12} aria-hidden /> 0° = left → right, 90° = top → bottom
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
          Preset palettes
          <InfoTip text="Applies colors, dot style and — where relevant — gradient. Your logo and content are untouched." />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => set((x) => applyPalette(x, p), { key: 'palette', force: true })}
              className={cx(
                'group flex flex-col items-start gap-1.5 rounded-xl border border-black/8 p-2 text-left transition-all duration-150',
                'hover:border-brand-violet/40 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan',
                'dark:border-white/10 dark:hover:border-brand-violet/60',
              )}
              aria-label={`Apply ${p.name} palette`}
            >
              <span
                aria-hidden
                className="h-7 w-full rounded-lg border border-black/10 dark:border-white/15"
                style={{
                  background: p.gradient
                    ? `linear-gradient(135deg, ${p.gradient.from}, ${p.gradient.to})`
                    : `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)`,
                }}
              />
              <span className="text-[11px] font-medium leading-tight text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
