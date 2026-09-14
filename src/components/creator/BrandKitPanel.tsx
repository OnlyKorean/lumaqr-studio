import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Fingerprint, ImagePlus } from 'lucide-react';
import type { DesignDoc } from '../../types/design';
import { applyBrandKit, averageColorFromImage, deriveBrandKit } from '../../lib/palettes';
import { useDesign } from '../../store/designStore';
import { useToast } from '../../store/toast';
import { Panel, Badge } from '../ui/misc';
import { Button } from '../ui/Button';
import { isHex, normalizeHex } from '../../lib/utils';

export function BrandKitPanel({ doc }: { doc: DesignDoc }) {
  const { set } = useDesign();
  const { toast } = useToast();
  const [hex, setHex] = useState(doc.design.fg);
  const [touched, setTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Follow the current dot color until the user edits the field.
  useEffect(() => {
    if (!touched) setHex(doc.design.fg);
  }, [doc.design.fg, touched]);

  const kit = deriveBrandKit(isHex(hex) ? hex : '#7C3AED');

  const onLogoFile = async (file: File) => {
    if (!/^image\//.test(file.type)) {
      toast('error', 'Logo must be an image (PNG, JPG, WebP or SVG).');
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error('unreadable'));
        i.src = url;
      });
      const avg = averageColorFromImage(img);
      setHex(avg);
      setTouched(true);
      toast('info', `Approximate brand color from logo: ${avg} (average sample — enter the exact HEX for precision).`);
    } catch {
      toast('error', 'Could not read that image.');
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const apply = () => {
    const n = normalizeHex(hex);
    if (!n) {
      toast('error', 'Enter a valid HEX color first, e.g. #7C3AED.');
      return;
    }
    set((d) => applyBrandKit(d, deriveBrandKit(n)), { key: 'brandkit', force: true });
    toast('success', 'Brand kit applied — palette, gradient and safe style updated.');
  };

  return (
    <Panel title="Smart Brand" hint="kit from one color">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">Brand HEX</span>
            <input
              type="text"
              value={hex}
              spellCheck={false}
              maxLength={7}
              aria-label="Brand HEX color"
              onChange={(e) => {
                setHex(e.target.value);
                setTouched(true);
              }}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-800 shadow-sm focus:border-brand-violet focus:outline-none focus:ring-2 focus:ring-brand-violet/60 dark:border-white/12 dark:bg-navy-900/70 dark:text-slate-100"
            />
          </label>
          <input
            type="color"
            aria-label="Brand color picker"
            value={isHex(hex) ? hex : '#7C3AED'}
            onChange={(e) => {
              setHex(e.target.value.toUpperCase());
              setTouched(true);
            }}
            className="h-[38px] w-11 cursor-pointer rounded-xl border border-black/10 bg-transparent p-1 dark:border-white/12"
          />
          <Button variant="secondary" size="sm" icon={<ImagePlus size={14} aria-hidden />} onClick={() => fileRef.current?.click()}>
            From logo
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            aria-hidden
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onLogoFile(f);
              e.target.value = '';
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg px-2.5 py-1.5 text-xs font-semibold" style={{ backgroundColor: kit.fg }}>
            <span className="sr-only">Dots</span>
            <span style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.35)' }}>dots {kit.fg}</span>
          </span>
          <span className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/15 dark:text-slate-200" style={{ backgroundColor: kit.bg }}>
            bg {kit.bg}
          </span>
          <span
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${kit.gradient.from}, ${kit.gradient.to})` }}
          >
            gradient
          </span>
          <Badge tone={kit.contrastFgBg >= 4.5 ? 'lime' : 'amber'}>
            <BadgeCheck size={12} aria-hidden /> {kit.contrastFgBg}:1 contrast
          </Badge>
        </div>

        <Button size="sm" icon={<Fingerprint size={14} aria-hidden />} onClick={apply}>
          Apply Brand Kit
        </Button>

        <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
          Automatic palette extraction from logos is unreliable, so we use your entered HEX as the source of truth.
          'From logo' samples an <em>approximate average color</em> to get you close — refine it with the exact HEX.
        </p>
      </div>
    </Panel>
  );
}
