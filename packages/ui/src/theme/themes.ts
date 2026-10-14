/**
 * The three Themes, copied verbatim from the "Themes & icons" handoff
 * (docs/handoffs/themes/themes.ts) so future handoffs can be diffed against it.
 * Every Theme defines the same keys. This flat record is the single source of
 * truth: the MUI colour schemes, the `--pp-*` variables and the pre-paint
 * script are all built from it. One deliberate difference: `ThemeMeta` has no
 * `fonts.google` query, because the fonts are self-hosted (fonts.css).
 */

export const THEME_IDS = ['warm', 'minimal', 'dark'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export interface ThemeTokens {
  bg: string;
  surface: string;
  subtle: string;
  ink: string;
  muted: string;
  line: string;
  'line-strong': string;
  divider: string;
  chip: string;
  accent: string;
  'accent-ink': string;
  'accent-tint': string;
  'accent-on-tint': string;
  primary: string;
  'primary-ink': string;
  butter: string;
  'butter-ink': string;
  'urgent-bg': string;
  'urgent-fg': string;
  'soon-bg': string;
  'soon-fg': string;
  'ok-bg': string;
  'ok-fg': string;
  box: string;
  star: string;
  'card-bg': string;
  'card-line': string;
  'field-bg': string;
  'seg-on': string;
  'seg-on-ink': string;
  'toast-bg': string;
  'toast-ink': string;
  'toast-action': string;
  'dock-bg': string;
  bezel: string;
  bw: string;
  'bw-field': string;
  'r-card': string;
  'r-ctl': string;
  'r-chip': string;
  'r-fab': string;
  'r-dock': string;
  'r-box': string;
  'shadow-card': string;
  'shadow-btn': string;
  'shadow-float': string;
  'shadow-seg': string;
  display: string;
  body: string;
  'display-w': string;
  'display-ls': string;
}

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  scheme: 'light' | 'dark';
}

