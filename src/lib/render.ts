import QRCode from 'qrcode';
import type { DesignDoc, DesignSpec, ECLevel } from '../types/design';

/**
 * Rendering engine.
 *
 * QR matrices come from the battle-tested `qrcode` core; dots, eyes,
 * gradients and logos are drawn by this module so we get pixel control
 * for both canvas (PNG) and string (SVG) output.
 */

export interface RenderSpec {
  data: string;
  ec: ECLevel;
  size: number; // output square, px
  marginModules: number; // quiet zone
  fg: { solid?: string; gradient?: { from: string; to: string; angle: number } };
  bg: string | null; // null = transparent
  dotStyle: DesignSpec['dotStyle'];
  eyeStyle: DesignSpec['eyeStyle'];
  radius: number; // 0..0.5
  logo?: {
    dataUrl: string;
    percent: number;
    padding: number;
    background: string | null;
    opacity: number;
  } | null;
}

export interface QRMatrix {
  size: number;
  version: number;
  dark: (x: number, y: number) => boolean;
}

export function getMatrix(data: string, ec: ECLevel): QRMatrix {
  const q = QRCode.create(data, { errorCorrectionLevel: ec });
  const n = q.modules.size;
  const d = q.modules.data as Uint8Array; // flat, row-major
  return {
    size: n,
    version: q.version,
    dark: (x, y) => d[y * n + x] === 1,
  };
}

export function specFromDoc(doc: DesignDoc, data: string, size?: number, transparentOverride?: boolean): RenderSpec {
  const d = doc.design;
  const transparent = transparentOverride ?? d.transparentBg;
  return {
    data,
    ec: d.ec,
    size: size ?? d.size,
    marginModules: d.margin,
    fg: d.gradient.enabled
      ? { gradient: { from: d.gradient.from, to: d.gradient.to, angle: d.gradient.angle } }
      : { solid: d.fg },
    bg: transparent ? null : d.bg,
    dotStyle: d.dotStyle,
    eyeStyle: d.eyeStyle,
    radius: d.radius,
    logo:
      d.logo.dataUrl && d.logo.percent > 0.02
        ? {
            dataUrl: d.logo.dataUrl,
            percent: d.logo.percent,
            padding: d.logo.padding,
            background: d.logo.backgroundEnabled ? d.logo.background : null,
            opacity: d.logo.opacity,
          }
        : null,
  };
}

/* ---------------- Canvas ---------------- */

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function gradientFill(ctx: CanvasRenderingContext2D, spec: RenderSpec, size: number): string | CanvasGradient {
  const g = spec.fg.gradient;
  if (!g) return spec.fg.solid ?? '#000000';
  const a = (g.angle * Math.PI) / 180;
  const c = size / 2;
  const r = size * 0.72;
  const dx = Math.cos(a) * r;
  const dy = Math.sin(a) * r;
  const grad = ctx.createLinearGradient(c - dx, c - dy, c + dx, c + dy);
  grad.addColorStop(0, g.from);
  grad.addColorStop(1, g.to);
  return grad;
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number, spec: RenderSpec): void {
  // Scan-safety rule: every dot spans the full module cell so dark runs
  // stay continuous — only corners may be rounded or shrunk.
  switch (spec.dotStyle) {
    case 'square':
      ctx.fillRect(x, y, cell, cell);
      break;
    case 'pixel': {
      const i = cell * 0.12;
      ctx.fillRect(x + i, y + i, cell - 2 * i, cell - 2 * i);
      break;
    }
    case 'elegant':
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'rounded': {
      const r = cell * spec.radius;
      rr(ctx, x, y, cell, cell, r);
      ctx.fill();
      break;
    }
    case 'soft': {
      const r = cell * (0.3 + 0.2 * (spec.radius / 0.5));
      rr(ctx, x, y, cell, cell, r);
      ctx.fill();
      break;
    }
  }
}

/**
 * Every finder eye keeps the 7-dark / 5-light / 3-dark structure so the
 * 1:1:3 ratio a scanner locks onto survives any cosmetic style.
 * Construction: outer shape minus a 5/7 hole (even-odd), then a 3/7 center.
 */

type EyePos = 'tl' | 'tr' | 'bl';

