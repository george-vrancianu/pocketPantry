import MuiDialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import {
  forwardRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { Box } from '../atoms/Layout';
import { useToastHost } from './ToastProvider';
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
  /** Called once the open transition has finished, e.g. to focus a field. */
  onEntered?: () => void;
  /**
   * Called once the close transition has finished: the dialog is gone, the app is no longer `aria-hidden`
   * and focus is back on the opener. Use it for anything that needs to focus something after the close.
   */
  onExited?: () => void;
  /** Accessible name of the dialog. */
  label: string;
  /** Pinned above the body, e.g. a title row and tabs. */
  header?: ReactNode;
  /** Pinned below the body; omit for none. */
  footer?: ReactNode;
  /** Scrolls when it does not fit. */
  children: ReactNode;
  /**
   * `tall` (default) fills 90 dvh on a phone; `content` is as tall as its
   * content, up to the same 90 dvh, for short sheets such as a single field.
   */
  size?: 'tall' | 'content';
};

const SlideUp = forwardRef(function SlideUp(
  props: { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" easing={SLIDE_EASING} ref={ref} {...props} />;
});

/**
 * A modal sheet: a bottom sheet (90 dvh or content-sized, handle, slides up) below `md`, a
 * centred dialog (`sm` wide, 80 vh) from `md` up. Built on the MUI dialog, so
 * focus is trapped while open and returns to the opener on close.
 */
export function Sheet({
  open,
  onClose,
  onEntered,
  onExited,
  label,
  header,
  footer,
  children,
  size = 'tall',
}: SheetProps) {
  const centred = useBreakpointUp('md');
  const reduceMotion = usePrefersReducedMotion();
  const { color } = tokens;
  // Toasts show inside the open sheet, where they can be heard and reached.
  const [paper, setPaper] = useState<HTMLElement | null>(null);
  // Only while open: a toast raised as the sheet closes must not sit in the
  // paper that is sliding away.
  useToastHost(open ? paper : null);
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
        transition: { onEntered, onExited },
        paper: {
          ref: setPaper,
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
                  height: size === 'tall' ? '90dvh' : 'auto',
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
