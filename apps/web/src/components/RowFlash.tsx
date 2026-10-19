import { Box, tokens, usePrefersReducedMotion } from '@pocket-pantry/ui';
import { useRowFlash } from '../lib/rowFlash';

/**
 * A one-off accent tint that fades over 1.8 s on a row a Voice Note just changed. Put it last inside a
 * `position: relative` row. Nothing at all under reduced motion.
 */
export function RowFlash({ ids }: { ids: readonly string[] }) {
  const flashing = useRowFlash(ids);
  const reduceMotion = usePrefersReducedMotion();
  if (!flashing || reduceMotion) return null;
  return (
    <Box
      aria-hidden
      data-row-flash=""
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundColor: tokens.color.accentTint,
        animation: 'pp-row-flash 1.8s ease-out forwards',
        '@keyframes pp-row-flash': {
          '0%, 30%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      }}
    />
  );
}
