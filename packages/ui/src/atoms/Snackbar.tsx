import MuiSnackbar from '@mui/material/Snackbar';
import type { ReactNode } from 'react';
import { DOCK_BOTTOM, DOCK_HEIGHT } from '../theme/dock';

export type SnackbarProps = {
  open: boolean;
  onClose: () => void;
  /** Sit above the floating Dock (and the device's bottom inset) instead of under it. */
  aboveDock?: boolean;
  /** Usually an `Alert`. */
  children: ReactNode;
};

const GAP = 8;
const above = (height: number) =>
  `calc(${DOCK_BOTTOM + height + GAP}px + env(safe-area-inset-bottom, 0px))`;

/** A transient message at the bottom of the screen that closes itself after 6 s. A click elsewhere does not dismiss it. */
export function Snackbar({
  open,
  onClose,
  aboveDock = false,
  children,
}: SnackbarProps) {
  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={6000}
      onClose={(_event, reason) => {
        if (reason !== 'clickaway') onClose();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={
        aboveDock
          ? { bottom: { xs: above(DOCK_HEIGHT.xs), md: above(DOCK_HEIGHT.md) } }
          : undefined
      }
    >
      <div>{children}</div>
    </MuiSnackbar>
  );
}
