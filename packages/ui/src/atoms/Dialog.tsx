import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { ReactNode } from 'react';
import { useBreakpointUp } from '../theme/useBreakpointUp';
import { tokens } from '../theme/tokens';

export type DialogProps = {
  open: boolean;
  /** Called for Escape and a click on the backdrop. */
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Buttons along the bottom edge, e.g. Cancel. */
  actions?: ReactNode;
};

/**
 * A modal that is a bottom sheet on a phone (anchored to the bottom edge, full
 * width, rounded top) and a centred dialog from the `md` breakpoint up (see `useBreakpointUp`). Focus is trapped
 * while open and returns to the element that opened it on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
}: DialogProps) {
  const centred = useBreakpointUp('md');
  const radius = `${tokens.radius.card}px`;
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={centred ? 'sm' : false}
      sx={
        centred
          ? undefined
          : { '& .MuiDialog-container': { alignItems: 'flex-end' } }
      }
      slotProps={{
        paper: {
          sx: centred
            ? { borderRadius: radius }
            : {
                m: 0,
                width: '100%',
                maxHeight: '85dvh',
                borderRadius: `${radius} ${radius} 0 0`,
              },
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      {actions ? <DialogActions>{actions}</DialogActions> : null}
    </MuiDialog>
  );
}