/**
 * Triangle eye vertices in box-local coordinates (fraction of s), per eye
 * position. The triangle always stays inside the 7x7 box: apex toward the
 * QR center, base hugging the outer corner.
 */
const TRI_BASE: Record<EyePos, Array<[number, number]>> = {
  tl: [
    [0.9, 0.9],
    [0.1, 0.42],
    [0.42, 0.1],
  ],
  tr: [
    [0.1, 0.9],
    [0.9, 0.42],
    [0.58, 0.1],
  ],
  bl: [
    [0.9, 0.1],
    [0.42, 0.9],
    [0.1, 0.58],
  ],
};

function triLocal(pos: EyePos, px: number, py: number, s: number, k: number): Array<[number, number]> {
  const base = TRI_BASE[pos];
  const gx = (base[0][0] + base[1][0] + base[2][0]) / 3;
  const gy = (base[0][1] + base[1][1] + base[2][1]) / 3;
  return base.map(([fx, fy]) => [px + (gx + k * (fx - gx)) * s, py + (gy + k * (fy - gy)) * s]);
}

function poly(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>): void {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  s: number,
  spec: RenderSpec,
  pos: EyePos,
): void {
  const cx = px + s / 2;
  const cy = py + s / 2;
  const cell = s / 7;
  switch (spec.eyeStyle) {
    case 'square':
    case 'rounded': {
      const outerRx = spec.eyeStyle === 'square' ? s * spec.radius * 0.3 : s * (0.08 + 0.08 * (spec.radius / 0.5));
      ctx.beginPath();
      rr(ctx, px, py, s, s, outerRx);
      // hole stays sharp: corner dark runs must measure ~1 module
      rr(ctx, px + cell, py + cell, s - 2 * cell, s - 2 * cell, 0);
      ctx.fill('evenodd');
      const centerRx = spec.eyeStyle === 'square' ? s * spec.radius * 0.12 : Math.min(s * (0.05 + 0.15 * (spec.radius / 0.5)), s * 0.11);
      ctx.beginPath();
      rr(ctx, px + 2 * cell, py + 2 * cell, 3 * cell, 3 * cell, centerRx);
      ctx.fill();
      break;
    }
    case 'dot': {
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
      ctx.arc(cx, cy, s * 5 / 14, 0, Math.PI * 2);
      ctx.fill('evenodd');
      ctx.beginPath();
      ctx.arc(cx, cy, s * 3 / 14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'triangle':
    case 'triangle-rounded': {
      // Decorative eye: a true triangle cannot reproduce the 1:1:3 finder
      // phase, so the scanability score flags it — but it must stay inside
      // the box so it never corrupts neighboring modules.
      const outer = triLocal(pos, px, py, s, 1);
      const hole = triLocal(pos, px, py, s, 0.62);
      ctx.beginPath();
      poly(ctx, outer);
      poly(ctx, hole);
      ctx.fill('evenodd');
      const center = triLocal(pos, px, py, s, 0.3);
      ctx.beginPath();
      poly(ctx, center);
      if (spec.eyeStyle === 'triangle-rounded') {
        ctx.lineJoin = 'round';
        ctx.lineWidth = s * 0.09;
        ctx.strokeStyle = ctx.fillStyle as string | CanvasGradient;
        ctx.stroke();
      }
      ctx.fill();
      break;
    }
  }
}

function inFinder(x: number, y: number, n: number): boolean {
  return (x <= 6 && y <= 6) || (x >= n - 7 && y <= 6) || (x <= 6 && y >= n - 7);
}

function drawLogo(ctx: CanvasRenderingContext2D, spec: RenderSpec, size: number, img: HTMLImageElement): void {
  const l = spec.logo;
  if (!l) return;
  const box = size * l.percent;
  const pad = box * l.padding;
  const x0 = (size - box) / 2;
  const y0 = (size - box) / 2;
  const rBox = box * 0.2;
  ctx.save();
  if (l.background) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = l.background;
    ctx.beginPath();
    rr(ctx, x0, y0, box, box, rBox);
    ctx.fill();
  }
  const inner = box - 2 * pad;
  ctx.beginPath();
  rr(ctx, x0 + pad, y0 + pad, inner, inner, Math.max(0, rBox - pad * 0.6));
  ctx.clip();
  ctx.globalAlpha = l.opacity;
  const scale = Math.min(inner / img.naturalWidth, inner / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  ctx.restore();
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load logo image.'));
    img.src = dataUrl;
  });
}

