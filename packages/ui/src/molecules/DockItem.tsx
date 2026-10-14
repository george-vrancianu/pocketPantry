import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { focusRing } from '../theme/focusRing';
import { bodyFont, nestedRadius, radius } from '../theme/themeVars';

export type DockItemProps = {
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
};

export function DockItem({ label, href, icon, active = false }: DockItemProps) {
  // The active tab: an outline icon on the accent tint pill, label in the
  // same on-tint colour. Inactive tabs are muted.
  const colour = active ? 'pp.accentOnTint' : 'text.secondary';
  const pillBackground = active ? 'pp.accentTint' : 'transparent';

  return (
    <ButtonBase
      href={href}
      aria-current={active ? 'page' : undefined}
      sx={[
        {
          flexDirection: 'column',
          gap: '3px',
          // Concentric with the dock, 8 px inside its edge.
          borderRadius: nestedRadius(radius.dock, 8),
          color: colour,
          fontSize: 11,
          fontWeight: active ? 700 : 600,
          fontFamily: bodyFont,
        },
        focusRing,
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 32,
          borderRadius: '999px',
          bgcolor: pillBackground,
        }}
      >
        {icon}
      </Box>
      <span>{label}</span>
    </ButtonBase>
  );
}
