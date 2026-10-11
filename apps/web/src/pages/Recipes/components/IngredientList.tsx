import { Box, Stack } from '@pocket-pantry/ui';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../../lib/amount';
import type { Unit } from '../../../lib/catalog';
import type { RecipeDetailLine } from '../../../lib/recipes';

type Props = {
  lines: RecipeDetailLine[];
  /** A slot after each line, keyed by line id: the per-line Pantry status (#157). */
  renderLineStatus?: (line: RecipeDetailLine) => ReactNode;
  'aria-label': string;
};

/** "500 g", "2" for a count without a unit, "" when the line has no quantity. */
export function lineAmount(
  line: { quantity: number | null; unit: Unit | null },
  language: string,
  t: TFunction,
): string {
  if (line.quantity === null) return '';
  return line.unit
    ? formatAmount(line.quantity, line.unit, language, t)
    : new Intl.NumberFormat(language).format(line.quantity);
}

/** Ingredient Lines in order, with an optional per-line status slot. */
export function IngredientList({
  lines,
  renderLineStatus,
  'aria-label': label,
}: Props) {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  return (
    <Stack
      component="ul"
      aria-label={label}
      spacing={0.5}
      sx={{ listStyle: 'none', m: 0, p: 0 }}
    >
      {lines.map((line) => {
        const amount = lineAmount(line, i18n.language, t);
        return (
          <Box component="li" key={line.id}>
            {amount ? `${amount} ` : ''}
            {line.ingredientName}
            {line.note ? `, ${line.note}` : ''}
            {line.optional ? ` (${t('recipes:optional')})` : ''}
            {renderLineStatus?.(line)}
          </Box>
        );
      })}
    </Stack>
  );
}
