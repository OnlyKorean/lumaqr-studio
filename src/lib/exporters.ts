import type { DesignDoc } from '../types/design';
import { renderToCanvas, renderToSVG, specFromDoc } from './render';
import { buildPayload } from './payload';
import { slugify } from './utils';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function toPngBlob(doc: DesignDoc, size: number, transparent: boolean): Promise<Blob> {
  const { payload } = buildPayload(doc);
  const spec = specFromDoc(doc, payload, size, transparent);
  const canvas = document.createElement('canvas');
  await renderToCanvas(canvas, spec);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed.'))), 'image/png');
  });
}

export async function downloadPNG(doc: DesignDoc, size: number, filename: string, transparent?: boolean): Promise<void> {
  const blob = await toPngBlob(doc, size, transparent ?? doc.design.transparentBg);
  triggerDownload(blob, `${slugify(filename)}.png`);
}

export async function downloadSVG(doc: DesignDoc, size: number, filename: string): Promise<void> {
  const { payload } = buildPayload(doc);
  const spec = specFromDoc(doc, payload, size);
  const svg = await renderToSVG(spec);
  triggerDownload(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${slugify(filename)}.svg`);
}

export async function copyPngToClipboard(doc: DesignDoc, size: number, transparent?: boolean): Promise<void> {
  const blob = await toPngBlob(doc, size, transparent ?? doc.design.transparentBg);
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Image clipboard is not supported in this browser — use Download PNG instead.');
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) throw new Error('Clipboard is not available.');
  await navigator.clipboard.writeText(text);
}

export type ShareOutcome = 'shared' | 'copied' | 'unsupported';

/** Web Share API with an honest fallback chain. */
export async function shareQr(doc: DesignDoc, size: number): Promise<ShareOutcome> {
  const { payload } = buildPayload(doc);
  const title = doc.name || 'LumaQR Studio';
  if (!('share' in navigator)) return 'unsupported';
  try {
    const blob = await toPngBlob(doc, Math.min(size, 1024), true);
    const file = new File([blob], `${slugify(doc.name)}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, text: payload, files: [file] });
      return 'shared';
    }
    await navigator.share({ title, text: payload });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'unsupported';
    try {
      await copyTextToClipboard(payload);
      return 'copied';
    } catch {
      return 'unsupported';
    }
  }
}

/** Print via a clean isolated sheet in a hidden iframe (no page CSS interference). */
export async function printQr(doc: DesignDoc, size = 1024): Promise<void> {
  const { payload } = buildPayload(doc);
  const spec = specFromDoc(doc, payload, size, false);
  const canvas = document.createElement('canvas');
  await renderToCanvas(canvas, spec);
  const img = canvas.toDataURL('image/png');
  const safe = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${safe(doc.name)} — print</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;color:#0B1020}
  .wrap{display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px}
  img{width:320px;height:320px}
  h1{font-size:20px;margin:0;letter-spacing:.02em}
  p{font-size:13px;color:#475569;margin:0;max-width:340px;word-break:break-all;text-align:center}
  .brand{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7C3AED;margin-top:8px}
  @media print{ body{min-height:auto} }
</style></head><body><div class="wrap">
  <h1>${safe(doc.name)}</h1>
  <img src="${img}" alt="${safe(doc.name)} QR code">
  <p>${safe(payload)}</p>
  <div class="brand">LumaQR Studio — Make it scan. Make it yours.</div>
</div>
<script>window.onload = function () { setTimeout(function () { window.focus(); window.print(); }, 250); };</script>
</body></html>`;
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);
  const docEl = iframe.contentDocument;
  if (!docEl) {
    iframe.remove();
    throw new Error('Could not open the print sheet.');
  }
  docEl.open();
  docEl.write(html);
  docEl.close();
  setTimeout(() => iframe.remove(), 60000);
}
