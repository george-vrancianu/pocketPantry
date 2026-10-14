import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { Card } from '../atoms/Card';
import { tokens } from '../theme/tokens';

/** A centred card on the app background, for signed-out screens. */
export function CenteredLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: '20px',
        py: '32px',
        backgroundColor: tokens.color.bg,
      }}
    >
      <Card
        component="main"
        sx={{
          width: '100%',
          maxWidth: 420,
          boxSizing: 'border-box',
          p: '24px',
        }}
      >
        {children}
      </Card>
    </Box>
  );
}
