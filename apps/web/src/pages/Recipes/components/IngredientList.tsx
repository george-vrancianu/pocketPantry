import {
  Alert,
  Box,
  ShoppingIcon,
  CheckIcon,
  IconButton,
  tokens,
  usePrefersReducedMotion,
} from '@pocket-pantry/ui';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../../lib/amount';
import type { Unit } from '../../../lib/catalog';
import type { PantryLine, RecipeDetailLine } from '../../../lib/recipes';
import { LineStatusPill } from './PantryStatus';

type Props = {
  lines: RecipeDetailLine[];
  /** The Pantry status of each line, by line id; a line without one shows none yet. */
  pantryByLine: Map<string, PantryLine>;
  /** The line whose add button is showing, if any. */
  selectedId: string | null;
  onSelect: (lineId: string | null) => void;
  /** The selected line was added to the Shopping List. */
  addedId: string | null;
  /** Lines added by hand at the Servings picked; their pill keeps the on-list hint. */
  handAddedIds: ReadonlySet<string>;
  /** The line whose last add failed, with the message to show under its button. */
  errorId: string | null;
  error: string | null;
  /** Adding is not possible now (stale match or an add in flight). */
  addDisabled: boolean;
  onAddLine: (line: RecipeDetailLine) => void;
  'aria-label': string;
};

/** "500 g", "2" for a count without a unit, "" when the line has no quantity. */
export function lineAmount(
  line: { quantity: number | null; unit: Unit | null },
  language: string,
  t: TFunction,
): string {
  if (line.quantity === null) return '';
  return line.unit && line.unit !== 'pcs'
    ? formatAmount(line.quantity, line.unit, language, t)
    : new Intl.NumberFormat(language).format(line.quantity);
}

/** One Ingredient Line: name with its quantity tag, note under it, and the Pantry status on the right; selected, a cart button beside it. */
function IngredientRow({
  line,
  pantry,
  selected,
  added,
  listed,
  error,
  addDisabled,
  onToggle,
  onAdd,
}: {
  line: RecipeDetailLine;
  pantry: PantryLine | undefined;
  selected: boolean;
  added: boolean;
  listed: boolean;
  error: string | null;
  addDisabled: boolean;
  onToggle: () => void;
  onAdd: () => void;
}) {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const reduceMotion = usePrefersReducedMotion();
  const amount = lineAmount(line, i18n.language, t);
  const optionalOrBasic = line.optional || pantry?.pantryBasic === true;
  const sub = [line.note, line.optional ? t('recipes:optional') : null]
    .filter(Boolean)
    .join(', ');
  return (
    <Box
      component="li"
      sx={{
        borderTop: `1px solid ${tokens.color.divider}`,
        '&:first-of-type': { borderTop: 0 },
        bgcolor: selected ? tokens.color.accentTint : undefined,
      }}
    >
      {/* The add button cannot sit inside the toggle, so the two are siblings on one line. */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          component="button"
          type="button"
          aria-pressed={selected}
          onClick={onToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            pl: '16px',
            pr: selected ? '8px' : '16px',
            py: '10px',
            border: 0,
            bgcolor: 'transparent',
            font: 'inherit',
            textAlign: 'left',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: optionalOrBasic ? tokens.color.muted : tokens.color.ink,
              }}
            >
              {line.ingredientName}
              {amount ? (
                <Box
                  component="span"
                  sx={{
                    ml: '7px',
                    px: '7px',
                    py: '1px',
                    borderRadius: '6px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    bgcolor: optionalOrBasic
                      ? tokens.color.okBg
                      : tokens.color.accentTint,
                    color: optionalOrBasic
                      ? tokens.color.muted
                      : tokens.color.accent,
                  }}
                >
                  {amount}
                </Box>
              ) : null}
            </Box>
            {sub ? (
              <Box sx={{ fontSize: 12.5, color: tokens.color.muted }}>
                {sub}
              </Box>
            ) : null}
          </Box>
          {pantry ? (
            <LineStatusPill line={pantry} iconOnly={selected} added={listed} />
          ) : null}
        </Box>
        {selected ? (
          <Box
            sx={{
              display: 'flex',
              pr: '12px',
              // Fades in only; leaving is instant. No motion at all under reduce-motion.
              '@keyframes pp-line-add-in': {
                from: { opacity: 0, transform: 'scale(0.8)' },
                to: { opacity: 1, transform: 'none' },
              },
              animation: reduceMotion
                ? 'none'
                : 'pp-line-add-in 180ms ease-out',
            }}
          >
            <IconButton
              tone="accent"
              size={40}
              label={
                added
                  ? t('recipes:pantry.lineAdded', { name: line.ingredientName })
                  : t('recipes:pantry.addLine', { name: line.ingredientName })
              }
              ariaDisabled={added || addDisabled}
              onClick={onAdd}
            >
              {added ? <CheckIcon size={18} /> : <ShoppingIcon size={18} />}
            </IconButton>
          </Box>
        ) : null}
      </Box>
      {selected && error ? (
        <Box sx={{ px: '16px', pb: '10px' }}>
          <Alert>{error}</Alert>
        </Box>
      ) : null}
    </Box>
  );
}

/** Ingredient Lines in order, as rows of a white card with their Pantry status. */
export function IngredientList({
  lines,
  pantryByLine,
  selectedId,
  onSelect,
  addedId,
  handAddedIds,
  errorId,
  error,
  addDisabled,
  onAddLine,
  'aria-label': label,
}: Props) {
  return (
    <Box
      component="ul"
      aria-label={label}
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        overflow: 'hidden',
        bgcolor: tokens.color.surface,
        border: `1px solid ${tokens.color.line}`,
        borderRadius: `${tokens.radius.card}px`,
      }}
    >
      {lines.map((line) => (
        <IngredientRow
          key={line.id}
          line={line}
          pantry={pantryByLine.get(line.id)}
          selected={selectedId === line.id}
          added={addedId === line.id}
          listed={handAddedIds.has(line.id)}
          error={errorId === line.id ? error : null}
          addDisabled={addDisabled}
          onToggle={() => onSelect(selectedId === line.id ? null : line.id)}
          onAdd={() => onAddLine(line)}
        />
      ))}
    </Box>
  );
}
