/**
 * Headless smoke tests for the core logic (no DOM):
 * payloads, validation, SVG rendering, scanability scoring,
 * capacity estimation, JSON sanitization, brand kit derivation.
 */

// Minimal localStorage shim for node.
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
};

import { buildPayload } from '../src/lib/payload';
import { getMatrix, renderToSVG, specFromDoc } from '../src/lib/render';
import { capacityBytes, computeScanScore } from '../src/lib/score';
import { deriveBrandKit } from '../src/lib/palettes';
import { importDesignsJson, coerceDoc, loadDesigns } from '../src/lib/storage';
import { contrastRatio } from '../src/lib/utils';
import { makeDemoDoc } from '../src/lib/demo';
import type { DesignDoc } from '../src/types/design';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) {
    passed++;
    console.log(`  ok  ${name}`);
  } else {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}

const base = makeDemoDoc();

console.log('\n[1] Payload builders — all 8 content types');
{
  const mk = (type: DesignDoc['type'], content: Partial<DesignDoc['content']>): DesignDoc => ({
    ...base,
    type,
    content: { ...base.content, ...content },
  });

  const url = buildPayload(mk('url', { url: 'example.com/hello' }));
  check('url: auto https', url.payload === 'https://example.com/hello' && Object.keys(url.errors).length === 0, url.payload);

  const text = buildPayload(mk('text', { text: 'Hello, world!' }));
  check('text: plain', text.payload === 'Hello, world!' && Object.keys(text.errors).length === 0);

  const email = buildPayload(mk('email', { email: { to: 'a@b.co', subject: 'Hi', body: 'Yo' } }));
  check('email: mailto', email.payload.startsWith('mailto:a@b.co?subject=') && email.payload.includes('body='), email.payload);
  const emailBad = buildPayload(mk('email', { email: { to: 'nope', subject: '', body: '' } }));
  check('email: invalid address errors', !!emailBad.errors['email.to']);

  const phone = buildPayload(mk('phone', { phone: { number: '+1 415 555 0134' } }));
  check('phone: tel:', phone.payload === 'tel:+14155550134', phone.payload);

  const sms = buildPayload(mk('sms', { sms: { number: '+14155550134', message: 'Book a table' } }));
  check('sms: smsto:', sms.payload === 'smsto:+14155550134:Book a table', sms.payload);
  const smsLong = buildPayload(mk('sms', { sms: { number: '+14155550134', message: 'x'.repeat(200) } }));
  check('sms: long message warning', smsLong.warnings.length > 0);

  const wifi = buildPayload(mk('wifi', { wifi: { ssid: 'My;Net', password: 'p@ss;word', security: 'WPA', hidden: true } }));
  check('wifi: escaped', wifi.payload === 'WIFI:T:WPA;S:My\\;Net;P:p@ss\\;word;H:true;;', wifi.payload);
  const wifiNoPw = buildPayload(mk('wifi', { wifi: { ssid: 'Net', password: '', security: 'WPA', hidden: false } }));
  check('wifi: missing password errors', !!wifiNoPw.errors['wifi.password']);
  const wifiOpen = buildPayload(mk('wifi', { wifi: { ssid: 'Open', password: '', security: 'nopass', hidden: false } }));
  check('wifi: open network ok', !!wifiOpen.payload && !wifiOpen.payload.includes('P:'));

  const vcard = buildPayload(
    mk('vcard', {
      vcard: {
        firstName: 'Ava',
        lastName: 'Chen',
        company: 'NW, Inc',
        title: 'CD',
        phone: '+1 415 555 0134',
        email: 'ava@nw.co',
        website: 'nw.co',
        address: '500 Market St, SF CA, USA',
      },
    }),
  );
  check('vcard: structure', vcard.payload.startsWith('BEGIN:VCARD') && vcard.payload.endsWith('END:VCARD') && vcard.payload.includes('FN:Ava Chen'), vcard.payload.slice(0, 80));

  const event = buildPayload(
    mk('event', {
      event: { title: 'Fest', location: 'Park', description: 'Fun', start: '2026-07-18T16:00', end: '2026-07-18T23:00' },
    }),
  );
  check('event: vevent', event.payload.startsWith('BEGIN:VEVENT') && event.payload.includes('DTSTART:20260718T160000') && event.payload.includes('DTEND:20260718T230000'), event.payload);
  const eventBad = buildPayload(
    mk('event', { event: { title: 'Fest', location: '', description: '', start: '2026-07-18T23:00', end: '2026-07-18T16:00' } }),
  );
  check('event: end<start errors', !!eventBad.errors['event.end']);

  const empty = buildPayload(mk('url', { url: '' }));
  check('url: empty errors + no payload', !!empty.errors.url && empty.payload === '');
}

