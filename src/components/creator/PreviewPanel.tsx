import { ScanLine, TriangleAlert } from 'lucide-react';
import type { DesignDoc, MockupId } from '../../types/design';
import type { PayloadResult } from '../../lib/payload';
import { useQRCanvas } from '../../hooks/useQRCanvas';
import { useQRDataUrl } from '../../hooks/useQRDataUrl';
import type { ScanScore } from '../../lib/score';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { EmptyState } from '../ui/misc';
import { ScoreCard } from './ScoreCard';
import { Mockup } from './Mockups';
import { cx } from '../../lib/utils';

const PREVIEW_SIZE = 512;

export function PreviewPanel({
  doc,
  result,
  score,
  mockup,
  onMockup,
  onScan,
}: {
  doc: DesignDoc;
  result: PayloadResult;
  score: ScanScore;
  mockup: MockupId;
  onMockup: (m: MockupId) => void;
  onScan: () => void;
}) {
  const valid = result.payload.length > 0;
  const { ref: canvasRef } = useQRCanvas(doc, result.payload, PREVIEW_SIZE, valid);
  const qrUrl = useQRDataUrl(doc, result.payload, PREVIEW_SIZE, valid);
  const transparent = doc.design.transparentBg;

  return (
    <section className="rounded-2xl border border-black/8 bg-white p-4 shadow-card-light sm:p-5 dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Live preview</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            ariaLabel="Preview mockup"
            size="sm"
            value={mockup}
            onChange={onMockup}
            options={[
              { value: 'none', label: 'Code' },
              { value: 'phone', label: 'Phone' },
              { value: 'card', label: 'Card' },
              { value: 'poster', label: 'Poster' },
              { value: 'menu', label: 'Menu' },
            ]}
          />
          <Button size="sm" variant="secondary" icon={<ScanLine size={14} aria-hidden />} onClick={onScan}>
            Scan Preview
          </Button>
        </div>
      </div>

      {!valid ? (
        <EmptyState
          icon={<TriangleAlert size={26} aria-hidden />}
          title="Waiting for valid content"
          description="Fix the content errors on the left and the QR code will render here instantly."
          className="py-16"
        />
      ) : mockup === 'none' ? (
        <div className="flex justify-center py-2">
          <div
            className={cx(
              'relative overflow-hidden rounded-2xl p-4 transition-shadow',
              transparent ? 'checkerboard' : '',
              'shadow-[0_0_0_1px_rgba(124,58,237,0.12),0_0_40px_-8px_rgba(124,58,237,0.35)]',
            )}
          >
            {/* scan pulse ring */}
            <span aria-hidden className="pointer-events-none absolute inset-2 animate-pulse-ring rounded-xl border-2 border-brand-violet/50" />
            <span aria-hidden className="pointer-events-none absolute inset-x-4 animate-scanline h-10 rounded-full bg-gradient-to-b from-transparent via-brand-cyan/35 to-transparent blur-[2px]" />
            <canvas ref={canvasRef} className="relative z-10 aspect-square w-[min(76vw,380px)] rounded-xl" role="img" aria-label={`QR code for ${doc.name}`} />
          </div>
        </div>
      ) : qrUrl ? (
        <div className="py-2">
          <Mockup kind={mockup} doc={doc} qr={qrUrl} />
          <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">Mockup preview — the QR shown is the exact code that will be exported.</p>
        </div>
      ) : (
        <EmptyState icon={<TriangleAlert size={26} aria-hidden />} title="Rendering mockup…" description="Hold on a second." />
      )}

      <div className="mt-4">
        <ScoreCard score={score} />
      </div>
    </section>
  );
}
