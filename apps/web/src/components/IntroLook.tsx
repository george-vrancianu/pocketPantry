import { Box, useForcedThemeColor, tokens } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';

/**
 * The Intro has no dark version: its screens use the light look (Warm) whatever Theme the device has,
 * so a subtree is forced into it, as the camera is forced dark.
 */
export function IntroLook({
  children,
  ground = 'cream',
}: {
  children: ReactNode;
  /** The Setup step screens stand on olive; the rest of the Intro is cream. */
  ground?: 'cream' | 'olive';
}) {
  useForcedThemeColor('warm');
  return (
    <Box
      // `data-theme` and `data-ground` are also test hooks: the colours are theme variables jsdom cannot resolve.
      data-theme="warm"
      data-ground={ground}
      sx={{
        minHeight: '100vh',
        backgroundColor:
          ground === 'olive' ? tokens.color.accent : tokens.color.bg,
        // Resolved under this subtree's Theme: inherited text would keep the root's colour (light on cream in Dark).
        color: tokens.color.ink,
      }}
    >
      {children}
    </Box>
  );
}
