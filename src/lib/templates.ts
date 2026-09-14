import type { ContentState, ContentType, DesignDoc, DesignSpec, DotStyle, ECLevel, EyeStyle, MockupId } from '../types/design';
import { emptyContent } from './demo';

export type TemplateCategory = 'Branding' | 'Food & Drink' | 'Events' | 'Business' | 'Digital';

export interface TemplateDef {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  type: ContentType;
  content: Partial<ContentState>;
  design: {
    fg: string;
    bg: string;
    dotStyle: DotStyle;
    gradient?: { from: string; to: string; angle: number };
    eyeStyle?: EyeStyle;
    radius?: number;
    margin?: number;
    ec?: ECLevel;
  };
  mockup?: MockupId;
}

const c = (partial: Partial<ContentState>): ContentState => ({ ...emptyContent(), ...partial });

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    category: 'Food & Drink',
    description: 'Warm terracotta on cream with elegant dots — print on the table.',
    type: 'url',
    content: c({ url: 'https://example.com/menu' }),
    design: { fg: '#9A3412', bg: '#FFF7ED', dotStyle: 'elegant', eyeStyle: 'dot', margin: 5 },
    mockup: 'menu',
  },
  {
    id: 'instagram-profile',
    name: 'Instagram Profile',
    category: 'Digital',
    description: 'Violet gradient for links-in-bio cards and story stickers.',
    type: 'url',
    content: c({ url: 'https://instagram.com/yourbrand' }),
    design: {
      fg: '#7C3AED',
      bg: '#FFFFFF',
      dotStyle: 'rounded',
      radius: 0.35,
      gradient: { from: '#7C3AED', to: '#22D3EE', angle: 135 },
    },
    mockup: 'phone',
  },
  {
    id: 'event-ticket',
    name: 'Event Ticket',
    category: 'Events',
    description: 'Neon gradient on deep navy — a ticket stub people keep.',
    type: 'event',
    content: c({
      event: {
        title: 'Summer Sound Fest 2026',
        location: 'Riverside Park, Main Stage',
        description: 'Gates open 4 PM. Bring your own water bottle.',
        start: '2026-07-18T16:00',
        end: '2026-07-18T23:00',
      },
    }),
    design: {
      fg: '#22D3EE',
      bg: '#0B1020',
      dotStyle: 'soft',
      radius: 0.4,
      ec: 'H',
      gradient: { from: '#22D3EE', to: '#A3E635', angle: 135 },
    },
    mockup: 'poster',
  },
  {
    id: 'product-packaging',
    name: 'Product Packaging',
    category: 'Branding',
    description: 'Crisp monochrome that survives small print and labels.',
    type: 'url',
    content: c({ url: 'https://example.com/product' }),
    design: { fg: '#0B1020', bg: '#FFFFFF', dotStyle: 'square', margin: 6, ec: 'H' },
  },
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'Business',
    description: 'A real vCard with your details — deep corporate blue.',
    type: 'vcard',
    content: c({
      vcard: {
        firstName: 'Ava',
        lastName: 'Chen',
        company: 'Northwind Studio',
        title: 'Creative Director',
        phone: '+1 415 555 0134',
        email: 'ava@northwind.studio',
        website: 'https://northwind.studio',
        address: '500 Market St, San Francisco CA 94105, USA',
      },
    }),
    design: { fg: '#1E3A8A', bg: '#F8FAFC', dotStyle: 'rounded', eyeStyle: 'rounded', radius: 0.25, margin: 5 },
    mockup: 'card',
  },
  {
    id: 'wifi-card',
    name: 'Wi-Fi Card',
    category: 'Food & Drink',
    description: 'Guests connect in one scan — tech lime on obsidian.',
    type: 'wifi',
    content: c({ wifi: { ssid: 'LumaQR Guest', password: 'welcome2026', security: 'WPA', hidden: false } }),
    design: { fg: '#A3E635', bg: '#0B1020', dotStyle: 'pixel', ec: 'H' },
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    category: 'Branding',
    description: 'Gold on cream, editorial spacing — for listing placards.',
    type: 'url',
    content: c({ url: 'https://example.com/properties/listing-42' }),
    design: { fg: '#A16207', bg: '#FBF7EF', dotStyle: 'elegant', eyeStyle: 'dot', margin: 6 },
    mockup: 'poster',
  },
  {
    id: 'digital-invitation',
    name: 'Digital Invitation',
    category: 'Events',
    description: 'An iCalendar event in a refined ink-on-paper style.',
    type: 'event',
    content: c({
      event: {
        title: "Ava & Noah's Wedding",
        location: 'The Glasshouse, Hillside Avenue',
        description: 'Please RSVP by June 1st. Dinner at 7, dancing until late.',
        start: '2026-08-22T17:00',
        end: '2026-08-22T23:00',
      },
    }),
    design: { fg: '#18181B', bg: '#FAFAF9', dotStyle: 'elegant', margin: 6, ec: 'H' },
    mockup: 'poster',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    category: 'Digital',
    description: 'Minimal ink on white — the quietest code you can link.',
    type: 'url',
    content: c({ url: 'https://example.com/portfolio' }),
    design: { fg: '#111827', bg: '#FFFFFF', dotStyle: 'square', margin: 6 },
    mockup: 'card',
  },
  {
    id: 'payment',
    name: 'Payment',
    category: 'Business',
    description: 'Corporate blue linking your payment page. High EC for reliability.',
    type: 'url',
    content: c({ url: 'https://example.com/pay/yourbrand' }),
    design: { fg: '#1D4ED8', bg: '#FFFFFF', dotStyle: 'rounded', radius: 0.3, ec: 'H', margin: 5 },
  },
  {
    id: 'feedback-form',
    name: 'Feedback Form',
    category: 'Digital',
    description: 'Playful coral to make asking for feedback feel friendly.',
    type: 'url',
    content: c({ url: 'https://example.com/feedback' }),
    design: { fg: '#E11D48', bg: '#FFF1F2', dotStyle: 'soft', eyeStyle: 'dot', radius: 0.5 },
    mockup: 'phone',
  },
];

export function buildTemplateDoc(t: TemplateDef): DesignDoc {
  const now = Date.now();
  const d = t.design;
  const design: DesignSpec = {
    fg: d.fg,
    bg: d.bg,
    gradient: d.gradient ? { enabled: true, ...d.gradient } : { enabled: false, from: d.fg, to: '#22D3EE', angle: 135 },
    transparentBg: false,
    dotStyle: d.dotStyle,
    eyeStyle: d.eyeStyle ?? 'square',
    radius: d.radius ?? 0.3,
    size: 512,
    margin: d.margin ?? 4,
    ec: d.ec ?? 'M',
    logo: { dataUrl: null, percent: 0.2, padding: 0.12, background: d.bg, backgroundEnabled: true, opacity: 1 },
  };
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: t.name,
    type: t.type,
    content: c(t.content),
    design,
    createdAt: now,
    updatedAt: now,
    favorite: false,
  };
}
