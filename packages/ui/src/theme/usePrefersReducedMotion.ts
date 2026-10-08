import useMediaQuery from '@mui/material/useMediaQuery';

/** True when the Member asked the system for less motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
