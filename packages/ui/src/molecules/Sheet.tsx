import MuiDialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { forwardRef, type ReactElement, type ReactNode, type Ref } from 'react';
import { Box } from '../atoms/Layout';
import { tokens } from '../theme/tokens';
import { useBreakpointUp } from '../theme/useBreakpointUp';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';

/** How long the phone sheet slides in and out, ms. */
const SLIDE_MS = 340;
const SLIDE_EASING = 'cubic-bezier(.2,.8,.2,1)';
const SCRIM = 'rgba(23,35,28,.38)';
const RADIUS = 28;

export type SheetProps = {
  open: boolean;
  /**
   * Called for a scrim tap and for Escape. A child that wants Escape for
   * itself (say, a popover) calls `event.stopPropagation()` on that keydown.
   */
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  /** Pinned above the body, e.g. a title row and tabs. */
  header?: ReactNode;
  /** Pinned below the body; omit for none. */
  footer?: ReactNode;
  /** Scrolls when it does not fit. */
  children: ReactNode;
};

const SlideUp = forwardRef(function SlideUp(
  props: { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" easing={SLIDE_EASING} ref={ref} {...props} />;
});

/**
 * A modal sheet: a bottom sheet (90 dvh, handle, slides up) below `md`, a
 * centred dialog (`sm` wide, 80 vh) from `md` up. Built on the MUI dialog, so
 * focus is trapped while open and returns to the opener on close.
 */
export function Sheet({
  open,
  onClose,
  label,
  header,
  footer,
  children,
}: SheetProps) {
  const centred = useBreakpointUp('md');
  const reduceMotion = usePrefersReducedMotion();
  const { color } = tokens;
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={centred ? 'sm' : false}
      slots={centred ? undefined : { transition: SlideUp }}
      transitionDuration={reduceMotion ? 0 : centred ? undefined : SLIDE_MS}
      sx={
        centred
          ? undefined
          : { '& .MuiDialog-container': { alignItems: 'flex-end' } }
      }
      slotProps={{
        backdrop: { sx: { backgroundColor: SCRIM } },
        paper: {
          'aria-label': label,
          sx: {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: color.bg,
            backgroundImage: 'none',
            ...(centred
              ? { borderRadius: `${RADIUS}px`, maxHeight: '80vh' }
              : {
                  m: 0,
                  width: '100%',
                  height: '90dvh',
                  maxHeight: '90dvh',
                  borderRadius: `${RADIUS}px ${RADIUS}px 0 0`,
                }),
          },
        },
      }}
    >
      {centred ? null : (
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 40,
            height: 5,
            mt: 1,
            mx: 'auto',
            borderRadius: 999,
            backgroundColor: color.line,
          }}
        />
      )}
      {header ? <Box sx={{ flexShrink: 0 }}>{header}</Box> : null}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</Box>
      {footer ? (
        <Box
          sx={{
            flexShrink: 0,
            borderTop: `1px solid ${color.line}`,
            backgroundColor: color.bg,
          }}
        >
          {footer}
        </Box>
      ) : null}
    </MuiDialog>
  );
}
