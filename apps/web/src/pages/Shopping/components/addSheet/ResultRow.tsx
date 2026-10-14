import {
  Box,
  ChevronRightIcon,
  tokens,
  nestedRadius,
  radius,
  insetFocusRingStyle,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { IngredientIconSlot } from '../../../../components/IngredientIconSlot';

/** Radius of the bordered result list; its rows round their own ends (the list does not clip). */
export const LIST_RADIUS = radius.card;
/** The same corner just inside the list's 1px border. */
export const INNER_RADIUS = nestedRadius(LIST_RADIUS, 1);
/**
 * A row's corners: the list does not clip (the unit popover must overflow it),
 * so the first and last rows round their own ends. An open row's amount field
 * sits right under it, so it keeps its bottom square.
 */
const ends = (top: boolean, bottom: boolean) =>
  [top, top, bottom, bottom].map((end) => (end ? INNER_RADIUS : '0')).join(' ');

export type ResultRowProps = {
  id: string;
  /** The matched Ingredient; omitted for an Unmatched row, which shows the neutral Default Icon. */
  ingredientId?: string;
  name: string;
  /** Part of `name` to highlight, matched case-insensitively (first match). */
  highlight?: string;
  meta: string;
  /** The result's Aisle, for the icon tint; omitted for an Unmatched row. */
  aisleId?: string;
  /** Shows the "On list" tag. */
  onList?: boolean;
  open: boolean;
  /** Keyboard-highlighted in the listbox. */
  active: boolean;
  onToggle: () => void;
  /** Room left under the row for the amount panel, which sits over it (see IngredientsTab). */
  spaceBelow?: number;
  /** First and last row of the list, for the rounded ends. */
  first: boolean;
  last: boolean;
};

function Highlighted({ text, match }: { text: string; match?: string }) {
  const at = match ? text.toLowerCase().indexOf(match.toLowerCase()) : -1;
  if (!match || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <Box
        component="span"
        sx={{ color: tokens.color.accent, fontWeight: 700 }}
      >
        {text.slice(at, at + match.length)}
      </Box>
      {text.slice(at + match.length)}
    </>
  );
}

/** One option of the result listbox. */
export function ResultRow({
  id,
  ingredientId,
  name,
  highlight,
  meta,
  aisleId,
  onList,
  open,
  active,
  onToggle,
  spaceBelow = 0,
  first,
  last,
}: ResultRowProps) {
  const { color } = tokens;
  const { t } = useTranslation('shopping');
  return (
    <Box
      id={id}
      role="option"
      aria-selected={open}
      // Keep focus in the search input so the tap still lands.
      onMouseDown={(event: { preventDefault: () => void }) =>
        event.preventDefault()
      }
      onClick={onToggle}
      sx={{
        marginBottom: spaceBelow,
        minHeight: 58,
        p: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        backgroundColor: open ? color.subtle : 'transparent',
        borderTop: first ? 0 : `1px solid ${color.divider}`,
        borderRadius: ends(first, last && !open),
        ...(active ? insetFocusRingStyle : { outline: 'none' }),
      }}
    >
      <IngredientIconSlot ingredientId={ingredientId} aisleId={aisleId} />
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
          <Highlighted text={name} match={highlight} />
        </Box>
        <Box sx={{ fontSize: 13, fontWeight: 500, color: color.muted }}>
          {meta}
        </Box>
      </Box>
      {onList ? (
        <Box
          component="span"
          sx={{
            flexShrink: 0,
            px: '9px',
            py: '3px',
            borderRadius: 999,
            backgroundColor: color.accentTint,
            color: color.accentOnTint,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {t('search.onList')}
        </Box>
      ) : null}
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          color: color.muted,
          transform: open ? 'rotate(90deg)' : 'none',
          transition: 'transform 150ms',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        <ChevronRightIcon size={18} />
      </Box>
    </Box>
  );
}
