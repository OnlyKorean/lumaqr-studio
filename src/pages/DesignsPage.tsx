import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Download,
  FileJson,
  Heart,
  Pencil,
  QrCode,
  Search,
  Trash2,
} from 'lucide-react';
import type { DesignDoc } from '../types/design';
import { buildPayload } from '../lib/payload';
import { renderToCanvas, specFromDoc } from '../lib/render';
import {
  exportDesignsJson,
  importDesignsJson,
  loadDesigns,
  removeDesign,
  toggleFavorite,
  upsertDesign,
} from '../lib/storage';
import { downloadPNG } from '../lib/exporters';
import { uid, formatDateTime } from '../lib/utils';
import { useDesign } from '../store/designStore';
import { useToast } from '../store/toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { EmptyState } from '../components/ui/misc';
import { cx } from '../lib/utils';

function MiniQR({ doc }: { doc: DesignDoc }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const payload = useMemo(() => buildPayload(doc).payload, [doc]);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !payload) return;
    renderToCanvas(canvas, specFromDoc(doc, payload, 240, false)).catch(() => {});
  }, [doc, payload]);
  return <canvas ref={ref} className="h-full w-full" role="img" aria-label={`QR preview for ${doc.name}`} />;
}

function TwoStepDelete({ onConfirm, label }: { onConfirm: () => void; label: string }) {
  const [arm, setArm] = useState(false);
  useEffect(() => {
    if (!arm) return;
    const t = window.setTimeout(() => setArm(false), 3000);
    return () => window.clearTimeout(t);
  }, [arm]);
  return (
    <button
      onClick={() => (arm ? onConfirm() : setArm(true))}
      aria-label={arm ? `Confirm ${label}` : label}
      title={arm ? 'Click again to confirm' : label}
      className={cx(
        'flex h-8 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition',
        arm ? 'bg-rose-500 text-white' : 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-500',
      )}
    >
      <Trash2 size={13} aria-hidden /> {arm ? 'Confirm?' : ''}
    </button>
  );
}

export function DesignsPage() {
  const [designs, setDesigns] = useState<DesignDoc[]>(loadDesigns);
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const { load } = useDesign();
  const { toast } = useToast();
  const navigate = useNavigate();
  const importRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return designs
      .filter((d) => (favOnly ? d.favorite : true))
      .filter((d) => {
        if (!q) return true;
        const hay = `${d.name} ${d.type} ${d.content.url} ${d.content.text} ${d.content.wifi.ssid} ${d.content.vcard.firstName} ${d.content.vcard.lastName} ${d.content.event.title}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [designs, query, favOnly]);

  const doEdit = (d: DesignDoc) => {
    load(d);
    navigate('/create');
    toast('info', `Editing “${d.name}”.`);
  };

  const doDownload = async (d: DesignDoc) => {
    try {
      await downloadPNG(d, 1024, d.name, false);
      toast('success', `“${d.name}” downloaded as PNG (1024px).`);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Download failed.');
    }
  };

  const doDuplicate = (d: DesignDoc) => {
    const copy: DesignDoc = { ...d, id: uid(), name: `${d.name} copy`, createdAt: Date.now(), updatedAt: Date.now(), favorite: false };
    setDesigns(upsertDesign(copy));
    toast('success', `Duplicated as “${copy.name}”.`);
  };

  const onImport = async (file: File) => {
    const text = await file.text();
    const res = importDesignsJson(text);
    setDesigns(loadDesigns());
    if (res.added > 0) toast('success', `Imported ${res.added} design${res.added === 1 ? '' : 's'}.`);
    else toast('error', res.errors[0] ?? 'Nothing importable in that file.');
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">My Designs</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {designs.length} saved {designs.length === 1 ? 'design' : 'designs'} · stored only in this browser.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-hidden
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = '';
            }}
          />
          <Button variant="secondary" size="sm" icon={<FileJson size={14} aria-hidden />} onClick={() => importRef.current?.click()}>
            Import JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} aria-hidden />}
            disabled={designs.length === 0}
            onClick={() => {
              const blob = new Blob([exportDesignsJson(designs)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'lumaqr-designs.json';
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 3000);
              toast('success', 'All designs exported as JSON.');
            }}
          >
            Export JSON
          </Button>
        </div>
      </header>

      {designs.length === 0 ? (
        <EmptyState
          icon={<QrCode size={26} aria-hidden />}
          title="No designs yet"
          description="Create your first QR and press Save (or Ctrl/Cmd+S) — it will live here, in this browser."
          action={
            <Link to="/create" className="mt-1">
              <Button icon={<QrCode size={15} aria-hidden />}>Create your first QR</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input aria-label="Search designs" placeholder="Search name, type, content…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
            </div>
            <button
              onClick={() => setFavOnly((f) => !f)}
              aria-pressed={favOnly}
              className={cx(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition',
                favOnly ? 'bg-rose-500/15 text-rose-500' : 'bg-black/5 text-slate-500 hover:text-slate-800 dark:bg-white/10 dark:text-slate-300 dark:hover:text-white',
              )}
            >
              <Heart size={13} aria-hidden fill={favOnly ? 'currentColor' : 'none'} /> Favorites
            </button>
            {filtered.length === 0 && <p className="text-sm text-slate-400">No matches — try a different search.</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => (
              <article key={d.id} className="group flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-card-light transition hover:shadow-card dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none">
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:from-navy-800 dark:to-navy-850">
                  <div className="aspect-square w-full max-w-[130px]">
                    {buildPayload(d).payload ? <MiniQR doc={d} /> : <div className="flex h-full items-center justify-center text-xs font-medium text-slate-400">invalid content</div>}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="min-w-0 truncate text-sm font-bold text-slate-900 dark:text-white">{d.name}</h2>
                    <button
                      onClick={() => setDesigns(toggleFavorite(d.id))}
                      aria-label={d.favorite ? `Remove ${d.name} from favorites` : `Favorite ${d.name}`}
                      aria-pressed={d.favorite}
                      className={cx('shrink-0 rounded-lg p-1 transition', d.favorite ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400 dark:text-slate-600')}
                    >
                      <Heart size={15} aria-hidden fill={d.favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {d.type} · {formatDateTime(d.updatedAt)}
                  </p>
                  <div className="mt-3 flex items-center gap-1 border-t border-black/5 pt-3 dark:border-white/8">
                    <button onClick={() => doEdit(d)} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg text-[11px] font-semibold text-slate-500 transition hover:bg-brand-violet/10 hover:text-brand-violet dark:text-slate-300 dark:hover:text-violet-300" aria-label={`Edit ${d.name}`}>
                      <Pencil size={13} aria-hidden /> Edit
                    </button>
                    <button onClick={() => doDownload(d)} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg text-[11px] font-semibold text-slate-500 transition hover:bg-brand-violet/10 hover:text-brand-violet dark:text-slate-300 dark:hover:text-violet-300" aria-label={`Download ${d.name} as PNG`}>
                      <Download size={13} aria-hidden /> PNG
                    </button>
                    <button onClick={() => doDuplicate(d)} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg text-[11px] font-semibold text-slate-500 transition hover:bg-brand-violet/10 hover:text-brand-violet dark:text-slate-300 dark:hover:text-violet-300" aria-label={`Duplicate ${d.name}`}>
                      <Copy size={13} aria-hidden /> Copy
                    </button>
                    <TwoStepDelete
                      label={`Delete ${d.name}`}
                      onConfirm={() => {
                        setDesigns(removeDesign(d.id));
                        toast('info', `Deleted “${d.name}”.`);
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
