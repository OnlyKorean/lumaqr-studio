import type { DesignDoc, MockupId } from '../../types/design';

/**
 * CSS mockup compositions. The QR is passed as a rendered data URL so the
 * same pixels appear in every frame.
 */

function QrImg({ src, name, className }: { src: string; name: string; className?: string }) {
  return <img src={src} alt={`${name} QR code preview`} className={className} draggable={false} />;
}

export function PhoneMockup({ doc, qr }: { doc: DesignDoc; qr: string }) {
  return (
    <div className="mx-auto w-[240px] animate-fade-in">
      <div className="rounded-[2.4rem] border-[7px] border-navy-800 bg-navy-950 p-2 shadow-card dark:border-navy-700">
        <div className="relative overflow-hidden rounded-[1.8rem]" style={{ backgroundColor: doc.design.bg }}>
          <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-navy-950" aria-hidden />
          <div className="flex flex-col items-center gap-3 px-5 pb-6 pt-10">
            <QrImg src={qr} name={doc.name} className="w-40 rounded-lg" />
            <p className="text-sm font-semibold" style={{ color: doc.design.gradient.enabled ? doc.design.gradient.from : doc.design.fg }}>
              {doc.name}
            </p>
            <p className="text-[11px] text-slate-500">Scan to open</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardMockup({ doc, qr }: { doc: DesignDoc; qr: string }) {
  const accent = doc.design.gradient.enabled ? doc.design.gradient.from : doc.design.fg;
  return (
    <div className="mx-auto w-full max-w-[420px] animate-fade-in">
      <div
        className="flex items-center justify-between gap-4 rounded-2xl p-5 shadow-card"
        style={{ background: `linear-gradient(120deg, ${doc.design.bg}, ${doc.design.transparentBg ? '#FFFFFF' : doc.design.bg})`, border: `1px solid ${accent}33` }}
      >
        <div className="min-w-0">
          <div className="mb-2 size-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${accent}, ${doc.design.gradient.enabled ? doc.design.gradient.to : accent})` }} aria-hidden />
          <p className="truncate text-base font-bold text-slate-900">{doc.name}</p>
          <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-slate-400">{doc.type} · lumaqr</p>
        </div>
        <QrImg src={qr} name={doc.name} className="w-28 shrink-0 rounded-md" />
      </div>
    </div>
  );
}

export function PosterMockup({ doc, qr }: { doc: DesignDoc; qr: string }) {
  const accent = doc.design.gradient.enabled ? doc.design.gradient.from : doc.design.fg;
  const rawDate = doc.type === 'event' && doc.content.event.start ? new Date(doc.content.event.start) : null;
  const dateStr = rawDate && !Number.isNaN(rawDate.getTime()) ? rawDate.toLocaleDateString() : null;
  return (
    <div className="mx-auto w-full max-w-[300px] animate-fade-in">
      <div className="flex aspect-[3/4] flex-col justify-between rounded-lg p-5 shadow-card" style={{ backgroundColor: doc.design.bg }}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>
            You&apos;re invited
          </p>
          <h3 className="mt-2 text-xl font-black leading-tight text-slate-900">{doc.name}</h3>
          <div className="mt-3 h-1 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${doc.design.gradient.enabled ? doc.design.gradient.to : accent})` }} aria-hidden />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="text-[11px] leading-relaxed text-slate-500">
            {doc.type === 'event' && doc.content.event.location ? doc.content.event.location : 'Save the date'}
            <br />
            {dateStr ?? 'Details on scan'}
          </div>
          <QrImg src={qr} name={doc.name} className="w-24 shrink-0 rounded" />
        </div>
      </div>
    </div>
  );
}

export function MenuMockup({ doc, qr }: { doc: DesignDoc; qr: string }) {
  const accent = doc.design.gradient.enabled ? doc.design.gradient.from : doc.design.fg;
  const items: Array<[string, string]> = [
    ['Signature Bowl', '14'],
    ['Wood-fired Flatbread', '16'],
    ['Yuzu Sorbet', '8'],
  ];
  return (
    <div className="mx-auto w-full max-w-[320px] animate-fade-in">
      <div className="rounded-lg p-5 shadow-card" style={{ backgroundColor: doc.design.bg }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{doc.name}</p>
            <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900">Menu</h3>
          </div>
          <QrImg src={qr} name={doc.name} className="w-20 shrink-0 rounded" />
        </div>
        <ul className="mt-4 space-y-2.5">
          {items.map(([n, p]) => (
            <li key={n} className="flex items-baseline justify-between gap-2 text-[13px]">
              <span className="font-medium text-slate-700 dark:text-slate-200">{n}</span>
              <span className="flex-1 border-b border-dotted border-slate-300 dark:border-slate-600" aria-hidden />
              <span className="font-semibold" style={{ color: accent }}>{p}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-[11px] text-slate-400">Scan for the full menu</p>
      </div>
    </div>
  );
}

export function Mockup({ kind, doc, qr }: { kind: MockupId; doc: DesignDoc; qr: string }) {
  switch (kind) {
    case 'phone':
      return <PhoneMockup doc={doc} qr={qr} />;
    case 'card':
      return <CardMockup doc={doc} qr={qr} />;
    case 'poster':
      return <PosterMockup doc={doc} qr={qr} />;
    case 'menu':
      return <MenuMockup doc={doc} qr={qr} />;
    default:
      return null;
  }
}
