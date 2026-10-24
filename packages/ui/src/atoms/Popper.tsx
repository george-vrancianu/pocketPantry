import MuiPopper, {
  type PopperProps as MuiPopperProps,
} from '@mui/material/Popper';
import type { ReactNode, Ref } from 'react';

export type PopperProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  placement?: MuiPopperProps['placement'];
  children: ReactNode;
  /** The popper's own element, for outside-tap checks. */
  ref?: Ref<HTMLDivElement>;
};

/**
 * Floats its children by an anchor with `position: fixed`, so a scroll container or an
 * `overflow: hidden` ancestor (a Sheet's content) cannot clip it. It stays in the anchor's DOM
 * subtree rather than a body portal: a modal's focus trap would pull focus back out of a portal.
 * It flips to the other side when there is no room.
 */
export function Popper({
  open,
  anchorEl,
  placement = 'bottom-end',
  children,
  ref,
}: PopperProps) {
  return (
    <MuiPopper
      ref={ref}
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      disablePortal
      modifiers={[{ name: 'flip', enabled: true }]}
      popperOptions={{ strategy: 'fixed' }}
      sx={{ zIndex: 2 }}
    >
      {children}
    </MuiPopper>
  );
}
