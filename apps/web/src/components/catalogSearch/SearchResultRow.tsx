import { Box, tokens } from '@pocket-pantry/ui';
import type { CatalogSearchResult } from '../../lib/catalog';
import { focusRingStyle } from '../../lib/focusRing';
import { IngredientIconSlot } from '../IngredientIconSlot';
import { Highlighted, matchRange } from './matchRange';

export type SearchResultRowProps = {
  id: string;
  result: CatalogSearchResult;
  /** What the Member typed, for the highlight. */
  query: string;
  /** Show the default unit chip. */
  showUnit: boolean;
  /** Keyboard-highlighted. */
  active: boolean;
  /** Faded while newer results load. */
  dimmed: boolean;
  first: boolean;
  onSelect: () => void;
};

/** The "{Leaf Category} · {Aisle}" line under a result's name. */
export const resultMeta = (result: CatalogSearchResult) =>
  `${result.leafCategory.name} · ${result.parentCategory.aisle.name}`;

/** One option of the result listbox: icon in its Aisle tint, highlighted name, meta, unit chip or ↵ hint. */
export function SearchResultRow({
  id,
  result,
  query,
  showUnit,
  active,
  dimmed,
  first,
  onSelect,
}: SearchResultRowProps) {
  const { color } = tokens;
  const meta = resultMeta(result);
  // The meta carries the highlight only when the name does not.
  const metaQuery = matchRange(result.name, query) ? '' : query;
  return (
    <Box
      component="li"
      id={id}
      role="option"
      aria-selected={active}
      aria-label={[result.name, meta, showUnit ? result.defaultUnit : null]
        .filter(Boolean)
        .join(', ')}
      data-dimmed={dimmed ? 'true' : undefined}
      // Keep focus in the input so the tap still lands.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      sx={{
        position: 'relative',
        minHeight: 58,
        p: '9px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        backgroundColor: active ? color.subtle : 'transparent',
        borderTop: first ? 0 : `1px solid ${color.divider}`,
        opacity: dimmed ? 0.72 : 1,
        transition: 'opacity 200ms',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '&:hover': { backgroundColor: color.subtle },
        ...(active
          ? {
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 10,
                bottom: 10,
                width: 3,
                borderRadius: 2,
                backgroundColor: color.accent,
              },
            }
          : {}),
        // The active row is shown by its bar; the ring is for real focus only.
        outline: 'none',
        ...(active ? { '&:focus-visible': focusRingStyle() } : {}),
      }}
    >
      <IngredientIconSlot
        ingredientId={result.id}
        aisleId={result.parentCategory.aisle.id}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontSize: 15,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Highlighted text={result.name} query={query} />
        </Box>
        <Box sx={{ fontSize: 13, fontWeight: 500, color: color.muted }}>
          <Highlighted text={meta} query={metaQuery} />
        </Box>
      </Box>
      {showUnit ? (
        active ? (
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              flexShrink: 0,
              px: '6px',
              py: '2px',
              border: `1px solid ${color.line}`,
              borderRadius: '6px',
              color: color.muted,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            ↵
          </Box>
        ) : (
          <Box
            component="span"
            sx={{
              flexShrink: 0,
              px: '8px',
              py: '5px',
              borderRadius: 999,
              backgroundColor: color.chipNeutral,
              color: color.muted,
              fontSize: 11.5,
              fontWeight: 600,
            }}
          >
            {result.defaultUnit}
          </Box>
        )
      ) : null}
    </Box>
  );
}
