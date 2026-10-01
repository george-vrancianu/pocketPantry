import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/** True when the viewport is at least this breakpoint: `sm` is 600 px, `md` is 900 px. */
export function useBreakpointUp(key: 'sm' | 'md'): boolean {
  const { breakpoints } = useTheme();
  return useMediaQuery(breakpoints.up(key));
}
