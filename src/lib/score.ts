import QRCode from 'qrcode';
import type { DesignDoc, ScanLabel } from '../types/design';
import { contrastRatio, byteLength, luminance } from './utils';
import { getMatrix } from './render';

export interface ScoreIssue {
  level: 'good' | 'warn' | 'bad';
  text: string;
}

export interface ScanScore {
  score: number; // 0..100
  label: ScanLabel;
  issues: ScoreIssue[];
}

const capacityCache = new Map<string, number>();

/**
 * Byte capacity of (version, errorCorrectionLevel) found by binary-searching
 * probe encodings — monotonic, no spec tables to maintain. Cached.
 */
export function capacityBytes(version: number, ec: 'L' | 'M' | 'Q' | 'H'): number {
  const key = `${version}:${ec}`;
  const hit = capacityCache.get(key);
  if (hit !== undefined) return hit;
  const probe = (len: number): number => {
    try {
      return QRCode.create('a'.repeat(len), { errorCorrectionLevel: ec }).version;
    } catch {
      return -1;
    }
  };
  let lo = 1;
  let hi = 4000;
  let best = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = probe(mid);
    if (v > 0 && v <= version) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  capacityCache.set(key, best);
  return best;
}

/**
 * Real 0–100 scanability score from contrast, quiet zone, logo size,
 * error correction, payload capacity utilization and color safety.
 * Never claims a scan — only estimates physical robustness.
 */
export function computeScanScore(doc: DesignDoc, payload: string): ScanScore {
  const d = doc.design;
  const issues: ScoreIssue[] = [];
  if (!payload) return { score: 0, label: 'Needs improvement', issues: [{ level: 'bad', text: 'Fix content errors to compute the score.' }] };

  // Effective background: transparent → assume white print surface.
  const effBg = d.transparentBg ? '#FFFFFF' : d.bg;
  const fgColors = d.gradient.enabled ? [d.gradient.from, d.gradient.to] : [d.fg];
  const ratios = fgColors.map((c) => contrastRatio(c, effBg));
  const minRatio = Math.min(...ratios);
  const avgLum = fgColors.reduce((s, c) => s + luminance(c), 0) / fgColors.length;
  const inverted = avgLum > luminance(effBg);

  let contrastPts = minRatio >= 7 ? 20 : minRatio >= 4.5 ? 15 : minRatio >= 3 ? 10 : minRatio >= 1.8 ? 5 : 1;
  if (inverted) {
    contrastPts = Math.max(0, contrastPts - 8);
    issues.push({ level: 'bad', text: 'Dots are lighter than the background — dark dots on a light surface scan most reliably.' });
  }
  if (minRatio < 3) issues.push({ level: 'bad', text: 'Increase contrast between dots and background (aim ≥ 4.5:1).' });

  let quietPts: number;
  if (d.margin >= 4) quietPts = 15;
  else if (d.margin >= 3) quietPts = 11;
  else if (d.margin >= 2) quietPts = 7;
  else quietPts = 3;
  if (d.margin < 4) issues.push({ level: 'warn', text: 'Add more quiet zone — 4+ modules of margin around the code.' });

  let eyePenalty = 0;
  if (d.eyeStyle === 'triangle' || d.eyeStyle === 'triangle-rounded') {
    eyePenalty = 5;
    issues.push({
      level: 'warn',
      text: 'Triangle eyes are decorative — the hardest eye shape for scanners to detect. Verify with a real scan test.',
    });
  }

  const p = d.logo.dataUrl ? d.logo.percent : 0;
  let logoPts: number;
  if (p === 0) logoPts = 15;
  else if (p <= 0.15) logoPts = 13;
  else if (p <= 0.25) logoPts = 9;
  else {
    logoPts = 4;
    issues.push({ level: 'warn', text: 'Your logo is too large for reliable scanning — keep it ≤ 25% of the code.' });
  }
  if (p > 0 && d.ec !== 'H')
    issues.push({ level: 'warn', text: 'Raise error correction to High when a logo covers the center.' });

  const ecPts = { L: 7, M: 10, Q: 13, H: 15 }[d.ec];

  let capPts: number;
  try {
    const m = getMatrix(payload, d.ec);
    const cap = capacityBytes(m.version, d.ec);
    const util = cap > 0 ? byteLength(payload) / cap : 1;
    if (util <= 0.6) capPts = 15;
    else if (util <= 0.8) capPts = 12;
    else if (util <= 0.9) capPts = 8;
    else {
      capPts = 4;
      issues.push({ level: 'bad', text: 'Content is near the QR capacity limit — dense codes fail on small prints.' });
    }
  } catch {
    capPts = 5;
  }

  let colorPts = 20;
  if (d.gradient.enabled) {
    colorPts -= 4;
    issues.push({ level: 'good', text: 'Gradient active — bold, high-contrast gradients scan well.' });
  }
  if (minRatio < 3) colorPts -= 6;
  if (d.transparentBg) issues.push({ level: 'good', text: 'Transparent background — great for screens, print on white.' });

  const score = Math.max(0, Math.min(100, Math.round(contrastPts + quietPts - eyePenalty + logoPts + ecPts + capPts + colorPts)));
  const label: ScanLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs improvement';
  if (score >= 80 && issues.length === 0) issues.push({ level: 'good', text: 'Design looks scan-safe across the checks.' });

  return { score, label, issues };
}
