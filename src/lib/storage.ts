import type { AppSettings, ContentState, ContentType, DesignDoc, DesignSpec } from '../types/design';
import { clamp, isHex, uid } from './utils';

const K_THEME = 'lumaqr.theme.v1';
const K_DESIGNS = 'lumaqr.designs.v1';
const K_CURRENT = 'lumaqr.current.v1';
const K_SETTINGS = 'lumaqr.settings.v1';
const K_TPL_FAVS = 'lumaqr.tplfavs.v1';

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or private mode — data stays in memory */
  }
}

/* ---------------- Theme & settings ---------------- */

export function getTheme(): 'dark' | 'light' {
  const t = readJson<'dark' | 'light'>(K_THEME);
  return t === 'light' ? 'light' : 'dark';
}

export function setTheme(t: 'dark' | 'light'): void {
  writeJson(K_THEME, t);
}

export const DEFAULT_SETTINGS: AppSettings = { theme: 'dark', exportSize: 1024 };

export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...(readJson<Partial<AppSettings>>(K_SETTINGS) ?? {}) };
}

export function setSettings(s: AppSettings): void {
  writeJson(K_SETTINGS, s);
}

/* ---------------- Designs ---------------- */

export function loadDesigns(): DesignDoc[] {
  const list = readJson<unknown>(K_DESIGNS);
  if (!Array.isArray(list)) return [];
  return list.map(coerceDoc).filter((d): d is DesignDoc => d !== null);
}

export function saveDesigns(list: DesignDoc[]): void {
  writeJson(K_DESIGNS, list);
}

export function upsertDesign(doc: DesignDoc): DesignDoc[] {
  const list = loadDesigns();
  const i = list.findIndex((d) => d.id === doc.id);
  if (i >= 0) list[i] = doc;
  else list.unshift(doc);
  saveDesigns(list);
  return list;
}

export function removeDesign(id: string): DesignDoc[] {
  const list = loadDesigns().filter((d) => d.id !== id);
  saveDesigns(list);
  return list;
}

export function toggleFavorite(id: string): DesignDoc[] {
  const list = loadDesigns().map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d));
  saveDesigns(list);
  return list;
}

export function loadCurrent(): DesignDoc | null {
  const raw = readJson<unknown>(K_CURRENT);
  return coerceDoc(raw);
}

export function saveCurrent(doc: DesignDoc): void {
  writeJson(K_CURRENT, doc);
}

export function getTplFavs(): string[] {
  const v = readJson<unknown>(K_TPL_FAVS);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function setTplFavs(ids: string[]): void {
  writeJson(K_TPL_FAVS, ids);
}

export function storageBytes(): number {
  let n = 0;
  for (const k of [K_THEME, K_DESIGNS, K_CURRENT, K_SETTINGS, K_TPL_FAVS]) {
    n += (localStorage.getItem(k) ?? '').length * 2;
  }
  return n;
}

export function clearAllData(): void {
  for (const k of [K_DESIGNS, K_CURRENT, K_SETTINGS, K_TPL_FAVS]) localStorage.removeItem(k);
}

/* ---------------- Sanitizing coercion (import safety) ---------------- */

const TYPES: ContentType[] = ['url', 'text', 'email', 'phone', 'sms', 'wifi', 'vcard', 'event'];
const DOT_STYLES = ['square', 'rounded', 'soft', 'pixel', 'elegant'] as const;
const EYE_STYLES = ['square', 'rounded', 'dot', 'triangle', 'triangle-rounded'] as const;
const EC_LEVELS = ['L', 'M', 'Q', 'H'] as const;
const LOGO_RE = /^data:image\/(png|jpe?g|webp|svg\+xml);base64,.+$/;

const str = (v: unknown, max: number, fallback = ''): string =>
  typeof v === 'string' ? v.slice(0, max) : fallback;

const num = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  return clamp(n, min, max);
};

const bool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback);

const hex = (v: unknown, fallback: string): string => (typeof v === 'string' && isHex(v) ? v.toUpperCase() : fallback);

const dateTime = (v: unknown): string => {
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return v;
  return '';
};

