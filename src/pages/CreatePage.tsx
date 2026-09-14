import { useCallback, useMemo, useRef, useState } from 'react';
import { History, Keyboard, Redo2, Save, ScanLine, Undo2 } from 'lucide-react';
import type { MockupId } from '../types/design';
import { useDesign } from '../store/designStore';
import { useToast } from '../store/toast';
import { useShortcuts } from '../hooks/useShortcuts';
import { buildPayload } from '../lib/payload';
import { computeScanScore } from '../lib/score';
import { upsertDesign } from '../lib/storage';
import { MOODS } from '../lib/palettes';
import { ContentPanel } from '../components/creator/ContentPanel';
import { MoodBar } from '../components/creator/MoodBar';
import { BrandKitPanel } from '../components/creator/BrandKitPanel';
import { ColorPanel } from '../components/creator/ColorPanel';
import { StylePanel } from '../components/creator/StylePanel';
import { LogoPanel } from '../components/creator/LogoPanel';
import { PreviewPanel } from '../components/creator/PreviewPanel';
import { ExportCard } from '../components/creator/ExportCard';
import { ScanModal } from '../components/creator/ScanModal';
import { Button, IconButton } from '../components/ui/Button';
import { Kbd } from '../components/ui/misc';
import { Tooltip } from '../components/ui/Tooltip';
import { Input } from '../components/ui/Field';

function detectMood(design: { fg: string; bg: string; dotStyle: string }): string | null {
  const m = MOODS.find((m) => m.fg === design.fg && m.bg === design.bg && m.dotStyle === design.dotStyle);
  return m?.id ?? null;
}

export function CreatePage() {
  const { doc, set, undo, redo, canUndo, canRedo, undoDepth } = useDesign();
  const { toast } = useToast();

  const result = useMemo(() => buildPayload(doc), [doc]);
  const score = useMemo(() => computeScanScore(doc, result.payload), [doc, result]);
  const [mockup, setMockup] = useState<MockupId>('none');
  const [activeMood, setActiveMood] = useState<string | null>(() => detectMood(doc.design));
  const [scanOpen, setScanOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const save = useCallback(() => {
    if (!result.payload) {
      toast('error', 'Fix the content errors first — a design needs a valid QR payload.');
      return;
    }
    upsertDesign(doc);
    toast('success', `“${doc.name}” saved to My Designs.`);
  }, [doc, result.payload, toast]);

  const focusExport = useCallback(() => {
    exportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useShortcuts({ onUndo: undo, onRedo: redo, onSave: save, onExport: focusExport });

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
      {/* Header */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="hidden text-lg font-bold text-slate-900 md:block dark:text-white">QR Creator</h1>
          <div className="w-full max-w-xs">
            <label htmlFor="design-name" className="sr-only">
              Design name
            </label>
            <Input
              id="design-name"
              value={doc.name}
              onChange={(e) => set((d) => ({ ...d, name: e.target.value }), { key: 'name' })}
              className="max-w-xs"
              placeholder="Name this design"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Tooltip label="Last 20 changes · Ctrl/Cmd+Z">
            <IconButton label="Undo (Ctrl/Cmd+Z)" disabled={!canUndo} onClick={undo}>
              <Undo2 size={16} aria-hidden />
            </IconButton>
          </Tooltip>
          <Tooltip label="Ctrl/Cmd+Shift+Z">
            <IconButton label="Redo (Ctrl/Cmd+Shift+Z)" disabled={!canRedo} onClick={redo}>
              <Redo2 size={16} aria-hidden />
            </IconButton>
          </Tooltip>
          <Tooltip
            side="bottom"
            label={
              <span className="flex flex-col gap-1.5 text-left">
                <span className="flex items-center gap-1.5">
                  <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + <Kbd>Z</Kbd> undo
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Z</Kbd> redo
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + <Kbd>S</Kbd> save design
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + <Kbd>E</Kbd> jump to export
                </span>
              </span>
            }
          >
            <span className="flex items-center gap-1 rounded-lg bg-black/5 px-2 py-1.5 text-[11px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-300">
              <Keyboard size={13} aria-hidden />
              Shortcuts
              {undoDepth > 0 && <span className="ml-1 rounded-full bg-brand-violet/20 px-1.5 text-[10px] tabular-nums text-brand-violet dark:text-violet-300">{undoDepth}</span>}
            </span>
          </Tooltip>
          <Button size="sm" icon={<Save size={14} aria-hidden />} onClick={save}>
            Save
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(360px,430px)_minmax(0,1fr)] lg:items-start">
        {/* Controls */}
        <div className="order-2 space-y-5 lg:order-1">
          <ContentPanel doc={doc} result={result} />
          <MoodBar activeMood={activeMood} onMood={(id, m) => { setActiveMood(id); setMockup(m); }} />
          <BrandKitPanel doc={doc} />
          <ColorPanel doc={doc} />
          <StylePanel doc={doc} />
          <LogoPanel doc={doc} />
        </div>

        {/* Preview */}
        <div className="order-1 space-y-5 lg:order-2 lg:sticky lg:top-20">
          <PreviewPanel doc={doc} result={result} score={score} mockup={mockup} onMockup={setMockup} onScan={() => setScanOpen(true)} />
          <ExportCard ref={exportRef} doc={doc} result={result} />
        </div>
      </div>

      {/* Mobile bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-navy-900/90">
        <div className="mx-auto flex max-w-lg gap-2">
          <Button className="flex-1" icon={<Save size={15} aria-hidden />} onClick={save}>
            Save
          </Button>
          <Button className="flex-1" variant="secondary" icon={<ScanLine size={15} aria-hidden />} onClick={() => setScanOpen(true)}>
            Scan
          </Button>
          <Button className="flex-1" variant="secondary" icon={<History size={15} aria-hidden />} onClick={focusExport}>
            Export
          </Button>
        </div>
      </div>

      <ScanModal open={scanOpen} onClose={() => setScanOpen(false)} expected={result.payload} />
    </div>
  );
}
