import MuiIconButton from '@mui/material/IconButton';
import type { MouseEventHandler, ReactNode } from 'react';
import { tokens } from '../theme/tokens';

export type IconButtonProps = {
  /** Accessible name. Required because the button has no visible text. */
  label: string;
  children: ReactNode;
  /** `surface` is the white circle with a border; `accent` is the filled primary action. */
  tone?: 'surface' | 'accent';
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
};

/** The 44 px circular icon button used in headers. Renders a link when `href` is set. */
export function IconButton({
  label,
  children,
  tone = 'surface',
  href,
  onClick,
}: IconButtonProps) {
  const { color } = tokens;
  return (
    <MuiIconButton
      aria-label={label}
      {...(href ? { href } : {})}
      onClick={onClick}
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        ...(tone === 'accent'
          ? {
              backgroundColor: color.accent,
              color: '#FFFFFF',
              '&:hover': { backgroundColor: color.accentHover },
            }
          : {
              backgroundColor: color.surface,
              color: color.ink,
              border: `1px solid ${color.line}`,
              '&:hover': { backgroundColor: color.accentTint },
            }),
      }}
    >
      {children}
    </MuiIconButton>
  );
}
