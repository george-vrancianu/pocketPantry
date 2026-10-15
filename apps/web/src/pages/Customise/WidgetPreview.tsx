import {
  Box,
  ClockIcon,
  PantryIcon,
  PulseIcon,
  RecipesIcon,
  ShoppingIcon,
  tokens,
  nestedRadius,
  radius,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import type { WidgetType } from '../../lib/dashboard';

const bar = (width: string, color: string) => (
  <Box
    component="span"
    sx={{
      display: 'block',
      width,
      height: 7,
      borderRadius: radius.pill,
      bgcolor: color,
    }}
  />
);

const centred = (icon: ReactNode) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {icon}
  </Box>
);

/** Decorative mini preview of a Widget type for the Add widgets gallery. */
const PREVIEWS: Record<WidgetType, ReactNode> = {
  health: centred(<PulseIcon size={30} />),
  'use-soon': centred(<ClockIcon size={30} />),
  shopping: centred(<ShoppingIcon size={30} />),
  'pantry-stock': centred(<PantryIcon size={30} />),
  suggestions: centred(<ShoppingIcon size={30} />),
  'cook-tonight': centred(<RecipesIcon size={30} />),
  'meal-plan': (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: '4px',
        alignItems: 'end',
        height: '100%',
      }}
    >
      {[
        tokens.color.accent,
        tokens.color.accent,
        tokens.color.accentMid,
        tokens.color.chipNeutral,
        tokens.color.chipNeutral,
      ].map((color, i) => (
        <Box
          key={i}
          component="span"
          sx={{
            height: 36,
            borderRadius: nestedRadius(radius.control, 6),
            bgcolor: color,
          }}
        />
      ))}
    </Box>
  ),
  budget: (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      {bar('50%', tokens.color.ink)}
      {bar('68%', tokens.color.accent)}
    </Box>
  ),
  nutrition: (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '6px',
        height: '100%',
      }}
    >
      {bar('80%', tokens.color.accent)}
      {bar('55%', tokens.color.accentMid)}
      {bar('35%', tokens.color.butter)}
    </Box>
  ),
};

export function WidgetPreview({ type }: { type: WidgetType }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        height: 64,
        borderRadius: radius.control,
        bgcolor: tokens.color.bg,
        color: tokens.color.ink,
        p: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '& > *': { width: '100%' },
      }}
    >
      {PREVIEWS[type]}
    </Box>
  );
}
