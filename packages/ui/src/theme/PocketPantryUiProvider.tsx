import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { useMemo, type ElementType, type ReactNode } from 'react';
import { createPocketPantryTheme } from './theme';
import { tokens, tokensAsCssVariables } from './tokens';

type Props = {
  children: ReactNode;
  /** Router link component so `href` props navigate client-side. */
  linkComponent?: ElementType;
};

const globalStyles = {
  ':root': tokensAsCssVariables(),
  body: { margin: 0, fontFamily: tokens.font.body, color: tokens.color.ink },
  // Handoff section 10: 2 px accent outline, 2 px offset.
  ':focus-visible': {
    outline: `2px solid ${tokens.color.accent}`,
    outlineOffset: 2,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '*, *::before, *::after': {
      animationDuration: '0.01ms !important',
      transitionDuration: '0.01ms !important',
    },
  },
};

export function PocketPantryUiProvider({ children, linkComponent }: Props) {
  const theme = useMemo(
    () => createPocketPantryTheme({ linkComponent }),
    [linkComponent],
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      {children}
    </ThemeProvider>
  );
}
