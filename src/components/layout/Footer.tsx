import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5 py-8 dark:border-white/8">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-8">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <Logo compact />
          <p className="text-xs text-slate-400 dark:text-slate-500">Make it scan. Make it yours.</p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <ShieldCheck size={13} className="text-brand-lime" aria-hidden />
          100% client-side — your QR content never leaves this browser.
        </p>
        <nav aria-label="Footer" className="flex gap-4 text-xs text-slate-400 dark:text-slate-500">
          <Link to="/templates" className="transition hover:text-brand-violet dark:hover:text-brand-cyan">Templates</Link>
          <Link to="/designs" className="transition hover:text-brand-violet dark:hover:text-brand-cyan">My Designs</Link>
          <Link to="/how-it-works" className="transition hover:text-brand-violet dark:hover:text-brand-cyan">How It Works</Link>
        </nav>
      </div>
    </footer>
  );
}
