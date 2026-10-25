import { tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../../lib/amount';
import { FALLBACK_LOCATION } from '../../../lib/catalog';
import { usualAmountsInPriority } from '../../../lib/usualAmounts';
import { usePopularToStart } from '../../../lib/popularToStart';
import { useEmptyStateSearch } from './context';
import { IngredientTile } from './IngredientTile';
import { TileSection } from './TileSection';

/** The empty state of a Family with nothing Recently Stocked: a fixed starter list, each with its usual amount and Location. */
export function PopularToStart() {
  const { t, i18n } = useTranslation('catalog');
  const search = useEmptyStateSearch();
  const popular = usePopularToStart(i18n.language);
  if (!search || !popular.data || popular.data.length === 0) return null;
  return (
    <TileSection heading={t('search.popularToStart')}>
      {popular.data.map((ingredient) => {
        // Counts start at the first Usual Amount; mass and volume at the second (the handoff's default).
        const usual = usualAmountsInPriority(
          ingredient.defaultUnit,
          ingredient.amountScale,
        );
        const quantity =
          (ingredient.defaultUnit === 'pcs' ? usual[0] : usual[1]) ?? 1;
        const amount = formatAmount(
          quantity,
          ingredient.defaultUnit,
          i18n.language,
          t,
        );
        const location = t(
          `common:locations.${ingredient.defaults.location ?? FALLBACK_LOCATION}`,
        );
        return (
          <IngredientTile
            key={ingredient.id}
            ingredientId={ingredient.id}
            aisleId={ingredient.parentCategory.aisle.id}
            name={ingredient.name}
            why={{
              text: `${amount} · ${location}`,
              color: tokens.color.muted,
            }}
            label={t('search.popularLabel', {
              name: ingredient.name,
              amount,
              location,
            })}
            onSelect={() => search.select(ingredient)}
          />
        );
      })}
    </TileSection>
  );
}