export async function renderToCanvas(canvas: HTMLCanvasElement, spec: RenderSpec): Promise<void> {
  if (!spec.data) throw new Error('Empty QR payload.');
  const m = getMatrix(spec.data, spec.ec);
  const n = m.size;
  canvas.width = spec.size;
  canvas.height = spec.size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');
  ctx.clearRect(0, 0, spec.size, spec.size);
  if (spec.bg) {
    ctx.fillStyle = spec.bg;
    ctx.fillRect(0, 0, spec.size, spec.size);
  }
  const cell = spec.size / (n + 2 * spec.marginModules);
  const ox = spec.marginModules * cell;
  ctx.fillStyle = gradientFill(ctx, spec, spec.size);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!m.dark(x, y) || inFinder(x, y, n)) continue;
      drawDot(ctx, ox + x * cell, ox + y * cell, cell, spec);
    }
  }
  const s = 7 * cell;
  drawEye(ctx, ox, ox, s, spec, 'tl');
  drawEye(ctx, ox + (n - 7) * cell, ox, s, spec, 'tr');
  drawEye(ctx, ox, ox + (n - 7) * cell, s, spec, 'bl');
  if (spec.logo?.dataUrl) {
    try {
      const img = await loadImage(spec.logo.dataUrl);
      drawLogo(ctx, spec, spec.size, img);
    } catch {
      /* unreadable logo: render the code without it rather than fail the export */
    }
  }
}

export async function renderToDataUrl(spec: RenderSpec): Promise<string> {
  const canvas = document.createElement('canvas');
  await renderToCanvas(canvas, spec);
  return canvas.toDataURL('image/png');
}

/* ---------------- SVG ---------------- */

const r2 = (v: number) => Math.round(v * 100) / 100;

function dotSvg(x: number, y: number, cell: number, spec: RenderSpec): string {
  switch (spec.dotStyle) {
    case 'square':
      return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(cell)}" height="${r2(cell)}"/>`;
    case 'pixel': {
      const i = cell * 0.12;
      return `<rect x="${r2(x + i)}" y="${r2(y + i)}" width="${r2(cell - 2 * i)}" height="${r2(cell - 2 * i)}"/>`;
    }
    case 'elegant':
      return `<circle cx="${r2(x + cell / 2)}" cy="${r2(y + cell / 2)}" r="${r2(cell * 0.5)}"/>`;
    case 'rounded':
      return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(cell)}" height="${r2(cell)}" rx="${r2(cell * spec.radius)}"/>`;
    case 'soft':
      return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(cell)}" height="${r2(cell)}" rx="${r2(cell * (0.3 + 0.2 * (spec.radius / 0.5)))}"/>`;
  }
}

