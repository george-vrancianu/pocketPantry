import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { tokens } from '../theme/tokens';

export type DockItemProps = {
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
};

export function DockItem({ label, href, icon, active = false }: DockItemProps) {
  const { color } = tokens;
  const pill = active
    ? { backgroundColor: color.accentTint, color: color.accent }
    : {};

  const labelColor = active ? color.accent : color.muted;

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
        fontWeight: active ? 700 : 600,
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
