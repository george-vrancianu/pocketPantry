import {
  Box,
  IngredientIcon,
  tokens,
  focusRing,
  radius,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';

/** The line under a tile's name: a 12px decorative glyph, then text, in the reason's colour. */
export type TileWhy = { glyph: string; text: string; color: string };

export type IngredientTileProps = {
  ingredientId: string;
  /** Null (an Ingredient without an Aisle) gets the neutral tint. */
  aisleId: string | null;
  name: string;
  why: TileWhy;
  /** Accessible name; spells the why line out. */
  label: string;
  /** A secondary control (e.g. dismiss) at the tile's right edge, outside the select button. */
  action?: ReactNode;
  onSelect: () => void;
};

/** One empty-state tile: the Ingredient's icon in its Aisle tint, its name, and why it is offered. */
export function IngredientTile({
  ingredientId,
  aisleId,
  name,
  why,
  label,
  action,
  onSelect,
}: IngredientTileProps) {
  const { color } = tokens;
  const button = (
    <Box
      component="button"
      type="button"
      aria-label={label}
      onClick={onSelect}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: 0,
        ...(action ? { width: '100%', boxSizing: 'border-box' } : {}),
        p: action ? '7px 34px 7px 7px' : '7px 10px 7px 7px',
        textAlign: 'left',
        font: 'inherit',
        color: color.ink,
        backgroundColor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: radius.chip,
        cursor: 'pointer',
        '&:hover': { backgroundColor: color.subtle },
        ...focusRing,
      }}
    >
      <Box aria-hidden="true" sx={{ flexShrink: 0, display: 'grid' }}>
        <IngredientIcon
          ingredientId={ingredientId}
          aisleId={aisleId ?? undefined}
          size={26}
        />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            fontSize: 13.5,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 11,
            fontWeight: 500,
            color: why.color,
          }}
        >
          <Box
            component="span"
            aria-hidden="true"
            sx={{ fontSize: 12, flexShrink: 0 }}
          >
            {why.glyph}
          </Box>
          <Box
            component="span"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {why.text}
          </Box>
        </Box>
      </Box>
    </Box>
  );
  if (!action) return button;
  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      {button}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '6px',
          transform: 'translateY(-50%)',
          display: 'grid',
        }}
      >
        {action}
      </Box>
    </Box>
  );
}
