import { useRef, useState } from 'react';
import { ImagePlus, Trash2, TriangleAlert } from 'lucide-react';
import type { DesignDoc } from '../../types/design';
import { useDesign } from '../../store/designStore';
import { useToast } from '../../store/toast';
import { ColorField } from '../ui/ColorField';
import { Slider } from '../ui/Slider';
import { Switch } from '../ui/Switch';
import { Panel } from '../ui/misc';
import { cx } from '../../lib/utils';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/** Downscale to ≤512px and store as a data URL (keeps localStorage light). */
function fileToDataUrl(file: File, max = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('no ctx');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    img.src = url;
  });
}

export function LogoPanel({ doc }: { doc: DesignDoc }) {
  const { set } = useDesign();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const logo = doc.design.logo;

  const handleFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast('error', 'Logo must be PNG, JPG, WebP or SVG.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast('error', 'Logo must be under 2 MB.');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, dataUrl } } }), { key: 'design.logo', force: true });
      toast('success', 'Logo added to the center of your QR.');
    } catch {
      toast('error', 'Could not read that image file.');
    }
  };

  const remove = () => {
    set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, dataUrl: null } } }), { key: 'design.logo', force: true });
    toast('info', 'Logo removed.');
  };

  return (
    <Panel title="Logo" hint="center placement">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      {logo.dataUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-16 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/15">
              <img src={logo.dataUrl} alt="Uploaded logo preview" className="max-h-full max-w-full object-contain" />
            </span>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Logo placed in center</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">PNG · scaled to fit the box</p>
            </div>
            <button
              onClick={remove}
              aria-label="Remove logo"
              className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
            >
              <Trash2 size={16} aria-hidden />
            </button>
          </div>

          <div className="space-y-4">
            <Slider
              label="Logo size"
              value={Math.round(logo.percent * 100)}
              min={10}
              max={32}
              hint="Capped at 32% — beyond that, scanning becomes unreliable."
              format={(v) => `${v}%`}
              onChange={(v) => set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, percent: v / 100 } } }), { key: 'design.logo.percent' })}
              onCommit={(v) => set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, percent: v / 100 } } }), { key: 'design.logo.percent', force: true })}
            />
            <Slider
              label="Logo padding"
              value={Math.round(logo.padding * 100)}
              min={0}
              max={40}
              format={(v) => `${v}%`}
              onChange={(v) => set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, padding: v / 100 } } }), { key: 'design.logo.padding' })}
              onCommit={(v) => set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, padding: v / 100 } } }), { key: 'design.logo.padding', force: true })}
            />
            <Slider
              label="Logo opacity"
              value={Math.round(logo.opacity * 100)}
              min={20}
              max={100}
              format={(v) => `${v}%`}
              onChange={(v) => set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, opacity: v / 100 } } }), { key: 'design.logo.opacity' })}
              onCommit={(v) => set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, opacity: v / 100 } } }), { key: 'design.logo.opacity', force: true })}
            />
            <Switch
              label="Logo background plate"
              hint="Solid plate behind the logo — hides modules underneath"
              checked={logo.backgroundEnabled}
              onChange={(v) => set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, backgroundEnabled: v } } }), { key: 'design.logo.backgroundEnabled', force: true })}
            />
            {logo.backgroundEnabled && (
              <ColorField
                label="Plate color"
                value={logo.background}
                onChange={(v) => set((d) => ({ ...d, design: { ...d.design, logo: { ...d.design.logo, background: v } } }), { key: 'design.logo.background' })}
              />
            )}
          </div>

          {logo.percent > 0.25 && (
            <p className="flex items-start gap-1.5 rounded-lg bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              <TriangleAlert size={13} className="mt-0.5 shrink-0" aria-hidden />
              Logo is large — raise error correction to High for the best scan safety.
            </p>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={cx(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
            dragOver
              ? 'border-brand-violet bg-brand-violet/5'
              : 'border-black/12 hover:border-brand-violet/50 dark:border-white/15 dark:hover:border-brand-violet/60',
          )}
        >
          <ImagePlus size={22} className="text-slate-400 dark:text-slate-500" aria-hidden />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Drop a logo or click to upload</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG, WebP or SVG · max 2 MB</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-1 rounded-lg bg-black/5 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-brand-violet/15 hover:text-brand-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan dark:bg-white/10 dark:text-slate-200 dark:hover:text-brand-cyan"
          >
            Choose file
          </button>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
        No fake background removal: upload a PNG with alpha, or use the plate color. With a logo in place we recommend
        error correction <strong className="font-semibold">High</strong>.
      </p>
    </Panel>
  );
}
