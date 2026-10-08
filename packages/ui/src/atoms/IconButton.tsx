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
   * `plain` is a bare icon for dense rows; `urgent` is the red destructive action;
   * `urgentOutline` is the quieter destructive action: white with an urgent border;
   * `accentOutline` is the quiet primary action: white with an accent border.
   */
  tone?:
    | 'surface'
    | 'accent'
    | 'plain'
    | 'urgent'
    | 'urgentOutline'
    | 'accentOutline';
  /** Width and height in px: 44 for headers, 40 inside dense form rows. */
  size?: 40 | 44;
  href?: string;
  /** Looks and announces as disabled (`aria-disabled`) but stays focusable and ignores clicks. */
  ariaDisabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

/** The circular (44 px by default) icon button used in headers and rows. Renders a link when `href` is set. */
export function IconButton({
  label,
  children,
  tone = 'surface',
  size = 44,
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
      '&:hover': { backgroundColor: color.urgentHover },
    },
    accentOutline: {
      backgroundColor: color.surface,
      color: color.accent,
      border: `1px solid ${color.accent}`,
      '&:hover': { backgroundColor: color.accentTint },
    },
    urgentOutline: {
      backgroundColor: color.surface,
      color: color.urgentFg,
      border: `1px solid ${color.urgentBorder}`,
      '&:hover': { backgroundColor: color.urgentRow },
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
        width: size,
        height: size,
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
