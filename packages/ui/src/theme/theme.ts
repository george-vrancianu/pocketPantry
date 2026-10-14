import {
  createColorScheme,
  createTheme,
  type PaletteOptions,
} from '@mui/material/styles';
import type { CSSProperties, ElementType } from 'react';
import {
  THEME_IDS,
  THEME_META,
  THEMES,
  type ThemeId,
  type ThemeTokens,
} from './themes';
import { tokens } from './tokens';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    stat: CSSProperties;
    sectionLabel: CSSProperties;
    meta: CSSProperties;
  }
  interface TypographyVariantsOptions {
    stat?: CSSProperties;
    sectionLabel?: CSSProperties;
    meta?: CSSProperties;
  }
  /** Handoff colour tokens with no standard MUI palette key, emitted as `--mui-palette-pp-<key>`. */
  interface PpPalette {
    subtle: string;
    line: string;
    lineStrong: string;
    chip: string;
    accent: string;
    accentInk: string;
    accentTint: string;
    accentOnTint: string;
    box: string;
    star: string;
    cardBg: string;
    cardLine: string;
    fieldBg: string;
    segOn: string;
    segOnInk: string;
    toastBg: string;
    toastInk: string;
    toastAction: string;
    dockBg: string;
    bezel: string;
  }
  interface Palette {
    pp: PpPalette;
  }
  interface PaletteOptions {
    pp?: PpPalette;
  }
  /** The three Themes are MUI colour schemes; `dark` is MUI's built-in name. */
  interface ColorSchemeOverrides {
    warm: true;
    minimal: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    stat: true;
    sectionLabel: true;
    meta: true;
  }
}

const { color, radius } = tokens;

/** One Theme's palette: the matching handoff tokens in MUI's standard keys, the rest under `pp`. */
function schemePalette(id: ThemeId): PaletteOptions {
  const t = THEMES[id];
  return {
    mode: THEME_META[id].scheme,
    primary: {
      main: t.primary,
      light: t['accent-tint'],
      contrastText: t['primary-ink'],
    },
    secondary: { main: t.butter, contrastText: t['butter-ink'] },
    error: { main: t['urgent-fg'], light: t['urgent-bg'] },
    warning: { main: t['soon-fg'], light: t['soon-bg'] },
    success: { main: t['ok-fg'], light: t['ok-bg'] },
    background: { default: t.bg, paper: t.surface },
    text: { primary: t.ink, secondary: t.muted },
    divider: t.divider,
    pp: {
      subtle: t.subtle,
      line: t.line,
      lineStrong: t['line-strong'],
      chip: t.chip,
      accent: t.accent,
      accentInk: t['accent-ink'],
      accentTint: t['accent-tint'],
      accentOnTint: t['accent-on-tint'],
      box: t.box,
      star: t.star,
      cardBg: t['card-bg'],
      cardLine: t['card-line'],
      fieldBg: t['field-bg'],
      segOn: t['seg-on'],
      segOnInk: t['seg-on-ink'],
      toastBg: t['toast-bg'],
      toastInk: t['toast-ink'],
      toastAction: t['toast-action'],
      dockBg: t['dock-bg'],
      bezel: t.bezel,
    },
  };
}

/** The handoff's non-colour tokens, written per Theme as `--pp-<key>`: MUI doesn't vary these per scheme. */
const NON_COLOUR_TOKENS = [
  'bw',
  'bw-field',
  'r-card',
  'r-ctl',
  'r-chip',
  'r-fab',
  'r-dock',
  'r-box',
  'shadow-card',
  'shadow-btn',
  'shadow-float',
  'shadow-seg',
  'display',
  'body',
  'display-w',
  'display-ls',
] as const satisfies readonly (keyof ThemeTokens)[];

/** The attribute selector that puts the root, or any subtree, into a Theme. */
export function themeSelector(id: ThemeId | '%s') {
  return `[data-theme="${id}"]`;
}

/** `--pp-*` variables per Theme selector; Warm editorial is also the `:root` default. */
export function ppCssVariables(): Record<string, Record<string, string>> {
  const styles: Record<string, Record<string, string>> = {};
  for (const id of THEME_IDS) {
    const vars: Record<string, string> = {};
    for (const key of NON_COLOUR_TOKENS) vars[`--pp-${key}`] = THEMES[id][key];
    const selector =
      id === 'warm' ? `:root, ${themeSelector(id)}` : themeSelector(id);
    styles[selector] = vars;
  }
  return styles;
}

/** Display type follows the Theme's display face, weight and tracking. */
const display = {
  fontFamily: 'var(--pp-display)',
  fontWeight: 'var(--pp-display-w)',
  letterSpacing: 'var(--pp-display-ls)',
} as const;

export type ThemeOptions = {
  /** Component used when a button or link has an `href`, e.g. a router link. */
  linkComponent?: ElementType;
};

/**
 * The three Themes as MUI colour schemes over CSS variables. The active one is
 * picked by `data-theme` on the root, or on any subtree to force it there.
 * Breakpoints follow handoff section 9: phone < 600, 600-899, >= 900.
 */
export function createPocketPantryTheme({ linkComponent }: ThemeOptions = {}) {
  return createTheme({
    cssVariables: {
      colorSchemeSelector: themeSelector('%s'),
      cssVarPrefix: 'mui',
    },
    colorSchemes: {
      warm: { palette: schemePalette('warm') },
      // MUI only builds the palettes of the default scheme and of the built-in
      // `light`/`dark`; any other custom scheme must arrive already built.
      minimal: createColorScheme({ palette: schemePalette('minimal') }),
      dark: { palette: schemePalette('dark') },
    },
    defaultColorScheme: 'warm',
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
    shape: { borderRadius: radius.input },
    typography: {
      fontFamily: 'var(--pp-body)',
      fontSize: 15,
      htmlFontSize: 16,
      h1: { ...display, fontSize: 30, lineHeight: 1.05 },
      h2: { ...display, fontSize: 28, lineHeight: 1.1 },
      h3: { ...display, fontSize: 22, lineHeight: 1.15 },
      h4: { ...display, fontSize: 20, lineHeight: 1.15 },
      body1: { fontSize: 15, fontWeight: 500, lineHeight: 1.4 },
      body2: { fontSize: 15, fontWeight: 600, lineHeight: 1.4 },
      stat: { ...display, fontSize: 40, lineHeight: 1 },
      meta: { fontSize: 13, fontWeight: 500, lineHeight: 1.4 },
      caption: { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },
      sectionLabel: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: 1.4,
      },
      button: { fontSize: 15, fontWeight: 700, textTransform: 'none' },
    },
    components: {
      ...(linkComponent
        ? {
            MuiButtonBase: { defaultProps: { LinkComponent: linkComponent } },
            MuiLink: { defaultProps: { component: linkComponent } },
          }
        : {}),
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            stat: 'p',
            meta: 'p',
            sectionLabel: 'p',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'background-color 200ms, color 200ms, box-shadow 200ms',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.input,
            backgroundColor: color.surface,
            minHeight: 48,
            fontWeight: 500,
          },
          notchedOutline: { borderColor: color.line },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: radius.input, fontWeight: 500 },
        },
      },
    },
  });
}
