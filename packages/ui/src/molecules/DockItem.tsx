import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { tokens } from '../theme/tokens';

export type DockItemProps = {
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
  /** Always-filled item (Scan). */
  emphasis?: boolean;
};

export function DockItem({
  label,
  href,
  icon,
  active = false,
  emphasis = false,
}: DockItemProps) {
  const { color } = tokens;
  const pill = emphasis
    ? { backgroundColor: color.accent, color: '#FFFFFF' }
    : active
      ? { backgroundColor: color.accentTint, color: color.accent }
      : {};

  const labelColor = emphasis ? color.ink : active ? color.accent : color.muted;

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
