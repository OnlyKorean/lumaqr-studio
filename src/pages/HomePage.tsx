import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Download,
  Fingerprint,
  GalleryHorizontal,
  Palette,
  QrCode,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useDesign } from '../store/designStore';
import { buildPayload } from '../lib/payload';
import { makeDemoDoc } from '../lib/demo';
import { useQRCanvas } from '../hooks/useQRCanvas';
import { Button } from '../components/ui/Button';
import { cx } from '../lib/utils';

const FEATURES = [
  {
    icon: <QrCode size={19} aria-hidden />,
    title: '8 real content types',
    text: 'URL, text, email, phone, SMS, Wi-Fi, vCard and calendar events — all with validation.',
  },
  {
    icon: <BadgeCheck size={19} aria-hidden />,
    title: 'Smart scanability score',
    text: 'A real 0–100 score from contrast, quiet zone, logo size, error correction and capacity.',
  },
  {
    icon: <Palette size={19} aria-hidden />,
    title: 'QR Moods',
    text: 'Minimal, Luxury, Tech, Playful, Nature, Editorial, Festival, Corporate — one tap, full look.',
  },
  {
    icon: <Fingerprint size={19} aria-hidden />,
    title: 'Smart Brand Mode',
    text: 'One HEX color (or a logo sample) becomes a scan-safe palette with a contrast check.',
  },
  {
    icon: <Camera size={19} aria-hidden />,
    title: 'Honest scan testing',
    text: 'Real in-browser camera decoding with jsQR — or an image test. No fake “scanned” badges.',
  },
  {
    icon: <Download size={19} aria-hidden />,
    title: 'Export anywhere',
    text: 'PNG at 512/1024/2048px, vector SVG, clipboard, Web Share and a print-ready sheet.',
  },
];

const CHIPS = [
  { label: 'Brand-ready', className: 'left-[-14px] top-[18%]', delay: '0ms' },
  { label: 'Scan-safe', className: 'right-[-10px] top-[38%]', delay: '250ms' },
  { label: 'Instant preview', className: 'left-[-20px] bottom-[26%]', delay: '500ms' },
  { label: 'Export in PNG', className: 'right-[-14px] bottom-[12%]', delay: '750ms' },
];

export function HomePage() {
  const { load } = useDesign();
  const navigate = useNavigate();
  const demo = useMemo(() => makeDemoDoc(), []);
  const demoPayload = useMemo(() => buildPayload(demo).payload, [demo]);
  const { ref: heroCanvas } = useQRCanvas(demo, demoPayload, 512, true);

  const openDemo = () => {
    load(makeDemoDoc());
    navigate('/create');
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-violet/20 blur-[120px] dark:bg-brand-violet/25" />
          <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-brand-cyan/15 blur-[100px] dark:bg-brand-cyan/20" />
        </div>

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-violet/30 bg-brand-violet/10 px-3 py-1 text-xs font-semibold text-brand-violet dark:text-violet-300">
              <Sparkles size={12} aria-hidden /> 100% in your browser — no server, no tracking
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] dark:text-white">
              Your link deserves a{' '}
              <span className="bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-violet bg-clip-text text-transparent">
                better code.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Create beautiful, branded and scan-ready QR codes in seconds.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/create">
                <Button size="lg" icon={<Sparkles size={16} aria-hidden />}>
                  Create QR Code
                </Button>
              </Link>
              <Link to="/templates">
                <Button size="lg" variant="secondary" icon={<GalleryHorizontal size={16} aria-hidden />}>
                  Explore Templates
                </Button>
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {['Brand-ready', 'Scan-safe', 'Instant preview', 'Export in PNG'].map((t) => (
                <li key={t} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <BadgeCheck size={15} className="text-brand-lime" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Animated QR showcase */}
          <div className="relative mx-auto w-full max-w-[380px] animate-slide-up [animation-delay:120ms]">
            <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-card backdrop-blur-sm dark:border-white/15 dark:from-white/10 dark:to-transparent">
              <div className="relative overflow-hidden rounded-2xl">
                <span aria-hidden className="pointer-events-none absolute inset-0 animate-pulse-ring rounded-2xl border-2 border-brand-cyan/40" />
                <span aria-hidden className="pointer-events-none absolute inset-x-3 animate-scanline z-10 h-12 bg-gradient-to-b from-transparent via-brand-cyan/40 to-transparent blur-[3px]" />
                <canvas ref={heroCanvas} className="aspect-square w-full rounded-2xl" role="img" aria-label="Animated demo QR code" />
              </div>
              <div className="mt-4 flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{demo.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Tech mood · rounded dots · violet</p>
                </div>
                <Button size="xs" variant="secondary" icon={<ArrowRight size={12} aria-hidden />} onClick={openDemo}>
                  Open
                </Button>
              </div>
            </div>
            {CHIPS.map((c) => (
              <span
                key={c.label}
                className={cx(
                  'absolute z-20 hidden animate-slide-up rounded-full border border-white/15 bg-navy-800/90 px-3 py-1.5 text-[11px] font-semibold text-slate-100 shadow-card backdrop-blur sm:block dark:bg-navy-700/90',
                  c.className,
                )}
                style={{ animationDelay: c.delay }}
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Everything you need. <span className="text-slate-400 dark:text-slate-500">Nothing you don&apos;t.</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="animate-slide-up rounded-2xl border border-black/8 bg-white p-5 shadow-card-light transition hover:-translate-y-0.5 hover:shadow-card sm:hover:shadow-card dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-violet/15 to-brand-cyan/15 text-brand-violet dark:text-brand-cyan">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works mini */}
      <section className="mx-auto max-w-[1400px] px-4 pb-16 lg:px-8">
        <div className="rounded-3xl border border-black/8 bg-gradient-to-br from-navy-900 via-navy-850 to-navy-800 p-8 sm:p-12 dark:border-white/10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">From link to branded code in minutes</h2>
              <ol className="mt-6 space-y-4">
                {[
                  ['Choose your content', 'URL, Wi-Fi, vCard, event and more — validated as you type.'],
                  ['Make it yours', 'Moods, palettes, gradients, logo placement and a real brand kit.'],
                  ['Prove it scans', 'Live scanability score, then a real camera or image decode test.'],
                  ['Export & print', 'PNG, SVG, clipboard, share sheet and a print-ready page.'],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-3.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-violet/30 text-xs font-black text-white">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{t}</p>
                      <p className="text-sm text-slate-400">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-center">
              <Link to="/create">
                <Button size="lg" icon={<Zap size={16} aria-hidden />}>
                  Start creating
                </Button>
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm font-medium text-brand-cyan underline-offset-4 transition hover:underline"
              >
                How it works →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
