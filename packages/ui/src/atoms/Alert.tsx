import MuiAlert from '@mui/material/Alert';
import type { ReactNode } from 'react';

export type AlertProps = {
  severity?: 'error' | 'warning' | 'info' | 'success';
  children: ReactNode;
};

/** Inline message. Announced to screen readers through `role="alert"`. */
export function Alert({ severity = 'error', children }: AlertProps) {
  return (
    <MuiAlert severity={severity} role="alert">
      {children}
    </MuiAlert>
  );
}
