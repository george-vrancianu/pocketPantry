import MuiCollapse from '@mui/material/Collapse';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';

export type CollapseProps = {
  open: boolean;
  children: ReactNode;
};

/**
 * Reveals its children by animating height over 180 ms (handoff: 150 to 200);
 * they are unmounted while closed. Under `prefers-reduced-motion` there is no
 * transition at all: the children mount and unmount at once.
 */
export function Collapse({ open, children }: CollapseProps) {
  const reduceMotion = usePrefersReducedMotion();
  if (reduceMotion) return open ? <>{children}</> : null;
  return (
    <MuiCollapse in={open} timeout={180} unmountOnExit>
      {children}
    </MuiCollapse>
  );
}
