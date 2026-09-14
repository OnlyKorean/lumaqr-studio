import { useState } from 'react';
import {
  CalendarDays,
  ClipboardPaste,
  Contact,
  Link,
  Mail,
  MessageSquareText,
  Phone,
  ShieldQuestion,
  Type,
  Wifi,
} from 'lucide-react';
import type { ContentState, ContentType, DesignDoc } from '../../types/design';
import { useDesign } from '../../store/designStore';
import type { PayloadResult } from '../../lib/payload';
import { Field, Input, Select, TextArea } from '../ui/Field';
import { Switch } from '../ui/Switch';
import { Panel, Badge } from '../ui/misc';
import { cx } from '../../lib/utils';

const TYPES: Array<{ id: ContentType; label: string; icon: React.ReactNode; hint: string }> = [
  { id: 'url', label: 'URL', icon: <Link size={15} aria-hidden />, hint: 'Website or link' },
  { id: 'text', label: 'Text', icon: <Type size={15} aria-hidden />, hint: 'Plain text' },
  { id: 'email', label: 'Email', icon: <Mail size={15} aria-hidden />, hint: 'mailto with subject/body' },
  { id: 'phone', label: 'Phone', icon: <Phone size={15} aria-hidden />, hint: 'tap-to-call number' },
  { id: 'sms', label: 'SMS', icon: <MessageSquareText size={15} aria-hidden />, hint: 'pre-filled text message' },
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi size={15} aria-hidden />, hint: 'network credentials' },
  { id: 'vcard', label: 'vCard', icon: <Contact size={15} aria-hidden />, hint: 'contact card' },
  { id: 'event', label: 'Event', icon: <CalendarDays size={15} aria-hidden />, hint: 'calendar entry' },
];

async function pasteInto(setter: (v: string) => void): Promise<void> {
  try {
    const text = await navigator.clipboard.readText();
    if (text) setter(text);
  } catch {
    throw new Error('Clipboard access was blocked — paste manually with Ctrl/Cmd+V.');
  }
}