function rrPath(x: number, y: number, w: number, h: number, rad: number): string {
  const r = Math.max(0, Math.min(rad, w / 2, h / 2));
  return (
    `M${r2(x + r)},${r2(y)} H${r2(x + w - r)} A${r2(r)},${r2(r)} 0 0 1 ${r2(x + w)},${r2(y + r)} ` +
    `V${r2(y + h - r)} A${r2(r)},${r2(r)} 0 0 1 ${r2(x + w - r)},${r2(y + h)} H${r2(x + r)} ` +
    `A${r2(r)},${r2(r)} 0 0 1 ${r2(x)},${r2(y + h - r)} V${r2(y + r)} A${r2(r)},${r2(r)} 0 0 1 ${r2(x + r)},${r2(y)} Z`
  );
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M${r2(cx + r)},${r2(cy)} A${r2(r)},${r2(r)} 0 1 0 ${r2(cx - r)},${r2(cy)} A${r2(r)},${r2(r)} 0 1 0 ${r2(cx + r)},${r2(cy)} Z`;
}

function triPath(pts: Array<[number, number]>): string {
  return `M${r2(pts[0][0])},${r2(pts[0][1])} L${r2(pts[1][0])},${r2(pts[1][1])} L${r2(pts[2][0])},${r2(pts[2][1])} Z`;
}

function eyeSvg(px: number, py: number, s: number, spec: RenderSpec, _fillRef: string, pos: EyePos): string {
  const cx = px + s / 2;
  const cy = py + s / 2;
  const cell = s / 7;
  switch (spec.eyeStyle) {
    case 'square':
    case 'rounded': {
      const outerRx = spec.eyeStyle === 'square' ? s * spec.radius * 0.3 : s * (0.08 + 0.08 * (spec.radius / 0.5));
      // hole stays sharp: corner dark runs must measure ~1 module
      const ring = `<path fill-rule="evenodd" d="${rrPath(px, py, s, s, outerRx)} ${rrPath(px + cell, py + cell, s - 2 * cell, s - 2 * cell, 0)}"/>`;
      const centerRx = spec.eyeStyle === 'square' ? s * spec.radius * 0.12 : Math.min(s * (0.05 + 0.15 * (spec.radius / 0.5)), s * 0.11);
      return `${ring}<path d="${rrPath(px + 2 * cell, py + 2 * cell, 3 * cell, 3 * cell, centerRx)}"/>`;
    }
    case 'dot':
      return (
        `<path fill-rule="evenodd" d="${circlePath(cx, cy, s * 0.5)} ${circlePath(cx, cy, (s * 5) / 14)}"/>` +
        `<path d="${circlePath(cx, cy, (s * 3) / 14)}"/>`
      );
    case 'triangle':
    case 'triangle-rounded': {
      const ring = `<path fill-rule="evenodd" d="${triPath(triLocal(pos, px, py, s, 1))} ${triPath(triLocal(pos, px, py, s, 0.62))}"/>`;
      const center = `<path d="${triPath(triLocal(pos, px, py, s, 0.3))}"/>`;
      return ring + center;
    }
  }
}

export async function renderToSVG(spec: RenderSpec): Promise<string> {
  if (!spec.data) throw new Error('Empty QR payload.');
  const m = getMatrix(spec.data, spec.ec);
  const n = m.size;
  const size = spec.size;
  const cell = size / (n + 2 * spec.marginModules);
  const ox = spec.marginModules * cell;

  let defs = '';
  let fillRef: string;
  if (spec.fg.gradient) {
    const { from, to, angle } = spec.fg.gradient;
    const a = (angle * Math.PI) / 180;
    const c = size / 2;
    const rad = size * 0.72;
    const dx = Math.cos(a) * rad;
    const dy = Math.sin(a) * rad;
    defs = `<defs><linearGradient id="lumaFg" x1="${r2(c - dx)}" y1="${r2(c - dy)}" x2="${r2(c + dx)}" y2="${r2(c + dy)}"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>`;
    fillRef = 'url(#lumaFg)';
  } else {
    fillRef = spec.fg.solid ?? '#000000';
  }

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`,
  );
  if (defs) parts.push(defs);
  if (spec.bg) parts.push(`<rect width="${size}" height="${size}" fill="${spec.bg}"/>`);

  const dots: string[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!m.dark(x, y) || inFinder(x, y, n)) continue;
      dots.push(dotSvg(ox + x * cell, ox + y * cell, cell, spec));
    }
  }
  const s = 7 * cell;
  const eyes = [
    eyeSvg(ox, ox, s, spec, fillRef, 'tl'),
    eyeSvg(ox + (n - 7) * cell, ox, s, spec, fillRef, 'tr'),
    eyeSvg(ox, ox + (n - 7) * cell, s, spec, fillRef, 'bl'),
  ];
  parts.push(`<g fill="${fillRef}">${eyes.join('')}${dots.join('')}</g>`);

  if (spec.logo?.dataUrl) {
    const l = spec.logo;
    const box = size * l.percent;
    const pad = box * l.padding;
    const x0 = (size - box) / 2;
    const y0 = (size - box) / 2;
    const inner = box - 2 * pad;
    if (l.background) {
      parts.push(`<rect x="${r2(x0)}" y="${r2(y0)}" width="${r2(box)}" height="${r2(box)}" rx="${r2(box * 0.2)}" fill="${l.background}"/>`);
    }
    parts.push(
      `<image x="${r2(x0 + pad)}" y="${r2(y0 + pad)}" width="${r2(inner)}" height="${r2(inner)}" href="${l.dataUrl}" opacity="${r2(l.opacity)}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }

  parts.push('</svg>');
  return parts.join('');
}
