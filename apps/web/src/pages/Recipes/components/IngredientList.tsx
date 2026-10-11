import { Box, Stack } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { RecipeDetailLine } from '../../../lib/recipes';

type Props = {
  lines: RecipeDetailLine[];
  /** A slot after each line, keyed by line id: the per-line Pantry status (#157). */
  renderLineStatus?: (line: RecipeDetailLine) => ReactNode;
  'aria-label': string;
};

/** Ingredient Lines in order, with an optional per-line status slot. */
export function IngredientList({
  lines,
  renderLineStatus,
  'aria-label': label,
}: Props) {
  const { t } = useTranslation(['recipes', 'common']);
  return (
    <Stack
      component="ul"
      aria-label={label}
      spacing={0.5}
      sx={{ listStyle: 'none', m: 0, p: 0 }}
    >
      {lines.map((line) => {
        const amount =
          line.quantity === null
            ? ''
            : line.unit
              ? `${line.quantity} ${t(`common:units.${line.unit}`)} `
              : `${line.quantity} `;
        return (
          <Box component="li" key={line.id}>
            {amount}
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
