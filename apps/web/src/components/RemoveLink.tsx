import { Box, tokens } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';

/** The red "Remove from ..." link under an edit sheet's buttons. */
export function RemoveLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        alignSelf: 'flex-start',
        minHeight: 40,
        p: 0,
        border: 0,
        bgcolor: 'transparent',
        font: 'inherit',
        fontSize: 14,
        fontWeight: 700,
        color: tokens.color.urgentFg,
        cursor: 'pointer',
      }}
    >
      {children}
    </Box>
  );
}
