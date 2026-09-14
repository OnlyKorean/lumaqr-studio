import type { DesignDoc } from '../types/design';
import { byteLength, escapeVCard, escapeWifi } from './utils';

export interface PayloadResult {
  /** Encoded QR payload. Empty when the content is invalid. */
  payload: string;
  /** Field-id → error message. */
  errors: Record<string, string>;
  warnings: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9()\-.\s]{5,25}$/;

function validPhone(v: string): boolean {
  if (!PHONE_RE.test(v)) return false;
  const digits = v.replace(/\D/g, '');
  return digits.length >= 5 && digits.length <= 15;
}

function validUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** "2026-09-14T18:00" → "20260914T180000" (floating local time). */
function icsDatetime(v: string): string | null {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  return `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}00`;
}

export function buildPayload(doc: DesignDoc): PayloadResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];
  let payload = '';

  switch (doc.type) {
    case 'url': {
      let v = doc.content.url.trim();
      if (!v) errors.url = 'URL is required.';
      else {
        if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) v = `https://${v}`;
        if (!validUrl(v)) errors.url = 'Enter a valid URL, e.g. https://example.com/page';
        else {
          payload = v;
          if (payload.length > 800)
            warnings.push('Very long URL — keep codes printable at small sizes.');
        }
      }
      break;
    }
    case 'text': {
      const v = doc.content.text.trim();
      if (!v) errors.text = 'Text is required.';
      else {
        payload = doc.content.text;
        if (byteLength(payload) > 1000)
          warnings.push('Long text produces a dense QR — printing small may hurt scannability.');
      }
      break;
    }
    case 'email': {
      const { to, subject, body } = doc.content.email;
      const t = to.trim();
      if (!t) errors['email.to'] = 'Email address is required.';
      else if (!EMAIL_RE.test(t)) errors['email.to'] = 'Enter a valid email address.';
      else {
        const q: string[] = [];
        if (subject.trim()) q.push(`subject=${encodeURIComponent(subject.trim())}`);
        if (body.trim()) q.push(`body=${encodeURIComponent(body.trim())}`);
        payload = `mailto:${t}${q.length ? `?${q.join('&')}` : ''}`;
      }
      break;
    }
    case 'phone': {
      const v = doc.content.phone.number.trim();
      if (!v) errors['phone.number'] = 'Phone number is required.';
      else if (!validPhone(v)) errors['phone.number'] = 'Enter a valid phone number (5–15 digits, optional +).';
      else payload = `tel:${v.replace(/\s/g, '')}`;
      break;
    }
    case 'sms': {
      const { number, message } = doc.content.sms;
      const n = number.trim();
      if (!n) errors['sms.number'] = 'Phone number is required.';
      else if (!validPhone(n)) errors['sms.number'] = 'Enter a valid phone number (5–15 digits, optional +).';
      else {
        payload = `smsto:${n.replace(/\s/g, '')}${message ? `:${message}` : ''}`;
        if (message && message.length > 160)
          warnings.push(`Message is ${message.length} chars — carriers split it into multiple SMS parts.`);
      }
      break;
    }
    case 'wifi': {
      const { ssid, password, security, hidden } = doc.content.wifi;
      if (!ssid.trim()) errors['wifi.ssid'] = 'Network name (SSID) is required.';
      if (security !== 'nopass' && !password)
        errors['wifi.password'] = 'Password is required for WPA/WEP networks.';
      if (!errors['wifi.ssid'] && !errors['wifi.password']) {
        payload =
          `WIFI:T:${security === 'nopass' ? 'nopass' : security};` +
          `S:${escapeWifi(ssid.trim())};` +
          (security !== 'nopass' ? `P:${escapeWifi(password)};` : '') +
          `H:${hidden ? 'true' : ''};;`;
      }
      break;
    }
    case 'vcard': {
      const c = doc.content.vcard;
      const first = c.firstName.trim();
      const last = c.lastName.trim();
      if (!first && !last) errors['vcard.firstName'] = 'Enter at least a first name.';
      if (c.email.trim() && !EMAIL_RE.test(c.email.trim()))
        errors['vcard.email'] = 'Enter a valid email address.';
      if (!errors['vcard.firstName'] && !errors['vcard.email']) {
        const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
        lines.push(`N:${escapeVCard(last)};${escapeVCard(first)};;;`);
        lines.push(`FN:${escapeVCard([first, last].filter(Boolean).join(' '))}`);
        if (c.company.trim()) lines.push(`ORG:${escapeVCard(c.company.trim())}`);
        if (c.title.trim()) lines.push(`TITLE:${escapeVCard(c.title.trim())}`);
        if (c.phone.trim()) lines.push(`TEL:${c.phone.trim().replace(/\s/g, '')}`);
        if (c.email.trim()) lines.push(`EMAIL:${c.email.trim()}`);
        if (c.website.trim()) {
          let site = c.website.trim();
          if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(site)) site = `https://${site}`;
          lines.push(`URL:${site}`);
        }
        if (c.address.trim()) {
          const [street, cityZip, country] = c.address
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          lines.push(`ADR:;;${escapeVCard(street || '')};${escapeVCard(cityZip || '')};;${escapeVCard(country || '')}`);
        }
        lines.push('END:VCARD');
        payload = lines.join('\n');
      }
      break;
    }
    case 'event': {
      const e = doc.content.event;
      if (!e.title.trim()) errors['event.title'] = 'Event title is required.';
      if (!e.start) errors['event.start'] = 'Start date & time is required.';
      else if (!icsDatetime(e.start)) errors['event.start'] = 'Enter a valid date and time.';
      if (e.end && icsDatetime(e.start) && icsDatetime(e.end) && icsDatetime(e.end)! < icsDatetime(e.start)!)
        errors['event.end'] = 'End must be after the start.';
      if (!errors['event.title'] && !errors['event.start'] && !errors['event.end']) {
        const lines = ['BEGIN:VEVENT', `SUMMARY:${escapeVCard(e.title.trim())}`];
        lines.push(`DTSTART:${icsDatetime(e.start)}`);
        if (e.end && icsDatetime(e.end)) lines.push(`DTEND:${icsDatetime(e.end)}`);
        if (e.location.trim()) lines.push(`LOCATION:${escapeVCard(e.location.trim())}`);
        if (e.description.trim()) lines.push(`DESCRIPTION:${escapeVCard(e.description.trim().slice(0, 500))}`);
        lines.push('END:VEVENT');
        payload = lines.join('\n');
        if (!e.end) warnings.push('No end time set — the calendar entry will have no duration.');
      }
      break;
    }
  }

  const bytes = byteLength(payload);
  if (payload && bytes > 1200)
    warnings.push(`Payload is ${bytes} bytes — near the QR capacity limit. Scans may be less reliable.`);

  return { payload, errors, warnings };
}