console.log('\n[2] Matrix + SVG rendering');
{
  const m = getMatrix('https://example.com/lumaqr', 'M');
  check('matrix: size 25 (v2)', m.size === 25, `size=${m.size}`);
  // 7x7 dark border, 5x5 light ring at offset 1, 3x3 dark center at offset 2.
  check('matrix: TL finder pattern', m.dark(0, 0) && m.dark(6, 0) && !m.dark(1, 1) && m.dark(2, 2));

  const doc = makeDemoDoc();
  const spec = specFromDoc(doc, 'https://example.com/lumaqr', 512);
  const svg = await renderToSVG(spec);
  check('svg: well-formed open/close', svg.startsWith('<svg') && svg.trimEnd().endsWith('</svg>'));
  check('svg: has bg rect + dots', svg.includes('<rect width="512" height="512" fill="#FFFFFF"/>') && (svg.match(/<rect /g) ?? []).length > 100);

  const gradDoc: DesignDoc = {
    ...doc,
    design: { ...doc.design, gradient: { enabled: true, from: '#7C3AED', to: '#22D3EE', angle: 135 } },
  };
  const gradSvg = await renderToSVG(specFromDoc(gradDoc, 'https://example.com/lumaqr', 256));
  check('svg: gradient defs', gradSvg.includes('<linearGradient') && gradSvg.includes('url(#lumaFg)'));
}

console.log('\n[3] Scanability score');
{
  const good = makeDemoDoc();
  const goodScore = computeScanScore(good, buildPayload(good).payload);
  check('score: demo is Good/Excellent', goodScore.score >= 75, `score=${goodScore.score} ${goodScore.label}`);

  const bad: DesignDoc = {
    ...good,
    design: {
      ...good.design,
      fg: '#A3E635',
      bg: '#0B1020', // inverted neon
      margin: 0,
      ec: 'L',
      logo: { ...good.design.logo, dataUrl: 'data:image/png;base64,iVBORw0KGgo=', percent: 0.32 },
    },
  };
  const badScore = computeScanScore(bad, buildPayload(bad).payload);
  check('score: bad design lower', badScore.score < goodScore.score - 15, `bad=${badScore.score} good=${goodScore.score}`);
  const texts = badScore.issues.map((i) => i.text).join(' | ');
  check('score: actionable messages', texts.includes('contrast') || texts.includes('Quiet') || texts.includes('quiet'), texts);
}

console.log('\n[4] Capacity estimation');
{
  // v2-M byte capacity is 26 (known spec value for version 2, level M).
  const cap = capacityBytes(2, 'M');
  check('capacity: v2-M = 26 bytes', cap === 26, `cap=${cap}`);
  const capL = capacityBytes(2, 'L');
  check('capacity: v2-L > v2-M', capL > cap, `L=${capL} M=${cap}`);
}

console.log('\n[5] JSON import sanitization');
{
  const malicious = JSON.stringify([
    { name: 'ok', type: 'url', content: { url: 'https://x.co' }, design: { fg: 'zzz', margin: 99, size: 12, ec: 'X', logo: { dataUrl: 'javascript:alert(1)' } } },
    { name: 'not a design' },
    'junk',
    42,
    { name: 'evil', type: 'url', content: { url: 'https://x.co' }, design: { logo: { dataUrl: 'data:image/png;base64,' + 'A'.repeat(700000) } } },
  ]);
  const res = importDesignsJson(malicious);
  // objects with a name coerce to minimal designs; strings/numbers are skipped;
  // the oversized logo dataUrl is stripped rather than importing raw data.
  check('import: partial success', res.added === 3 && res.skipped === 2, JSON.stringify(res));
  const docs = loadDesigns();
  const d = docs.find((x) => x.name === 'ok');
  check('import: clamped & defaulted', !!d && d.design.margin === 10 && d.design.ec === 'M' && d.design.logo.dataUrl === null, JSON.stringify(d?.design));
  const evil = docs.find((x) => x.name === 'evil');
  check('import: oversized logo stripped', !!evil && evil.design.logo.dataUrl === null);
  check('import: bad JSON', importDesignsJson('{nope').errors.length === 1);
  check('import: non-array object rejected', importDesignsJson('{"hello":1}').errors.length === 1);
  check('coerceDoc: null-safe', coerceDoc(null) === null && coerceDoc('x') === null);
}

console.log('\n[6] Brand kit derivation');
{
  for (const hex of ['#7C3AED', '#A3E635', '#F97316', '#0E7490', '#E11D48', '#A16207']) {
    const kit = deriveBrandKit(hex);
    check(`brandkit ${hex}: contrast >= 4.5`, kit.contrastFgBg >= 4.5, `c=${kit.contrastFgBg}`);
    check(`brandkit ${hex}: bg is light`, contrastRatio(kit.bg, '#FFFFFF') < 1.35);
  }
  const kit = deriveBrandKit('#111111');
  check('brandkit near-black: keeps contrast', kit.contrastFgBg >= 4.5, `c=${kit.contrastFgBg}`);
}

console.log(`\n${failed === 0 ? 'ALL PASS' : 'FAILURES'} — ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
