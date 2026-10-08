import MuiAlert from '@mui/material/Alert';
import type { ReactNode } from 'react';

export type AlertProps = {
  severity?: 'error' | 'warning' | 'info' | 'success';
  /** `alert` interrupts a screen reader; `status` waits for a pause (a toast). */
  role?: 'alert' | 'status';
  children: ReactNode;
};

/** Inline message. Announced to screen readers through `role="alert"` unless told otherwise. */
export function Alert({
  severity = 'error',
  role = 'alert',
  children,
}: AlertProps) {
  return (
    <MuiAlert severity={severity} role={role}>
      {children}
    </MuiAlert>
  );
}
