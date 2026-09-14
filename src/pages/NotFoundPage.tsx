import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div className="relative">
        <div className="flex size-24 items-center justify-center rounded-3xl border border-dashed border-slate-300 text-5xl font-black text-slate-300 dark:border-white/20 dark:text-slate-600">
          404
        </div>
        <span aria-hidden className="absolute -inset-2 -z-10 animate-pulse-ring rounded-[2rem] border-2 border-brand-violet/40" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">This page doesn&apos;t exist — or it refused to be scanned.</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The URL you followed isn&apos;t part of the studio. Your designs and settings are safe; let&apos;s get you back to work.
      </p>
      <div className="mt-2 flex gap-3">
        <Link to="/">
          <Button icon={<Compass size={15} aria-hidden />}>Back to home</Button>
        </Link>
        <Link to="/create">
          <Button variant="secondary">Open the creator</Button>
        </Link>
      </div>
    </div>
  );
}
