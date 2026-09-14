import { useState } from 'react';
import { Database, Eraser, Moon, Palette, RotateCcw, Sun } from 'lucide-react';
import { useSettings } from '../store/settingsStore';
import { useDesign } from '../store/designStore';
import { useToast } from '../store/toast';
import { clearAllData, loadDesigns, setTheme as persistTheme, storageBytes } from '../lib/storage';
import { makeDemoDoc } from '../lib/demo';
import { formatBytes } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { Panel } from '../components/ui/misc';
import { cx } from '../lib/utils';

function ConfirmButton({ label, confirmLabel, onConfirm, tone = 'danger', icon }: { label: string; confirmLabel: string; onConfirm: () => void; tone?: 'danger' | 'secondary'; icon?: React.ReactNode }) {
  const [arm, setArm] = useState(false);
  return (
    <Button
      size="sm"
      variant={arm ? 'danger' : tone === 'secondary' ? 'secondary' : 'outline'}
      icon={arm ? undefined : icon}
      onClick={() => {
        if (arm) {
          onConfirm();
          setArm(false);
        } else setArm(true);
      }}
      onBlur={() => setArm(false)}
      className={arm ? '' : 'min-w-[10rem]'}
      aria-pressed={arm}
    >
      {arm ? confirmLabel : label}
    </Button>
  );
}

export function SettingsPage() {
  const { settings, setTheme, setExportSize } = useSettings();
  const { load } = useDesign();
  const { toast } = useToast();
  const [bytes, setBytes] = useState(storageBytes);
  const [count, setCount] = useState(loadDesigns().length);

  const refresh = () => {
    setBytes(storageBytes());
    setCount(loadDesigns().length);
  };

  const pickTheme = (t: 'dark' | 'light') => {
    setTheme(t);
    persistTheme(t);
  };

  return (
    <div className="mx-auto max-w-[880px] px-4 py-10 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">Settings</h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Preferences live in this browser only.</p>
      </header>

      <div className="space-y-5">
        <Panel title="Appearance">
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Theme">
            {(
              [
                { id: 'dark', label: 'Dark', icon: <Moon size={15} aria-hidden />, desc: 'Deep navy, the house style' },
                { id: 'light', label: 'Light', icon: <Sun size={15} aria-hidden />, desc: 'Soft off-white for daylight' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={settings.theme === t.id}
                onClick={() => pickTheme(t.id)}
                className={cx(
                  'flex items-center gap-3 rounded-xl border p-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan',
                  settings.theme === t.id
                    ? 'border-brand-violet/60 bg-brand-violet/10'
                    : 'border-black/10 hover:border-brand-violet/40 dark:border-white/12 dark:hover:border-brand-violet/50',
                )}
              >
                <span
                  className={cx(
                    'flex size-9 items-center justify-center rounded-lg',
                    t.id === 'dark' ? 'bg-navy-900 text-brand-cyan' : 'bg-slate-100 text-amber-500',
                  )}
                >
                  {t.icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-white">{t.label}</span>
                  <span className="block text-xs text-slate-400 dark:text-slate-500">{t.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Export defaults">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="default-size" className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
              Default export size
            </label>
            <Select id="default-size" value={settings.exportSize} onChange={(e) => setExportSize(Number(e.target.value) as 512 | 1024 | 2048)} className="max-w-[140px]">
              <option value={512}>512 px — web & social</option>
              <option value={1024}>1024 px — recommended</option>
              <option value={2048}>2048 px — large print</option>
            </Select>
          </div>
        </Panel>

        <Panel title="Data & privacy" hint={`${count} design${count === 1 ? '' : 's'} · ${formatBytes(bytes)} in local storage`}>
          <div className="flex flex-wrap gap-2">
            <ConfirmButton
              label="Reset demo design"
              confirmLabel="Replace working design?"
              icon={<RotateCcw size={14} aria-hidden />}
              tone="secondary"
              onConfirm={() => {
                load(makeDemoDoc());
                toast('info', 'Demo design loaded (LumaQR Demo).');
              }}
            />
            <ConfirmButton
              label="Clear all designs"
              confirmLabel="Delete all designs?"
              icon={<Eraser size={14} aria-hidden />}
              onConfirm={() => {
                clearAllData();
                refresh();
                toast('success', 'All designs and settings cleared.');
              }}
            />
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
            <Database size={13} className="mt-0.5 shrink-0" aria-hidden />
            Everything is stored in this browser&apos;s localStorage under lumaqr.* keys. Clearing site data removes
            it completely. Use Export JSON in My Designs for a portable backup.
          </p>
        </Panel>

        <Panel title="About">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-400 dark:text-slate-500">Version</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">1.0.1</dd>
            <dt className="text-slate-400 dark:text-slate-500">Stack</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">React 18 · TypeScript · Vite · Tailwind</dd>
            <dt className="text-slate-400 dark:text-slate-500">QR engine</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">qrcode core + custom canvas/SVG renderer</dd>
            <dt className="text-slate-400 dark:text-slate-500">Scanner</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">jsQR (camera & image, on-device)</dd>
          </dl>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Palette size={13} aria-hidden /> Make it scan. Make it yours.
          </p>
        </Panel>
      </div>
    </div>
  );
}
