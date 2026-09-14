import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AppSettings } from '../types/design';
import { getSettings, setSettings } from '../lib/storage';

interface SettingsStoreValue {
  settings: AppSettings;
  setTheme: (t: 'dark' | 'light') => void;
  setExportSize: (s: 512 | 1024 | 2048) => void;
}

const Ctx = createContext<SettingsStoreValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(getSettings);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const value = useMemo<SettingsStoreValue>(
    () => ({
      settings,
      setTheme: (t) => {
        setSettingsState((s) => {
          const next = { ...s, theme: t };
          setSettings(next);
          return next;
        });
      },
      setExportSize: (size) => {
        setSettingsState((s) => {
          const next = { ...s, exportSize: size };
          setSettings(next);
          return next;
        });
      },
    }),
    [settings],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsStoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSettings must be used inside <SettingsProvider>');
  return v;
}
