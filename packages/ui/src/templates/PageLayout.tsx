import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { tokens } from '../theme/tokens';

export type PageLayoutProps = {
  children: ReactNode;
  /** Reserve room at the bottom so content never hides under the Dock. */
  withDock?: boolean;
  /** Full-bleed dark background for the camera screen. */
  dark?: boolean;
};

/** Page frame: 20 px gutters on phones, 48 px on wide screens, content capped at ~960 px. */
export function PageLayout({
  children,
  withDock = true,
  dark = false,
}: PageLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        backgroundColor: dark ? tokens.color.cameraBg : tokens.color.bg,
        color: dark ? '#FFFFFF' : tokens.color.ink,
        px: { xs: '20px', md: '48px' },
        pb: withDock ? '110px' : '24px',
      }}
    >
      <Box component="main" sx={{ maxWidth: 960, mx: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}
