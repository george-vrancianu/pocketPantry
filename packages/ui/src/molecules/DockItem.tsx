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
  /**
   * Dimmed and inert, for the Dock's teaching mode: still announced (`aria-disabled`) but out of the
   * tab order, and it goes nowhere.
   */
  disabled?: boolean;
};

export function DockItem({
  label,
  href,
  icon,
  active = false,
  disabled = false,
}: DockItemProps) {
  // The active tab: the whole button on the accent tint, icon and label in
  // the on-tint colour. Inactive tabs are muted.
  const colour = active ? 'pp.accentOnTint' : 'text.secondary';
  const background = active ? 'pp.accentTint' : 'transparent';

  return (
    <ButtonBase
      // Disabled: no href at all, so there is nothing to follow, and a click or Enter does nothing.
      {...(disabled ? {} : { href })}
      aria-current={active && !disabled ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={disabled ? (event) => event.preventDefault() : undefined}
      sx={[
        {
          flexDirection: 'column',
          gap: '3px',
          // Concentric with the dock, 8 px inside its padding edge.
          borderRadius: nestedRadius(radius.dock, 8),
          color: colour,
          bgcolor: background,
          fontSize: 11,
          fontWeight: active ? 700 : 600,
          fontFamily: bodyFont,
        },
        disabled ? { opacity: 0.4, cursor: 'default' } : {},
        focusRing,
      ]}
    >
      {/* The icon row: a fixed height keeps labels aligned across tabs. */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 32,
        }}
      >
        {icon}
      </Box>
      <span>{label}</span>
    </ButtonBase>
  );
}
