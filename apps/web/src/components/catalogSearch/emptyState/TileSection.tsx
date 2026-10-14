import { Box, tokens } from '@pocket-pantry/ui';
import { Children, type ReactNode } from 'react';

/** The most tiles an empty-state block shows; the rest are reached by typing. */
export const MAX_TILES = 8;

export type TileSectionProps = {
  /** Also the region's accessible name. */
  heading: string;
  /** Shown beside the heading when given. */
  count?: number;
  /** Tiles; only the first {@link MAX_TILES} are shown. */
  children: ReactNode;
  /** Shown instead of the grid when there are no tiles. */
  none?: string;
};

/** A headed, two-column grid of at most 8 tiles for an empty-state block. */
export function TileSection({
  heading,
  count,
  children,
  none,
}: TileSectionProps) {
  const tiles = Children.toArray(children).slice(0, MAX_TILES);
  return (
    <Box component="section" aria-label={heading}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Box
          component="h3"
          sx={{
            m: 0,
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: tokens.color.muted,
          }}
        >
          {heading}
        </Box>
        {count !== undefined ? (
          <Box
            component="span"
            sx={{
              fontSize: 11.5,
              fontWeight: 600,
              color: tokens.color.muted,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {count}
          </Box>
        ) : null}
      </Box>
      {tiles.length === 0 ? (
        none ? (
          <Box sx={{ fontSize: 13, color: tokens.color.muted }}>{none}</Box>
        ) : null
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1,
          }}
        >
          {tiles}
        </Box>
      )}
    </Box>
  );
}
