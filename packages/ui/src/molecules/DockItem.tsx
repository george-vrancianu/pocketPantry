import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { tokens } from '../theme/tokens';

export type DockVariant = 'light' | 'dark';

export type DockItemProps = {
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
  /** Always-filled item (Scan). */
  emphasis?: boolean;
  variant?: DockVariant;
};

export function DockItem({
  label,
  href,
  icon,
  active = false,
  emphasis = false,
  variant = 'light',
}: DockItemProps) {
  const { color } = tokens;
  const dark = variant === 'dark';

  const pill = emphasis
    ? dark && active
      ? { backgroundColor: '#FFFFFF', color: color.ink }
      : { backgroundColor: color.accent, color: '#FFFFFF' }
    : active
      ? { backgroundColor: color.accentTint, color: color.accent }
      : {};

  const labelColor = dark
    ? emphasis && active
      ? '#FFFFFF'
      : color.cameraMuted
    : emphasis
      ? color.ink
      : active
        ? color.accent
        : color.muted;

  return (
    <ButtonBase
      href={href}
      aria-current={active ? 'page' : undefined}
      sx={{
        flexDirection: 'column',
        gap: '3px',
        borderRadius: '18px',
        color: labelColor,
        fontSize: 11,
        fontWeight: emphasis || active ? 700 : 600,
        fontFamily: tokens.font.body,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 32,
          borderRadius: '16px',
          ...pill,
        }}
      >
        {icon}
      </Box>
      <span>{label}</span>
    </ButtonBase>
  );
}
