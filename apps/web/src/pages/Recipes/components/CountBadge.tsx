import { Box, tokens } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';

/**
 * A small pill holding a number: the Tags button's count (`solid`, on the accent) and the relax
 * buttons' counts (`tint`). Decorative; the control it sits in carries the accessible name.
 */
export function CountBadge({
  tone,
  children,
}: {
  tone: 'solid' | 'tint';
  children: ReactNode;
}) {
  return (
    <Box
      component="span"
      aria-hidden={tone === 'solid' ? true : undefined}
      sx={{
        minWidth: 20,
        height: 20,
        px: '6px',
        boxSizing: 'border-box',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '999px',
        bgcolor:
          tone === 'solid' ? tokens.color.accent : tokens.color.accentTint,
        color:
          tone === 'solid'
            ? 'var(--mui-palette-pp-accentInk)'
            : tokens.color.accentOnTint,
        fontSize: 11.5,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </Box>
  );
}