export function ContentPanel({ doc, result }: { doc: DesignDoc; result: PayloadResult }) {
  const { set } = useDesign();
  const [pasteErr, setPasteErr] = useState<string | null>(null);

  const setContent = (patch: Partial<ContentState> | ((c: ContentState) => ContentState), key: string) => {
    set((d) => ({
      ...d,
      content: typeof patch === 'function' ? patch(d.content) : { ...d.content, ...patch },
    }), { key });
  };

  const onPaste = async (setter: (v: string) => void) => {
    setPasteErr(null);
    try {
      await pasteInto(setter);
    } catch (e) {
      setPasteErr(e instanceof Error ? e.message : 'Clipboard unavailable.');
    }
  };

  const pasteBtn = (setter: (v: string) => void) => (
    <button
      type="button"
      onClick={() => onPaste(setter)}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-slate-400 transition hover:bg-black/5 hover:text-brand-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan dark:hover:bg-white/10 dark:hover:text-brand-cyan"
    >
      <ClipboardPaste size={12} aria-hidden /> Paste
    </button>
  );

  const { errors, warnings, payload } = result;
  const c = doc.content;

  return (
    <Panel title="Content" hint="what the code encodes">
      <div role="tablist" aria-label="Content type" className="mb-4 grid grid-cols-4 gap-1.5">
        {TYPES.map((t) => {
          const active = doc.type === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              title={t.hint}
              onClick={() => set((d) => ({ ...d, type: t.id }), { key: 'type', force: true })}
              className={cx(
                'flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-medium transition-all duration-150',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan',
                active
                  ? 'border-brand-violet/50 bg-brand-violet/10 text-brand-violet shadow-[0_0_0_1px_rgba(124,58,237,0.2)] dark:text-violet-300'
                  : 'border-transparent text-slate-500 hover:bg-black/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white',
              )}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3.5">
        {doc.type === 'url' && (
          <Field
            label="URL"
            error={errors.url}
            labelExtra={pasteBtn((v) => setContent({ url: v }, 'content.url'))}
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={!!errors.url}
                invalid={!!errors.url}
                placeholder="https://example.com/lumaqr"
                value={c.url}
                onChange={(e) => setContent({ url: e.target.value }, 'content.url')}
                inputMode="url"
                spellCheck={false}
              />
            )}
          </Field>
        )}

        {doc.type === 'text' && (
          <Field
            label="Text"
            error={errors.text}
            hint={`${c.text.length} characters`}
            labelExtra={pasteBtn((v) => setContent({ text: v }, 'content.text'))}
          >
            {({ id, describedBy }) => (
              <TextArea
                id={id}
                aria-describedby={describedBy}
                aria-invalid={!!errors.text}
                invalid={!!errors.text}
                rows={4}
                placeholder="Type anything — a quote, directions, a secret recipe…"
                value={c.text}
                onChange={(e) => setContent({ text: e.target.value }, 'content.text')}
              />
            )}
          </Field>
        )}

        {doc.type === 'email' && (
          <>
            <Field
              label="Email address"
              error={errors['email.to']}
              labelExtra={pasteBtn((v) => setContent({ email: { ...c.email, to: v } }, 'content.email.to'))}
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={!!errors['email.to']}
                  invalid={!!errors['email.to']}
                  placeholder="hello@brand.com"
                  value={c.email.to}
                  onChange={(e) => setContent({ email: { ...c.email, to: e.target.value } }, 'content.email.to')}
                  inputMode="email"
                />
              )}
            </Field>
            <Field label="Subject (optional)">
              {({ id }) => (
                <Input
                  id={id}
                  placeholder="Let's talk"
                  value={c.email.subject}
                  onChange={(e) => setContent({ email: { ...c.email, subject: e.target.value } }, 'content.email.subject')}
                />
              )}
            </Field>
            <Field label="Body (optional)">
              {({ id }) => (
                <TextArea
                  id={id}
                  rows={3}
                  placeholder="Hi there…"
                  value={c.email.body}
                  onChange={(e) => setContent({ email: { ...c.email, body: e.target.value } }, 'content.email.body')}
                />
              )}
            </Field>
          </>
        )}

        {doc.type === 'phone' && (
          <Field
            label="Phone number"
            error={errors['phone.number']}
            hint="Include country code for best results, e.g. +1 415 555 0134"
            labelExtra={pasteBtn((v) => setContent({ phone: { number: v } }, 'content.phone.number'))}
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={!!errors['phone.number']}
                invalid={!!errors['phone.number']}
                placeholder="+1 415 555 0134"
                value={c.phone.number}
                onChange={(e) => setContent({ phone: { number: e.target.value } }, 'content.phone.number')}
                inputMode="tel"
              />
            )}
          </Field>
        )}

        {doc.type === 'sms' && (
          <>
            <Field
              label="Phone number"
              error={errors['sms.number']}
              labelExtra={pasteBtn((v) => setContent({ sms: { ...c.sms, number: v } }, 'content.sms.number'))}
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={!!errors['sms.number']}
                  invalid={!!errors['sms.number']}
                  placeholder="+1 415 555 0134"
                  value={c.sms.number}
                  onChange={(e) => setContent({ sms: { ...c.sms, number: e.target.value } }, 'content.sms.number')}
                  inputMode="tel"
                />
              )}
            </Field>
            <Field
              label="Message (optional)"
              error={errors['sms.message']}
              hint={`${c.sms.message.length} characters · 160 = one SMS part (GSM)`}
              labelExtra={pasteBtn((v) => setContent({ sms: { ...c.sms, message: v } }, 'content.sms.message'))}
            >
              {({ id, describedBy }) => (
                <TextArea
                  id={id}
                  aria-describedby={describedBy}
                  rows={3}
                  placeholder="Hi! I'd like to book a table…"
                  value={c.sms.message}
                  onChange={(e) => setContent({ sms: { ...c.sms, message: e.target.value } }, 'content.sms.message')}
                />
              )}
            </Field>
          </>
        )}

        {doc.type === 'wifi' && (
          <>
            <Field label="Network name (SSID)" error={errors['wifi.ssid']}>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={!!errors['wifi.ssid']}
                  invalid={!!errors['wifi.ssid']}
                  placeholder="LumaQR Guest"
                  value={c.wifi.ssid}
                  onChange={(e) => setContent({ wifi: { ...c.wifi, ssid: e.target.value } }, 'content.wifi.ssid')}
                />
              )}
            </Field>
            <Field
              label="Password"
              error={errors['wifi.password']}
              hint={c.wifi.security === 'nopass' ? 'Not needed for open networks' : undefined}
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={!!errors['wifi.password']}
                  invalid={!!errors['wifi.password']}
                  type="text"
                  placeholder="••••••••"
                  value={c.wifi.password}
                  disabled={c.wifi.security === 'nopass'}
                  onChange={(e) => setContent({ wifi: { ...c.wifi, password: e.target.value } }, 'content.wifi.password')}
                  autoComplete="off"
                />
              )}
            </Field>
            <Field label="Security type">
              {({ id }) => (
                <Select
                  id={id}
                  value={c.wifi.security}
                  onChange={(e) =>
                    setContent(
                      { wifi: { ...c.wifi, security: e.target.value as ContentState['wifi']['security'] } },
                      'content.wifi.security',
                    )
                  }
                >
                  <option value="WPA">WPA / WPA2 / WPA3 (most common)</option>
                  <option value="WEP">WEP (legacy)</option>
                  <option value="nopass">Open (no password)</option>
                </Select>
              )}
            </Field>
            <Switch
              label="Hidden network"
              hint="Tick if the network doesn't broadcast its name"
              checked={c.wifi.hidden}
              onChange={(v) => setContent({ wifi: { ...c.wifi, hidden: v } }, 'content.wifi.hidden')}
            />
          </>
        )}

        {doc.type === 'vcard' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" error={errors['vcard.firstName']}>
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!errors['vcard.firstName']}
                    invalid={!!errors['vcard.firstName']}
                    placeholder="Ava"
                    value={c.vcard.firstName}
                    onChange={(e) => setContent({ vcard: { ...c.vcard, firstName: e.target.value } }, 'content.vcard.firstName')}
                  />
                )}
              </Field>
              <Field label="Last name">
                {({ id }) => (
                  <Input
                    id={id}
                    placeholder="Chen"
                    value={c.vcard.lastName}
                    onChange={(e) => setContent({ vcard: { ...c.vcard, lastName: e.target.value } }, 'content.vcard.lastName')}
                  />
                )}
              </Field>
            </div>
            <Field label="Company">
              {({ id }) => (
                <Input
                  id={id}
                  placeholder="Northwind Studio"
                  value={c.vcard.company}
                  onChange={(e) => setContent({ vcard: { ...c.vcard, company: e.target.value } }, 'content.vcard.company')}
                />
              )}
            </Field>
            <Field label="Job title">
              {({ id }) => (
                <Input
                  id={id}
                  placeholder="Creative Director"
                  value={c.vcard.title}
                  onChange={(e) => setContent({ vcard: { ...c.vcard, title: e.target.value } }, 'content.vcard.title')}
                />
              )}
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Phone">
                {({ id }) => (
                  <Input
                    id={id}
                    inputMode="tel"
                    placeholder="+1 415 555 0134"
                    value={c.vcard.phone}
                    onChange={(e) => setContent({ vcard: { ...c.vcard, phone: e.target.value } }, 'content.vcard.phone')}
                  />
                )}
              </Field>
              <Field label="Email" error={errors['vcard.email']}>
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!errors['vcard.email']}
                    invalid={!!errors['vcard.email']}
                    placeholder="ava@northwind.studio"
                    value={c.vcard.email}
                    onChange={(e) => setContent({ vcard: { ...c.vcard, email: e.target.value } }, 'content.vcard.email')}
                  />
                )}
              </Field>
            </div>
            <Field label="Website">
              {({ id }) => (
                <Input
                  id={id}
                  inputMode="url"
                  placeholder="https://northwind.studio"
                  value={c.vcard.website}
                  onChange={(e) => setContent({ vcard: { ...c.vcard, website: e.target.value } }, 'content.vcard.website')}
                />
              )}
            </Field>
            <Field label="Address" hint="Street, City & Zip, Country — comma separated">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder="500 Market St, San Francisco CA 94105, USA"
                  value={c.vcard.address}
                  onChange={(e) => setContent({ vcard: { ...c.vcard, address: e.target.value } }, 'content.vcard.address')}
                />
              )}
            </Field>
          </>
        )}

        {doc.type === 'event' && (
          <>
            <Field label="Event title" error={errors['event.title']}>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={!!errors['event.title']}
                  invalid={!!errors['event.title']}
                  placeholder="Summer Sound Fest 2026"
                  value={c.event.title}
                  onChange={(e) => setContent({ event: { ...c.event, title: e.target.value } }, 'content.event.title')}
                />
              )}
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Starts" error={errors['event.start']}>
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!errors['event.start']}
                    invalid={!!errors['event.start']}
                    type="datetime-local"
                    value={c.event.start}
                    onChange={(e) => setContent({ event: { ...c.event, start: e.target.value } }, 'content.event.start')}
                  />
                )}
              </Field>
              <Field label="Ends (optional)" error={errors['event.end']}>
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!errors['event.end']}
                    invalid={!!errors['event.end']}
                    type="datetime-local"
                    value={c.event.end}
                    onChange={(e) => setContent({ event: { ...c.event, end: e.target.value } }, 'content.event.end')}
                  />
                )}
              </Field>
            </div>
            <Field label="Location">
              {({ id }) => (
                <Input
                  id={id}
                  placeholder="Riverside Park, Main Stage"
                  value={c.event.location}
                  onChange={(e) => setContent({ event: { ...c.event, location: e.target.value } }, 'content.event.location')}
                />
              )}
            </Field>
            <Field label="Description (optional)" hint="Times are stored as local floating time (no timezone).">
              {({ id }) => (
                <TextArea
                  id={id}
                  rows={3}
                  placeholder="Gates open at 4 PM…"
                  value={c.event.description}
                  onChange={(e) => setContent({ event: { ...c.event, description: e.target.value } }, 'content.event.description')}
                />
              )}
            </Field>
          </>
        )}
      </div>

      {(warnings.length > 0 || pasteErr) && (
        <div className="mt-4 space-y-2">
          {pasteErr && (
            <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-300">
              {pasteErr}
            </p>
          )}
          {warnings.map((w) => (
            <p
              key={w}
              className="flex items-start gap-1.5 rounded-lg bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300"
            >
              <ShieldQuestion size={13} className="mt-0.5 shrink-0" aria-hidden />
              {w}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-xl bg-black/[0.03] px-3 py-2.5 dark:bg-white/5">
        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span className="font-semibold uppercase tracking-wider">Payload</span>
          <span className="flex items-center gap-1.5">
            {payload ? <Badge tone="lime">{payload.length} chars</Badge> : <Badge tone="rose">invalid</Badge>}
          </span>
        </div>
        <p className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400" aria-live="polite">
          {payload || '—'}
        </p>
      </div>
    </Panel>
  );
}
