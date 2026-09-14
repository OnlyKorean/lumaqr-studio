import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { TEMPLATES, buildTemplateDoc, type TemplateCategory, type TemplateDef } from '../lib/templates';
import { buildPayload } from '../lib/payload';
import { renderToCanvas, specFromDoc } from '../lib/render';
import { getTplFavs, setTplFavs } from '../lib/storage';
import { useDesign } from '../store/designStore';
import { useToast } from '../store/toast';
import { Button } from '../components/ui/Button';
import { cx } from '../lib/utils';

function TemplateQR({ tpl }: { tpl: TemplateDef }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const doc = useMemo(() => buildTemplateDoc(tpl), [tpl]);
  const payload = useMemo(() => buildPayload(doc).payload, [doc]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !payload) return;
    renderToCanvas(canvas, specFromDoc(doc, payload, 240)).catch(() => {});
  }, [doc, payload]);

  return <canvas ref={ref} className="h-full w-full object-contain" role="img" aria-label={`${tpl.name} QR preview`} />;
}

const CATEGORIES: Array<TemplateCategory | 'All'> = ['All', 'Branding', 'Food & Drink', 'Events', 'Business', 'Digital'];

export function TemplatesPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('All');
  const [favs, setFavs] = useState<string[]>(getTplFavs);
  const { load } = useDesign();
  const { toast } = useToast();
  const navigate = useNavigate();

  const visible = useMemo(() => {
    const list = cat === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);
    return [...list].sort((a, b) => Number(favs.includes(b.id)) - Number(favs.includes(a.id)));
  }, [cat, favs]);

  const toggleFav = (id: string) => {
    setFavs((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      setTplFavs(next);
      return next;
    });
  };

  const useTemplate = (tpl: TemplateDef) => {
    load(buildTemplateDoc(tpl));
    navigate('/create');
    toast('success', `“${tpl.name}” loaded into the creator — make it yours.`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">Templates</h1>
        <p className="mt-1.5 max-w-xl text-sm text-slate-500 dark:text-slate-400">
          Real starting points — each loads working content and a complete design into the creator.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-1.5" role="tablist" aria-label="Template category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={cx(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan',
              cat === c
                ? 'bg-brand-violet text-white shadow-[0_2px_10px_rgba(124,58,237,0.4)]'
                : 'bg-black/5 text-slate-500 hover:bg-black/10 hover:text-slate-800 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((tpl) => {
          const fav = favs.includes(tpl.id);
          return (
            <article
              key={tpl.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-card-light transition hover:-translate-y-0.5 hover:shadow-card dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none"
            >
              <div
                className="relative flex h-44 items-center justify-center p-5"
                style={{ backgroundColor: tpl.design.bg }}
              >
                <div className="h-full w-full max-w-[150px]">
                  <TemplateQR tpl={tpl} />
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:bg-white/15 dark:text-slate-200">
                  {tpl.category}
                </span>
                <button
                  onClick={() => toggleFav(tpl.id)}
                  aria-label={fav ? `Remove ${tpl.name} from favorites` : `Favorite ${tpl.name}`}
                  aria-pressed={fav}
                  className={cx(
                    'absolute right-3 top-3 flex size-8 items-center justify-center rounded-full transition',
                    fav ? 'bg-rose-500/15 text-rose-500' : 'bg-black/10 text-slate-400 hover:text-rose-400 dark:bg-white/15',
                  )}
                >
                  <Heart size={14} aria-hidden fill={fav ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{tpl.name}</h2>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{tpl.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Button size="xs" onClick={() => useTemplate(tpl)}>
                    Use Template
                  </Button>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    <Star size={11} aria-hidden /> {fav ? 'Favorited' : 'Save'}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
