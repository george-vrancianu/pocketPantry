import { createTheme } from '@mui/material/styles';
import type { CSSProperties, ElementType } from 'react';
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
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    stat: true;
    sectionLabel: true;
    meta: true;
  }
}

const { color, font, radius } = tokens;

export type ThemeOptions = {
  /** Component used when a button or link has an `href`, e.g. a router link. */
  linkComponent?: ElementType;
};

/** Breakpoints follow handoff section 9: phone < 600, 600-899, >= 900. */
export function createPocketPantryTheme({ linkComponent }: ThemeOptions = {}) {
  return createTheme({
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
    palette: {
      mode: 'light',
      primary: {
        main: color.accent,
        dark: color.accentHover,
        light: color.accentTint,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: color.butter,
        contrastText: color.butterInk,
      },
      error: { main: color.urgentFg, light: color.urgentBg },
      background: { default: color.bg, paper: color.surface },
      text: { primary: color.ink, secondary: color.muted },
      divider: color.line,
    },
    shape: { borderRadius: radius.input },
    typography: {
      fontFamily: font.body,
      fontSize: 15,
      htmlFontSize: 16,
      h1: {
        fontFamily: font.display,
        fontSize: 30,
        fontWeight: 700,
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: font.display,
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontFamily: font.display,
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 1.15,
      },
      h4: {
        fontFamily: font.display,
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1.15,
      },
      body1: { fontSize: 15, fontWeight: 500, lineHeight: 1.4 },
      body2: { fontSize: 15, fontWeight: 600, lineHeight: 1.4 },
      stat: {
        fontFamily: font.display,
        fontSize: 40,
        fontWeight: 700,
        lineHeight: 1,
      },
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
