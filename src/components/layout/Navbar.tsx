import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Moon, Sparkles, Sun, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { cx } from '../../lib/utils';
import { useSettings } from '../../store/settingsStore';

const LINKS = [
  { to: '/create', label: 'Create' },
  { to: '/templates', label: 'Templates' },
  { to: '/designs', label: 'My Designs' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/settings', label: 'Settings' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { settings, setTheme } = useSettings();

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-black/5 bg-white/85 backdrop-blur-xl dark:border-white/8 dark:bg-navy-900/85">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 lg:px-8">
        <Link
          to="/"
          onClick={close}
          aria-label="LumaQR Studio — home"
          className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
        >
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cx(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan',
                  isActive
                    ? 'text-slate-900 dark:text-white after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-brand-violet after:to-brand-cyan'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
            aria-label={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={settings.theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-black/5 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link to="/create" className="hidden sm:block">
            <Button size="sm" icon={<Sparkles size={15} aria-hidden />}>
              Start Creating
            </Button>
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex size-9 items-center justify-center rounded-xl text-slate-600 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-slide-down border-t border-black/5 bg-white/95 px-4 pb-4 pt-2 backdrop-blur-xl lg:hidden dark:border-white/8 dark:bg-navy-900/95">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={close}
                className={({ isActive }) =>
                  cx(
                    'rounded-xl px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-brand-violet/10 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/create" onClick={close} className="mt-2">
              <Button className="w-full" icon={<Sparkles size={16} aria-hidden />}>
                Start Creating
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
