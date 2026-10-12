import { Box, tokens } from '@pocket-pantry/ui';
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

/** One Ingredient Line: name with its quantity tag, note under it, and the Pantry status on the right. */
function IngredientRow({
  line,
  pantry,
}: {
  line: RecipeDetailLine;
  pantry: PantryLine | undefined;
}) {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const amount = lineAmount(line, i18n.language, t);
  const quiet = line.optional || pantry?.pantryBasic === true;
  const sub = [line.note, line.optional ? t('recipes:optional') : null]
    .filter(Boolean)
    .join(', ');
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: 44,
        px: '16px',
        py: '10px',
        borderTop: `1px solid ${tokens.color.divider}`,
        '&:first-of-type': { borderTop: 0 },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: quiet ? tokens.color.muted : tokens.color.ink,
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
                bgcolor: quiet ? tokens.color.okBg : tokens.color.accentTint,
                color: quiet ? tokens.color.muted : tokens.color.accent,
              }}
            >
              {amount}
            </Box>
          ) : null}
        </Box>
        {sub ? (
          <Box sx={{ fontSize: 12.5, color: tokens.color.muted }}>{sub}</Box>
        ) : null}
      </Box>
      {pantry ? <LineStatusPill line={pantry} /> : null}
    </Box>
  );
}

/** Ingredient Lines in order, as rows of a white card with their Pantry status. */
export function IngredientList({
  lines,
  pantryByLine,
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
        />
      ))}
    </Box>
  );
}