export const THEMES: Record<ThemeId, ThemeTokens> = {
  warm: {
    bg: '#F3EDE1',
    surface: '#FBF8F1',
    subtle: '#F6F1E6',
    ink: '#2B2418',
    muted: '#766A58',
    line: '#E6DCCB',
    'line-strong': '#D6C9B2',
    divider: '#EFE7D8',
    chip: '#EAE1CF',
    accent: '#5F6F2E',
    'accent-ink': '#FFFFFF',
    'accent-tint': '#E6EAD2',
    'accent-on-tint': '#4A5722',
    primary: '#5F6F2E',
    'primary-ink': '#FFFFFF',
    butter: '#F0C96B',
    'butter-ink': '#4A3608',
    'urgent-bg': '#F8DED1',
    'urgent-fg': '#A8431C',
    'soon-bg': '#F6E5BE',
    'soon-fg': '#704E00',
    'ok-bg': '#E6EAD2',
    'ok-fg': '#4A5722',
    box: '#C2B49A',
    star: '#C6882A',
    'card-bg': '#FBF8F1',
    'card-line': '#E9E0CF',
    'field-bg': '#FFFDF8',
    'seg-on': '#FBF8F1',
    'seg-on-ink': '#2B2418',
    'toast-bg': '#2B2418',
    'toast-ink': '#FBF8F1',
    'toast-action': '#F0C96B',
    'dock-bg': 'rgba(251,248,241,.94)',
    bezel: '#2B2418',
    bw: '1px',
    'bw-field': '1.5px',
    'r-card': '16px',
    'r-ctl': '12px',
    'r-chip': '999px',
    'r-fab': '50%',
    'r-dock': '22px',
    'r-box': '7px',
    'shadow-card':
      '0 1px 2px rgba(60,40,10,.06), 0 8px 24px -12px rgba(60,40,10,.18)',
    'shadow-btn': '0 4px 12px rgba(95,111,46,.28)',
    'shadow-float': '0 14px 34px -10px rgba(60,40,10,.28)',
    'shadow-seg': '0 1px 2px rgba(60,40,10,.14)',
    display: "'Fraunces',Georgia,'Times New Roman',serif",
    body: "'Instrument Sans',ui-sans-serif,system-ui,sans-serif",
    'display-w': '600',
    'display-ls': '-0.015em',
  },
  minimal: {
    bg: '#FAFAF8',
    surface: '#FFFFFF',
    subtle: '#F3F4F1',
    ink: '#141614',
    muted: '#6B716B',
    line: '#E7E9E4',
    'line-strong': '#CDD1CA',
    divider: '#EEF0EB',
    chip: '#EEF0EB',
    accent: '#1E7A4E',
    'accent-ink': '#FFFFFF',
    'accent-tint': '#E1F2E8',
    'accent-on-tint': '#176040',
    primary: '#141614',
    'primary-ink': '#FFFFFF',
    butter: '#F5E1A4',
    'butter-ink': '#5A4200',
    'urgent-bg': '#FDE8E2',
    'urgent-fg': '#B33A1E',
    'soon-bg': '#FBF0CC',
    'soon-fg': '#7A5600',
    'ok-bg': '#EEF0EB',
    'ok-fg': '#4D534D',
    box: '#B9BEB8',
    star: '#D1A21C',
    'card-bg': '#FFFFFF',
    'card-line': '#E7E9E4',
    'field-bg': '#FFFFFF',
    'seg-on': '#141614',
    'seg-on-ink': '#FFFFFF',
    'toast-bg': '#141614',
    'toast-ink': '#FFFFFF',
    'toast-action': '#9BE0B8',
    'dock-bg': 'rgba(255,255,255,.96)',
    bezel: '#141614',
    bw: '1px',
    'bw-field': '1px',
    'r-card': '12px',
    'r-ctl': '10px',
    'r-chip': '8px',
    'r-fab': '12px',
    'r-dock': '16px',
    'r-box': '6px',
    'shadow-card': 'none',
    'shadow-btn': 'none',
    'shadow-float': '0 8px 24px rgba(20,22,20,.10)',
    'shadow-seg': 'none',
    display: "'Schibsted Grotesk',ui-sans-serif,system-ui,sans-serif",
    body: "'Figtree',ui-sans-serif,system-ui,sans-serif",
    'display-w': '700',
    'display-ls': '-0.025em',
  },
  dark: {
    bg: '#0F1512',
    surface: '#19211C',
    subtle: '#1F2922',
    ink: '#ECF2EC',
    muted: '#97A69B',
    line: '#26312A',
    'line-strong': '#36433A',
    divider: '#27322B',
    chip: '#26312A',
    accent: '#8FE0A8',
    'accent-ink': '#0B1A10',
    'accent-tint': '#1F3A2A',
    'accent-on-tint': '#A9EDBD',
    primary: '#8FE0A8',
    'primary-ink': '#0B1A10',
    butter: '#3D3418',
    'butter-ink': '#F2CF72',
    'urgent-bg': '#3F241B',
    'urgent-fg': '#FFA27E',
    'soon-bg': '#3A3118',
    'soon-fg': '#F2CF72',
    'ok-bg': '#26312A',
    'ok-fg': '#B9C7BC',
    box: '#4A574E',
    star: '#F2CF72',
    'card-bg': '#19211C',
    'card-line': 'transparent',
    'field-bg': '#111915',
    'seg-on': '#2A3730',
    'seg-on-ink': '#ECF2EC',
    'toast-bg': '#ECF2EC',
    'toast-ink': '#0F1512',
    'toast-action': '#1E7A4E',
    'dock-bg': 'rgba(25,33,28,.9)',
    bezel: '#050807',
    bw: '1px',
    'bw-field': '1px',
    'r-card': '18px',
    'r-ctl': '14px',
    'r-chip': '999px',
    'r-fab': '16px',
    'r-dock': '24px',
    'r-box': '7px',
    'shadow-card':
      '0 1px 0 rgba(255,255,255,.04) inset, 0 10px 30px -12px rgba(0,0,0,.6)',
    'shadow-btn': '0 6px 18px rgba(143,224,168,.25)',
    'shadow-float': '0 16px 40px rgba(0,0,0,.55)',
    'shadow-seg': '0 1px 0 rgba(255,255,255,.06) inset',
    display: "'Sora',ui-sans-serif,system-ui,sans-serif",
    body: "'Albert Sans',ui-sans-serif,system-ui,sans-serif",
    'display-w': '600',
    'display-ls': '-0.02em',
  },
};

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  warm: {
    id: 'warm',
    name: 'Warm editorial',
    scheme: 'light',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal crisp',
    scheme: 'light',
  },
  dark: {
    id: 'dark',
    name: 'Dark-first',
    scheme: 'dark',
  },
};
