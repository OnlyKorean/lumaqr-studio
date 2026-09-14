import type { DotStyle, ECLevel, EyeStyle } from '../../types/design';
import type { DesignDoc } from '../../types/design';
import { useDesign } from '../../store/designStore';
import { Segmented } from '../ui/Segmented';
import { Slider } from '../ui/Slider';
import { Panel } from '../ui/misc';
import { Select } from '../ui/Field';
import { InfoTip } from '../ui/Tooltip';

/** Tiny previews for dot styles. */
function DotIcon({ style }: { style: DotStyle }) {
  const s = 16;
  const c = 'currentColor';
  switch (style) {
    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden className="text-current">
          <rect x="2" y="2" width="12" height="12" fill={c} />
        </svg>
      );
    case 'rounded':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          <rect x="2" y="2" width="12" height="12" rx="4" fill={c} />
        </svg>
      );
    case 'soft':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          <rect x="1.5" y="1.5" width="13" height="13" rx="6.5" fill={c} />
        </svg>
      );
    case 'pixel':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          {[2, 9].map((x) => [2, 9].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="5" height="5" fill={c} />))}
        </svg>
      );
    case 'elegant':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="6.5" fill={c} />
        </svg>
      );
  }
}

function EyeIcon({ style }: { style: EyeStyle }) {
  const s = 16;
  const c = 'currentColor';
  switch (style) {
    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          <rect x="2" y="2" width="12" height="12" rx="1" fill={c} />
        </svg>
      );
    case 'rounded':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          <rect x="2" y="2" width="12" height="12" rx="4.5" fill={c} />
        </svg>
      );
    case 'dot':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="6.5" fill={c} />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          <polygon points="8,14 2,3 14,3" fill={c} />
        </svg>
      );
    case 'triangle-rounded':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" aria-hidden>
          <polygon points="8,13 3.2,4 12.8,4" fill={c} stroke={c} strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
      );
  }
}

const EC_DESC: Record<ECLevel, string> = {
  L: 'Low — up to 7% data recovery. Smallest code, most capacity.',
  M: 'Medium — up to 15%. The usual all-rounder.',
  Q: 'Quartile — up to 25%. Good when the code may get worn.',
  H: 'High — up to 30%. Recommended with a center logo or on posters.',
};

export function StylePanel({ doc }: { doc: DesignDoc }) {
  const { set } = useDesign();
  const d = doc.design;

  const radiusDisabled = d.dotStyle === 'square' || d.dotStyle === 'pixel';

  return (
    <Panel title="QR Style" hint="shape & structure">
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
            Dot style <InfoTip text="The shape of the data modules. Square & pixel print crisply; rounded/soft feel modern; elegant is fully circular." />
          </div>
          <Segmented
            ariaLabel="Dot style"
            columns={5}
            size="sm"
            value={d.dotStyle}
            onChange={(v) => set((x) => ({ ...x, design: { ...x.design, dotStyle: v } }), { key: 'design.dotStyle', force: true })}
            options={([
              ['square', 'Square'],
              ['rounded', 'Rounded'],
              ['soft', 'Soft'],
              ['pixel', 'Pixel'],
              ['elegant', 'Elegant'],
            ] as [DotStyle, string][]).map(([v, label]) => ({
              value: v,
              label,
              icon: <DotIcon style={v} />,
            }))}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
            Eye shape <InfoTip text="Style of the three position-finder squares. Square, rounded and dot are the most scan-robust; triangles are decorative and flagged by the scanability score." />
          </div>
          <Segmented
            ariaLabel="Eye shape"
            columns={5}
            size="sm"
            value={d.eyeStyle}
            onChange={(v) => set((x) => ({ ...x, design: { ...x.design, eyeStyle: v } }), { key: 'design.eyeStyle', force: true })}
            options={([
              ['square', 'Square'],
              ['rounded', 'Rounded'],
              ['dot', 'Dot'],
              ['triangle', 'Triangle'],
              ['triangle-rounded', 'R. Triangle'],
            ] as [EyeStyle, string][]).map(([v, label]) => ({
              value: v,
              label,
              icon: <EyeIcon style={v} />,
            }))}
          />
        </div>

        <Slider
          label="Corner & dot radius"
          value={Math.round(d.radius * 100)}
          min={0}
          max={100}
          disabled={radiusDisabled}
          hint={radiusDisabled ? 'Applies to rounded, soft dots and square/rounded eyes.' : 'How rounded the dots and eyes are.'}
          format={(v) => `${v}%`}
          onChange={(v) => set((x) => ({ ...x, design: { ...x.design, radius: v / 100 } }), { key: 'design.radius' })}
          onCommit={(v) => set((x) => ({ ...x, design: { ...x.design, radius: v / 100 } }), { key: 'design.radius', force: true })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="qr-size" className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
              QR size <InfoTip text="Base render resolution. Exports can override it per download." />
            </label>
            <Select
              id="qr-size"
              value={d.size}
              onChange={(e) => set((x) => ({ ...x, design: { ...x.design, size: Number(e.target.value) } }), { key: 'design.size', force: true })}
            >
              <option value={256}>256 px</option>
              <option value={384}>384 px</option>
              <option value={512}>512 px</option>
              <option value={768}>768 px</option>
              <option value={1024}>1024 px</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="qr-ec" className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
              Error correction <InfoTip text={EC_DESC[d.ec]} />
            </label>
            <Select
              id="qr-ec"
              value={d.ec}
              onChange={(e) => set((x) => ({ ...x, design: { ...x.design, ec: e.target.value as ECLevel } }), { key: 'design.ec', force: true })}
            >
              <option value="L">Low</option>
              <option value="M">Medium</option>
              <option value="Q">Quartile</option>
              <option value="H">High</option>
            </Select>
          </div>
        </div>
        <p className="-mt-1 text-xs text-slate-400 dark:text-slate-500">{EC_DESC[d.ec]}</p>

        <Slider
          label="Quiet zone (margin)"
          value={d.margin}
          min={0}
          max={10}
          hint="White space around the code, in modules. 4+ recommended."
          format={(v) => `${v} modules`}
          onChange={(v) => set((x) => ({ ...x, design: { ...x.design, margin: v } }), { key: 'design.margin' })}
          onCommit={(v) => set((x) => ({ ...x, design: { ...x.design, margin: v } }), { key: 'design.margin', force: true })}
        />
      </div>
    </Panel>
  );
}
