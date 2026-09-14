import { useEffect, useState } from 'react';
import type { DesignDoc } from '../types/design';
import { renderToDataUrl, specFromDoc } from '../lib/render';

/** Renders the current design to a PNG data URL (used by mockups & templates). */
export function useQRDataUrl(doc: DesignDoc, payload: string, size = 512, active: boolean): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !payload) {
      setUrl(null);
      return;
    }
    let alive = true;
    const t = window.setTimeout(() => {
      (async () => {
        try {
          const u = await renderToDataUrl(specFromDoc(doc, payload, size));
          if (alive) setUrl(u);
        } catch {
          if (alive) setUrl(null);
        }
      })();
    }, 16);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [doc, payload, size, active]);

  return url;
}
