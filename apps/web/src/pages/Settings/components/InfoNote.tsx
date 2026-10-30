import { Box, InfoIcon, Typography, radius, tokens } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';

/** A quiet note box with an info icon, at the foot of a Family catalog sheet. */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 1.5,
        borderRadius: radius.control,
        bgcolor: tokens.color.subtle,
        color: tokens.color.ink,
      }}
    >
      <Box sx={{ flexShrink: 0, pt: '2px' }}>
        <InfoIcon size={18} />
      </Box>
      <Typography variant="meta">{children}</Typography>
    </Box>
  );
}
