import { Link } from 'react-router-dom';
import { BadgeCheck, Camera, Download, PenTool, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

const STEPS = [
  {
    icon: <PenTool size={20} aria-hidden />,
    title: '1 · Choose your content',
    text: 'URL, plain text, email, phone, SMS, Wi-Fi, vCard or a calendar event. Every field is validated as you type, with helpful errors and long-content warnings — the QR updates instantly.',
  },
  {
    icon: <Sparkles size={20} aria-hidden />,
    title: '2 · Make it yours',
    text: 'Pick a QR Mood (Minimal → Festival), a preset palette or your own brand HEX, tune dots, eyes, radius, quiet zone and error correction, and drop a logo in the center.',
  },
  {
    icon: <BadgeCheck size={20} aria-hidden />,
    title: '3 · Trust the score',
    text: 'The scanability score (0–100) is computed from real contrast ratios, quiet-zone width, logo size, error correction and payload capacity. Then verify with a genuine camera or image decode test.',
  },
  {
    icon: <Download size={20} aria-hidden />,
    title: '4 · Export & print',
    text: 'PNG at 512/1024/2048 px, vector SVG, copy to clipboard, Web Share, or a print-ready sheet with the payload printed small beneath the code.',
  },
];

const FAQ = [
  {
    q: 'Do my QR codes get sent to a server?',
    a: 'No. LumaQR Studio runs entirely in your browser. Content, designs, logos and settings live in localStorage on your device. Closing the tab loses nothing — refresh or return any time.',
  },
  {
    q: 'What does the scanability score actually measure?',
    a: 'Six real factors: foreground/background contrast (WCAG luminance), quiet-zone width in modules, logo coverage, error-correction level, how close the payload is to the QR capacity limit, and color safety (including inverted color and gradients). It is an estimate of physical robustness — always finish with a real scan test.',
  },
  {
    q: 'Will my QR code really scan with gradients or colored dots?',
    a: 'Modern scanners handle colored and gradient QR codes well when contrast is high. The score penalizes low-contrast and inverted colors because those are the cases where cheap scanners fail. When in doubt, export and test on multiple phones.',
  },
  {
    q: 'Why no background removal for logos?',
    a: 'Client-side background removal is unreliable, and we rather not pretend. Upload a PNG with alpha, or use the logo plate color to mask the modules behind your mark.',
  },
  {
    q: 'Can I use these commercially?',
    a: 'Yes — designs are generated locally with MIT-licensed components. The QR codes you export are yours.',
  },
];

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">How LumaQR Studio works</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Four steps, zero servers. Everything below is implemented for real — open the creator and try each one.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <section
            key={s.title}
            className="animate-slide-up rounded-2xl border border-black/8 bg-white p-6 shadow-card-light dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-violet/15 to-brand-cyan/15 text-brand-violet dark:text-brand-cyan">
              {s.icon}
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.text}</p>
          </section>
        ))}
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-violet/20 bg-brand-violet/5 p-6 dark:border-brand-violet/30 dark:bg-brand-violet/10">
          <ShieldCheck size={20} className="text-brand-violet dark:text-violet-300" aria-hidden />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Scan-safe by construction</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
            <li>· Real Reed–Solomon error correction (Low → High)</li>
            <li>· Contrast checked with WCAG relative luminance</li>
            <li>· Quiet zone measured in modules, not pixels</li>
            <li>· Logo capped at 32% with High-EC recommendation</li>
            <li>· Scan tests use a real decoder (jsQR) — never fake results</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-card-light dark:border-white/10 dark:bg-navy-850/70 dark:shadow-none">
          <Camera size={20} className="text-brand-cyan" aria-hidden />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Privacy, briefly</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            No accounts, no analytics, no API calls with your content. Designs persist in this browser&apos;s localStorage.
            Export your JSON backup any time from My Designs — the importer sanitizes every field, so untrusted files
            can&apos;t smuggle markup or oversized data into your library.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">FAQ</h2>
        <div className="divide-y divide-black/8 rounded-2xl border border-black/8 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-navy-850/70">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-800 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="text-slate-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10 flex justify-center">
        <Link to="/create">
          <Button size="lg" icon={<Sparkles size={16} aria-hidden />}>
            Create your first QR
          </Button>
        </Link>
      </div>
    </div>
  );
}
