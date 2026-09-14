/** Core domain types for LumaQR Studio. Everything persists to localStorage as JSON. */

export type ContentType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'event';

export type DotStyle = 'square' | 'rounded' | 'soft' | 'pixel' | 'elegant';
export type EyeStyle = 'square' | 'rounded' | 'dot' | 'triangle' | 'triangle-rounded';
export type ECLevel = 'L' | 'M' | 'Q' | 'H';
export type MoodId =
  | 'minimal'
  | 'luxury'
  | 'tech'
  | 'playful'
  | 'nature'
  | 'editorial'
  | 'festival'
  | 'corporate';
export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';
export type MockupId = 'none' | 'phone' | 'card' | 'poster' | 'menu';
export type ScanLabel = 'Excellent' | 'Good' | 'Needs improvement';

export interface EmailContent {
  to: string;
  subject: string;
  body: string;
}
export interface PhoneContent {
  number: string;
}
export interface SmsContent {
  number: string;
  message: string;
}
export interface WifiContent {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
}
export interface VCardContent {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}
export interface EventContent {
  title: string;
  location: string;
  description: string;
  start: string; // datetime-local: YYYY-MM-DDTHH:mm
  end: string;
}

/** All content fields live on one object so switching types keeps data intact. */
export interface ContentState {
  url: string;
  text: string;
  email: EmailContent;
  phone: PhoneContent;
  sms: SmsContent;
  wifi: WifiContent;
  vcard: VCardContent;
  event: EventContent;
}

export interface GradientState {
  enabled: boolean;
  from: string;
  to: string;
  angle: number; // 0..359, 0 = left→right, 90 = top→bottom
}

export interface LogoState {
  dataUrl: string | null; // validated image data URL (downscaled ≤512px)
  percent: number; // 0.10..0.32 of QR width
  padding: number; // 0..0.4 fraction of logo box
  background: string;
  backgroundEnabled: boolean;
  opacity: number; // 0.2..1
}

/** Visual specification of the code. */
export interface DesignSpec {
  fg: string;
  bg: string;
  gradient: GradientState;
  transparentBg: boolean;
  dotStyle: DotStyle;
  eyeStyle: EyeStyle;
  radius: number; // 0..0.5 (fraction of module)
  size: number; // base render size in px
  margin: number; // quiet zone in modules, 0..10
  ec: ECLevel;
  logo: LogoState;
}

/** A full design document — content + design + metadata. */
export interface DesignDoc {
  id: string;
  name: string;
  type: ContentType;
  content: ContentState;
  design: DesignSpec;
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  exportSize: 512 | 1024 | 2048;
}