function coerceContent(raw: unknown): ContentState {
  const c = (raw ?? {}) as Record<string, any>;
  return {
    url: str(c.url, 2048),
    text: str(c.text, 4000),
    email: {
      to: str(c.email?.to, 200),
      subject: str(c.email?.subject, 300),
      body: str(c.email?.body, 1500),
    },
    phone: { number: str(c.phone?.number, 30) },
    sms: {
      number: str(c.sms?.number, 30),
      message: str(c.sms?.message, 1000),
    },
    wifi: {
      ssid: str(c.wifi?.ssid, 60),
      password: str(c.wifi?.password, 64),
      security: c.wifi?.security === 'WEP' || c.wifi?.security === 'nopass' ? c.wifi.security : 'WPA',
      hidden: bool(c.wifi?.hidden),
    },
    vcard: {
      firstName: str(c.vcard?.firstName, 60),
      lastName: str(c.vcard?.lastName, 60),
      company: str(c.vcard?.company, 80),
      title: str(c.vcard?.title, 80),
      phone: str(c.vcard?.phone, 30),
      email: str(c.vcard?.email, 200),
      website: str(c.vcard?.website, 200),
      address: str(c.vcard?.address, 200),
    },
    event: {
      title: str(c.event?.title, 120),
      location: str(c.event?.location, 160),
      description: str(c.event?.description, 600),
      start: dateTime(c.event?.start),
      end: dateTime(c.event?.end),
    },
  };
}

function coerceDesign(raw: unknown): DesignSpec {
  const d = (raw ?? {}) as Record<string, any>;
  const g = (d.gradient ?? {}) as Record<string, any>;
  const l = (d.logo ?? {}) as Record<string, any>;
  return {
    fg: hex(d.fg, '#111827'),
    bg: hex(d.bg, '#FFFFFF'),
    gradient: {
      enabled: bool(g.enabled),
      from: hex(g.from, '#7C3AED'),
      to: hex(g.to, '#22D3EE'),
      angle: num(g.angle, 0, 359, 135),
    },
    transparentBg: bool(d.transparentBg),
    dotStyle: DOT_STYLES.includes(d.dotStyle) ? d.dotStyle : 'rounded',
    eyeStyle: EYE_STYLES.includes(d.eyeStyle) ? d.eyeStyle : 'square',
    radius: num(d.radius, 0, 0.5, 0.3),
    size: [256, 384, 512, 768, 1024].includes(num(d.size, 256, 1024, 512)) ? num(d.size, 256, 1024, 512) : 512,
    margin: num(d.margin, 0, 10, 4),
    ec: EC_LEVELS.includes(d.ec) ? d.ec : 'M',
    logo: {
      dataUrl: typeof l.dataUrl === 'string' && LOGO_RE.test(l.dataUrl) && l.dataUrl.length < 600000 ? l.dataUrl : null,
      percent: num(l.percent, 0.1, 0.32, 0.2),
      padding: num(l.padding, 0, 0.4, 0.12),
      background: hex(l.background, '#FFFFFF'),
      backgroundEnabled: bool(l.backgroundEnabled, true),
      opacity: num(l.opacity, 0.2, 1, 1),
    },
  };
}

/** Strict whitelist coercion. Returns null for anything that is not a design object. */
export function coerceDoc(raw: unknown): DesignDoc | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, any>;
  if (typeof o.name !== 'string') return null;
  const type: ContentType = TYPES.includes(o.type) ? o.type : 'url';
  const now = Date.now();
  return {
    id: typeof o.id === 'string' && o.id.length <= 64 ? o.id : uid(),
    name: o.name.slice(0, 80) || 'Untitled design',
    type,
    content: coerceContent(o.content),
    design: coerceDesign(o.design),
    createdAt: num(o.createdAt, 0, now, now),
    updatedAt: num(o.updatedAt, 0, now, now),
    favorite: bool(o.favorite),
  };
}

export interface ImportResult {
  added: number;
  skipped: number;
  errors: string[];
}

export function importDesignsJson(text: string): ImportResult {
  const errors: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { added: 0, skipped: 0, errors: ['File is not valid JSON.'] };
  }
  const arr = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown>)?.designs;
  if (!Array.isArray(arr)) {
    return { added: 0, skipped: 0, errors: ['Expected a JSON array of designs (or { "designs": [...] }).'] };
  }
  const existing = new Set(loadDesigns().map((d) => d.id));
  const fresh: DesignDoc[] = [];
  let skipped = 0;
  for (const item of arr.slice(0, 200)) {
    const doc = coerceDoc(item);
    if (!doc) {
      skipped++;
      continue;
    }
    if (existing.has(doc.id)) doc.id = uid(); // avoid clobbering existing designs
    fresh.push(doc);
  }
  if (arr.length > 200) errors.push(`Import limited to 200 designs (${arr.length} found).`);
  if (skipped > 0) errors.push(`${skipped} item(s) skipped (invalid or unrecognized).`);
  saveDesigns([...fresh, ...loadDesigns()]);
  return { added: fresh.length, skipped, errors };
}

export function exportDesignsJson(list: DesignDoc[]): string {
  return JSON.stringify(
    {
      app: 'LumaQR Studio',
      version: 1,
      exportedAt: new Date().toISOString(),
      designs: list,
    },
    null,
    2,
  );
}
