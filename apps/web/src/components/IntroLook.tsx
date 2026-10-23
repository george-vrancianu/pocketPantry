import { Box, useForcedThemeColor, tokens } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';

/**
 * The Intro has no dark version: its screens use the light look (Warm) whatever Theme the device has,
 * so a subtree is forced into it, as the camera is forced dark.
 */
export function IntroLook({ children }: { children: ReactNode }) {
  useForcedThemeColor('warm');
  return (
    <Box
      data-theme="warm"
      sx={{ minHeight: '100vh', backgroundColor: tokens.color.bg }}
    >
      {children}
    </Box>
  );
}
