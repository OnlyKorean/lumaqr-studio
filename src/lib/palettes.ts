import type { DesignDoc, DesignSpec, DotStyle, ECLevel, EyeStyle, MoodId, MockupId } from '../types/design';
import { contrastRatio, mixHex } from './utils';

/* ---------------- Preset palettes ---------------- */

export interface PalettePreset {
  id: string;
  name: string;
  fg: string;
  bg: string;
  gradient?: { from: string; to: string; angle: number };
  dotStyle: DotStyle;
  radius?: number;
  eyeStyle?: EyeStyle;
  ec?: ECLevel;
}

export const PALETTES: PalettePreset[] = [
  { id: 'obsidian', name: 'Obsidian & White', fg: '#0B1020', bg: '#FFFFFF', dotStyle: 'soft', radius: 0.25 },
  {
    id: 'violet',
    name: 'Violet Pulse',
    fg: '#7C3AED',
    bg: '#FFFFFF',
    gradient: { from: '#7C3AED', to: '#22D3EE', angle: 135 },
    dotStyle: 'rounded',
    radius: 0.3,
  },
  { id: 'ocean', name: 'Ocean Signal', fg: '#0E7490', bg: '#ECFEFF', dotStyle: 'soft', radius: 0.35, eyeStyle: 'rounded' },
  { id: 'lime', name: 'Lime Tech', fg: '#A3E635', bg: '#0B1020', dotStyle: 'pixel' },
  {
    id: 'sunset',
    name: 'Sunset Studio',
    fg: '#EA580C',
    bg: '#FFF7ED',
    gradient: { from: '#F97316', to: '#DB2777', angle: 45 },
    dotStyle: 'elegant',
  },
  { id: 'gold', name: 'Royal Gold', fg: '#A16207', bg: '#FEFCE8', dotStyle: 'elegant', eyeStyle: 'dot' },
  { id: 'mono', name: 'Monochrome', fg: '#111827', bg: '#FFFFFF', dotStyle: 'square' },
  { id: 'brand', name: 'Custom Brand', fg: '#7C3AED', bg: '#F8FAFC', dotStyle: 'rounded', radius: 0.3 },
];

export function applyPalette(doc: DesignDoc, p: PalettePreset): DesignDoc {
  const design: DesignSpec = {
    ...doc.design,
    fg: p.fg,
    bg: p.bg,
    gradient: p.gradient
      ? { enabled: true, from: p.gradient.from, to: p.gradient.to, angle: p.gradient.angle }
      : { ...doc.design.gradient, enabled: false },
    transparentBg: false,
    dotStyle: p.dotStyle,
    radius: p.radius ?? doc.design.radius,
    eyeStyle: p.eyeStyle ?? doc.design.eyeStyle,
    ec: p.ec ?? doc.design.ec,
  };
  return { ...doc, design };
}

/* ---------------- QR Moods ---------------- */

export interface Mood {
  id: MoodId;
  name: string;
  blurb: string;
  fg: string;
  bg: string;
  gradient?: { from: string; to: string; angle: number };
  dotStyle: DotStyle;
  eyeStyle?: EyeStyle;
  radius?: number;
  margin?: number;
  ec?: ECLevel;
  mockup: MockupId;
}

export const MOODS: Mood[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    blurb: 'Clean monochrome, extra quiet zone',
    fg: '#111827',
    bg: '#FFFFFF',
    dotStyle: 'square',
    radius: 0,
    margin: 6,
    mockup: 'card',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    blurb: 'Gold on cream, elegant dots',
    fg: '#A16207',
    bg: '#FBF7EF',
    dotStyle: 'elegant',
    eyeStyle: 'dot',
    margin: 5,
    ec: 'H',
    mockup: 'poster',
  },
  {
    id: 'tech',
    name: 'Tech',
    blurb: 'Electric violet, rounded dots',
    fg: '#7C3AED',
    bg: '#FFFFFF',
    dotStyle: 'rounded',
    eyeStyle: 'rounded',
    radius: 0.3,
    mockup: 'phone',
  },
  {
    id: 'playful',
    name: 'Playful',
    blurb: 'Coral pops, soft round dots',
    fg: '#E11D48',
    bg: '#FFF1F2',
    dotStyle: 'soft',
    eyeStyle: 'dot',
    radius: 0.5,
    mockup: 'menu',
  },
  {
    id: 'nature',
    name: 'Nature',
    blurb: 'Moss green on leaf cream',
    fg: '#3F6212',
    bg: '#F7FEE7',
    dotStyle: 'soft',
    eyeStyle: 'rounded',
    radius: 0.35,
    margin: 5,
    mockup: 'menu',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    blurb: 'Ink black, pixel dots, print sharp',
    fg: '#18181B',
    bg: '#FAFAF9',
    dotStyle: 'pixel',
    margin: 6,
    mockup: 'poster',
  },
  {
    id: 'festival',
    name: 'Festival',
    blurb: 'Neon gradient on deep navy',
    fg: '#22D3EE',
    bg: '#0B1020',
    gradient: { from: '#22D3EE', to: '#A3E635', angle: 135 },
    dotStyle: 'soft',
    radius: 0.4,
    ec: 'H',
    mockup: 'phone',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    blurb: 'Deep blue, dependable geometry',
    fg: '#1E3A8A',
    bg: '#F8FAFC',
    dotStyle: 'rounded',
    eyeStyle: 'rounded',
    radius: 0.25,
    margin: 5,
    mockup: 'card',
  },
];

