import MuiSnackbar from '@mui/material/Snackbar';
import type { ReactNode } from 'react';

export type SnackbarProps = {
  open: boolean;
  onClose: () => void;
  /** Milliseconds before it closes itself. */
  autoHideMs?: number;
  /** Usually an `Alert`. */
  children: ReactNode;
};

/** A transient message at the bottom of the screen. A click elsewhere does not dismiss it. */
export function Snackbar({
  open,
  onClose,
  autoHideMs = 6000,
  children,
}: SnackbarProps) {
  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={autoHideMs}
      onClose={(_event, reason) => {
        if (reason !== 'clickaway') onClose();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <div>{children}</div>
    </MuiSnackbar>
  );
}
