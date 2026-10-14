import { tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { CatalogSearchResult } from '../../../lib/catalog';
import { useRecentlyStocked } from '../../../lib/recentlyStocked';
import { useShortAgo } from './useShortAgo';
import { IngredientTile } from './IngredientTile';
import { MAX_TILES, TileSection } from './TileSection';

/** The Pantry search's empty state: what the Family most recently added, in the Pantry or not. Hidden until something was stocked. */
export function RecentlyStocked({
  onSelect,
}: {
  onSelect: (ingredient: CatalogSearchResult) => void;
}) {
  const { t, i18n } = useTranslation('catalog');
  const recent = useRecentlyStocked(i18n.language, MAX_TILES);
  const ago = useShortAgo();
  if (!recent.data || recent.data.length === 0) return null;
  return (
    <TileSection heading={t('search.recentlyStocked')}>
      {recent.data.map((ingredient) => {
        const when = ago(ingredient.lastStockedAt);
        return (
          <IngredientTile
            key={ingredient.id}
            ingredientId={ingredient.id}
            aisleId={ingredient.parentCategory.aisle.id}
            name={ingredient.name}
            why={
              ingredient.inPantry
                ? {
                    glyph: '●',
                    text: t('search.stockedInPantry', { when }),
                    color: tokens.color.accent,
                  }
                : {
                    glyph: '+',
                    text: t('search.stockedGone', { when }),
                    color: tokens.color.muted,
                  }
            }
            label={
              ingredient.inPantry
                ? t('search.stockedInPantryLabel', {
                    name: ingredient.name,
                    when,
                  })
                : t('search.stockedGoneLabel', { name: ingredient.name, when })
            }
            onSelect={() => onSelect(ingredient)}
          />
        );
      })}
    </TileSection>
  );
}
