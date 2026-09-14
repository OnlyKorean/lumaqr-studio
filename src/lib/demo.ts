import type { ContentState, DesignDoc, DesignSpec } from '../types/design';
import { uid } from './utils';

export function emptyContent(): ContentState {
  return {
    url: '',
    text: '',
    email: { to: '', subject: '', body: '' },
    phone: { number: '' },
    sms: { number: '', message: '' },
    wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
    vcard: { firstName: '', lastName: '', company: '', title: '', phone: '', email: '', website: '', address: '' },
    event: { title: '', location: '', description: '', start: '', end: '' },
  };
}

export function defaultDesign(): DesignSpec {
  return {
    fg: '#7C3AED',
    bg: '#FFFFFF',
    gradient: { enabled: false, from: '#7C3AED', to: '#22D3EE', angle: 135 },
    transparentBg: false,
    dotStyle: 'rounded',
    eyeStyle: 'rounded',
    radius: 0.3,
    size: 512,
    margin: 4,
    ec: 'M',
    logo: {
      dataUrl: null,
      percent: 0.2,
      padding: 0.12,
      background: '#FFFFFF',
      backgroundEnabled: true,
      opacity: 1,
    },
  };
}

/** First-launch working demo: LumaQR Demo — Tech mood, electric violet, rounded dots on white. */
export function makeDemoDoc(): DesignDoc {
  const now = Date.now();
  return {
    id: 'lumaqr-demo',
    name: 'LumaQR Demo',
    type: 'url',
    content: { ...emptyContent(), url: 'https://example.com/lumaqr' },
    design: defaultDesign(),
    createdAt: now,
    updatedAt: now,
    favorite: false,
  };
}

export function makeBlankDoc(name = 'Untitled design'): DesignDoc {
  const now = Date.now();
  return {
    id: uid(),
    name,
    type: 'url',
    content: emptyContent(),
    design: defaultDesign(),
    createdAt: now,
    updatedAt: now,
    favorite: false,
  };
}
