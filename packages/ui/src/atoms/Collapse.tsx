import MuiCollapse from '@mui/material/Collapse';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';

export type CollapseProps = {
  open: boolean;
  children: ReactNode;
};

/** Expand / collapse duration in ms (handoff: 150 to 200). */
export const COLLAPSE_MS = 180;

/**
 * Reveals its children by animating height over 180 ms; they are unmounted
 * while closed. Under `prefers-reduced-motion` there is no transition at all:
 * the children mount and unmount at once.
 */
export function Collapse({ open, children }: CollapseProps) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  if (reduceMotion) return open ? <>{children}</> : null;
  return (
    <MuiCollapse in={open} timeout={COLLAPSE_MS} unmountOnExit>
      {children}
    </MuiCollapse>
  );
}