export function applyMood(doc: DesignDoc, mood: Mood): DesignDoc {
  const d = doc.design;
  const design: DesignSpec = {
    ...d,
    fg: mood.fg,
    bg: mood.bg,
    gradient: mood.gradient
      ? { enabled: true, from: mood.gradient.from, to: mood.gradient.to, angle: mood.gradient.angle }
      : { ...d.gradient, enabled: false },
    transparentBg: false,
    dotStyle: mood.dotStyle,
    eyeStyle: mood.eyeStyle ?? d.eyeStyle,
    radius: mood.radius ?? d.radius,
    margin: mood.margin ?? d.margin,
    ec: mood.ec ?? (d.logo.dataUrl ? 'H' : d.ec),
  };
  return { ...doc, design };
}

/* ---------------- Smart Brand Mode ---------------- */

export interface BrandKit {
  primary: string;
  fg: string;
  bg: string;
  gradient: { from: string; to: string; angle: number };
  contrastFgBg: number;
  dotStyle: DotStyle;
  note: string;
}

/**
 * Derives a scan-safe kit from a single brand hex:
 * fg = brand darkened until contrast with bg ≥ 4.5:1,
 * bg = light tint of the brand, gradient = brand → brand mixed toward cyan.
 */
export function deriveBrandKit(primary: string): BrandKit {
  let bg = mixHex(primary, '#FFFFFF', 0.93);
  // keep the tint readable (not too saturated/pale)
  if (contrastRatio(primary, '#FFFFFF') < 1.3) bg = mixHex(primary, '#FFFFFF', 0.96);

  let fg = primary;
  let contrastFgBg = contrastRatio(fg, bg);
  let guard = 0;
  while (contrastFgBg < 4.5 && guard < 20) {
    fg = mixHex(fg, '#000000', 0.16);
    contrastFgBg = contrastRatio(fg, bg);
    guard++;
  }

  return {
    primary,
    fg,
    bg,
    gradient: { from: fg, to: mixHex(primary, '#22D3EE', 0.45), angle: 135 },
    contrastFgBg: Math.round(contrastFgBg * 10) / 10,
    dotStyle: 'rounded',
    note:
      contrastFgBg >= 4.5
        ? 'Contrast passes WCAG AA — safe for scanning.'
        : 'Brand color is very light; dots were darkened for scan safety.',
  };
}

export function applyBrandKit(doc: DesignDoc, kit: BrandKit): DesignDoc {
  const design: DesignSpec = {
    ...doc.design,
    fg: kit.fg,
    bg: kit.bg,
    gradient: { ...kit.gradient, enabled: true },
    transparentBg: false,
    dotStyle: kit.dotStyle,
    ec: doc.design.logo.dataUrl ? 'H' : doc.design.ec,
  };
  return { ...doc, design };
}

/**
 * Approximate average color of an image (alpha-weighted).
 * Honest limitation: this is a sample average, not palette extraction.
 */
export function averageColorFromImage(img: HTMLImageElement, max = 96): string {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '#7C3AED';
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let aSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 16) continue;
    r += data[i] * a;
    g += data[i + 1] * a;
    b += data[i + 2] * a;
    aSum += a;
  }
  if (!aSum) return '#7C3AED';
  const hex = (n: number) => Math.round(n / aSum).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}
