import { Box, tokens } from '@pocket-pantry/ui';
import { focusRing } from '../../../lib/focusRing';
import { IngredientIconSlot } from '../../IngredientIconSlot';

export type IngredientTileProps = {
  ingredientId: string;
  /** The Aisle, for the icon's tint. */
  aisleId: string | null;
  name: string;
  /** The "why" line under the name: a glyph and its text. */
  why: { glyph: string; text: string; color: string };
  /** The tile's accessible name, which says the same as the why line. */
  label: string;
  disabled?: boolean;
  onSelect: () => void;
};

const ellipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

/** One tappable Ingredient in an empty-state block: icon in its Aisle tint, name and a "why" line. */
export function IngredientTile({
  ingredientId,
  aisleId,
  name,
  why,
  label,
  disabled = false,
  onSelect,
}: IngredientTileProps) {
  const { color } = tokens;
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onSelect}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        minWidth: 0,
        p: '7px 10px 7px 7px',
        border: `1px solid ${color.line}`,
        borderRadius: `${tokens.radius.field}px`,
        backgroundColor: color.surface,
        color: color.ink,
        font: 'inherit',
        textAlign: 'start',
        cursor: 'pointer',
        '&:disabled': { cursor: 'default', opacity: 0.6 },
        ...focusRing(),
      }}
    >
      <Box sx={{ transform: 'scale(.68)', m: '-6px' }}>
        <IngredientIconSlot ingredientId={ingredientId} aisleId={aisleId} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ fontSize: 13.5, fontWeight: 600, ...ellipsis }}>{name}</Box>
        <Box
          sx={{ fontSize: 11, fontWeight: 500, color: why.color, ...ellipsis }}
        >
          <Box component="span" aria-hidden sx={{ fontSize: 12 }}>
            {why.glyph}
          </Box>{' '}
          {why.text}
        </Box>
      </Box>
    </Box>
  );
}
