import MuiIconButton from '@mui/material/IconButton';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { tokens } from '../theme/tokens';

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'color' | 'children' | 'aria-label'
> & {
  /** Accessible name. Required because the button has no visible text. */
  label: string;
  children: ReactNode;
  /**
   * `surface` is the white circle with a border; `accent` is the filled primary action;
   * `plain` is a bare icon for dense rows; `urgent` is the red destructive action.
   */
  tone?: 'surface' | 'accent' | 'plain' | 'urgent';
  href?: string;
  /** Looks and announces as disabled (`aria-disabled`) but stays focusable and ignores clicks. */
  ariaDisabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

/** The 44 px circular icon button used in headers and rows. Renders a link when `href` is set. */
export function IconButton({
  label,
  children,
  tone = 'surface',
  href,
  ariaDisabled,
  onClick,
  ref,
  ...rest
}: IconButtonProps) {
  const { color } = tokens;
  const toneStyles = {
    accent: {
      backgroundColor: color.accent,
      color: '#FFFFFF',
      '&:hover': { backgroundColor: color.accentHover },
    },
    surface: {
      backgroundColor: color.surface,
      color: color.ink,
      border: `1px solid ${color.line}`,
      '&:hover': { backgroundColor: color.accentTint },
    },
    plain: {
      backgroundColor: 'transparent',
      color: color.muted,
      '&:hover': { backgroundColor: color.accentTint },
    },
    urgent: {
      backgroundColor: color.urgentBg,
      color: color.urgentFg,
    },
  }[tone];
  return (
    <MuiIconButton
      {...rest}
      ref={ref}
      aria-label={label}
      aria-disabled={ariaDisabled || undefined}
      {...(href ? { href } : {})}
      onClick={ariaDisabled ? undefined : onClick}
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        ...toneStyles,
        ...(ariaDisabled ? { opacity: 0.35, cursor: 'default' } : {}),
        '&:focus-visible': {
          outline: `3px solid ${color.accent}`,
          outlineOffset: 2,
        },
      }}
    >
      {children}
    </MuiIconButton>
  );
}
