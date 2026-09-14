import { useEffect, useRef, useState } from 'react';
import type { DesignDoc } from '../types/design';
import { renderToCanvas, specFromDoc } from '../lib/render';

/**
 * Keeps a <canvas> in sync with the live design. `active=false` clears it
 * (used when the payload is invalid and we show an empty state instead).
 */
export function useQRCanvas(doc: DesignDoc, payload: string, size: number, active: boolean) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!active || !payload) {
      canvas.width = canvas.width; // clear
      return;
    }
    let alive = true;
    setBusy(true);
    const t = window.setTimeout(() => {
      (async () => {
        try {
          if (alive && ref.current) await renderToCanvas(ref.current, specFromDoc(doc, payload, size));
        } catch {
          /* transient invalid payload — empty state covers the message */
        } finally {
          if (alive) setBusy(false);
        }
      })();
    }, 16);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [doc, payload, size, active]);

  return { ref, busy };
}
