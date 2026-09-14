import { forwardRef, useState } from 'react';
import { Copy, Download, Image as ImageIcon, Printer, Share2, TriangleAlert } from 'lucide-react';
import type { DesignDoc } from '../../types/design';
import type { PayloadResult } from '../../lib/payload';
import { copyPngToClipboard, copyTextToClipboard, downloadPNG, downloadSVG, printQr, shareQr } from '../../lib/exporters';
import { useSettings } from '../../store/settingsStore';
import { useToast } from '../../store/toast';
import { Button, IconButton } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { Input } from '../ui/Field';
import { slugify } from '../../lib/utils';

type Size = 512 | 1024 | 2048;

export const ExportCard = forwardRef<
  HTMLDivElement,
  { doc: DesignDoc; result: PayloadResult }
>(function ExportCard({ doc, result }, ref) {
  const { settings, setExportSize } = useSettings();
  const { toast } = useToast();
  const [filename, setFilename] = useState(doc.name);
  const [transparent, setTransparent] = useState(doc.design.transparentBg);
  const [busy, setBusy] = useState<string | null>(null);

  const valid = result.payload.length > 0;

  // Keep the filename in step with the design name until the user edits it.
  const [touched, setTouched] = useState(false);
  const shownName = touched ? filename : doc.name;

  const run = async (key: string, fn: () => Promise<void> | void) => {
    if (!valid) return;
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(null);
    }
  };

  const size = settings.exportSize;

  return (
    <section ref={ref} id="export-panel" className="rounded-2xl border border-black/8 bg-white p-4 shadow-card-light sm:p-5 dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Export</h2>
        <div className="flex gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/8" role="radiogroup" aria-label="Export size">
          {([512, 1024, 2048] as Size[]).map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={size === s}
              onClick={() => setExportSize(s)}
              className={
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold tabular-nums transition ' +
                (size === s
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-brand-violet dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white')
              }
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="export-name" className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
            File name
          </label>
          <Input
            id="export-name"
            value={shownName}
            spellCheck={false}
            onChange={(e) => {
              setTouched(true);
              setFilename(e.target.value);
            }}
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Exports as {slugify(shownName || 'lumaqr-code')}.png / .svg</p>
        </div>
        <div className="flex flex-col justify-end">
          <Switch
            label="Transparent PNG"
            hint="Keeps alpha in PNG files (SVG keeps it too)"
            checked={transparent}
            onChange={setTransparent}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          loading={busy === 'png'}
          icon={<Download size={14} aria-hidden />}
          disabled={!valid}
          onClick={() =>
            run('png', async () => {
              await downloadPNG(doc, size, shownName, transparent);
              toast('success', `PNG downloaded — ${size}px ${transparent ? '(transparent)' : ''}.`);
            })
          }
        >
          Download PNG
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={busy === 'svg'}
          icon={<Download size={14} aria-hidden />}
          disabled={!valid}
          onClick={() =>
            run('svg', async () => {
              await downloadSVG(doc, size, shownName);
              toast('success', `SVG downloaded — ${size}px vector.`);
            })
          }
        >
          Download SVG
        </Button>
        <IconButton
          label={busy === 'copyimg' ? 'Copying image…' : 'Copy QR image to clipboard'}
          disabled={!valid || busy === 'copyimg'}
          onClick={() =>
            run('copyimg', async () => {
              await copyPngToClipboard(doc, Math.min(size, 1024), transparent);
              toast('success', 'QR image copied to clipboard.');
            })
          }
        >
          {busy === 'copyimg' ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : <ImageIcon size={17} aria-hidden />}
        </IconButton>
        <IconButton
          label="Copy QR content (payload)"
          disabled={!valid}
          onClick={() =>
            run('copytext', async () => {
              await copyTextToClipboard(result.payload);
              toast('success', 'QR content copied to clipboard.');
            })
          }
        >
          <Copy size={16} aria-hidden />
        </IconButton>
        <IconButton
          label="Share via Web Share API"
          disabled={!valid}
          onClick={() =>
            run('share', async () => {
              const outcome = await shareQr(doc, 1024);
              if (outcome === 'shared') toast('success', 'Shared.');
              else if (outcome === 'copied') toast('info', 'Sharing is limited here — QR content copied instead.');
              else toast('info', 'Web Share API is not available in this browser.');
            })
          }
        >
          <Share2 size={16} aria-hidden />
        </IconButton>
        <IconButton
          label="Print-ready sheet"
          disabled={!valid}
          onClick={() =>
            run('print', async () => {
              await printQr(doc, 1024);
              toast('info', 'Print sheet opened — choose your paper and printer.');
            })
          }
        >
          <Printer size={16} aria-hidden />
        </IconButton>
      </div>

      {result.warnings.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
          <TriangleAlert size={13} className="mt-0.5 shrink-0" aria-hidden />
          {result.warnings[0]} — still exportable, test a real scan before large print runs.
        </p>
      )}
    </section>
  );
});
