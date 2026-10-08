import Box from '@mui/material/Box';
import type { MouseEvent, ReactNode } from 'react';
import { DockItem, type DockVariant } from '../molecules/DockItem';
import { tokens } from '../theme/tokens';
import { DOCK_BOTTOM, DOCK_HEIGHT } from '../theme/dock';

export type DockEntry = {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
  /** Always-filled item (Scan). */
  emphasis?: boolean;
};

export type DockProps = {
  /** Accessible name of the navigation landmark. */
  label: string;
  items: DockEntry[];
  activeKey?: string;
  variant?: DockVariant;
  /** Runs before an item navigates; call `preventDefault()` to stay. */
  onNavigate?: (event: MouseEvent<HTMLElement>) => void;
};

/** The floating bottom navigation. Handoff section 5 and 9 for sizes. */
export function Dock({
  label,
  items,
  activeKey,
  variant = 'light',
  onNavigate,
}: DockProps) {
  const { color } = tokens;
  const dark = variant === 'dark';
  return (
    <Box
      component="nav"
      aria-label={label}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: DOCK_BOTTOM,
        zIndex: 10,
        mx: 'auto',
        width: 'calc(100% - 32px)',
        maxWidth: { sm: 480, md: 520 },
        height: DOCK_HEIGHT,
        boxSizing: 'border-box',
        p: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: { xs: '4px', md: '6px' },
        backgroundColor: dark ? color.cameraSurface : 'rgba(255,255,255,0.94)',
        border: `1px solid ${dark ? color.cameraLine : color.line}`,
        borderRadius: { xs: `${tokens.radius.dock}px`, md: '28px' },
        boxShadow: dark ? 'none' : tokens.shadow.dock,
      }}
    >
      {items.map((item) => (
        <DockItem
          key={item.key}
          label={item.label}
          href={item.href}
          icon={item.icon}
          emphasis={item.emphasis}
          active={item.key === activeKey}
          variant={variant}
          onNavigate={onNavigate}
        />
      ))}
    </Box>
  );
}
