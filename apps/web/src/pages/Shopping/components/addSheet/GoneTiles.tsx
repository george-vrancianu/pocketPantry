import { tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { IngredientTile } from '../../../../components/catalogSearch/emptyState/IngredientTile';
import {
  MAX_TILES,
  TileSection,
} from '../../../../components/catalogSearch/emptyState/TileSection';
import {
  daysSince,
  goneInOrder,
  type GoneReason,
  type Suggestion,
  type Suggestions,
} from '../../../../lib/suggestions';

export type GoneTilesProps = {
  suggestions: Suggestions;
  /** Selects the Ingredient through the search; the Suggestion is not dismissed. */
  onSelect: (suggestion: Suggestion) => void;
};

/** "Gone from your Pantry": expired, then Used Up, then missing Staples, as tiles saying why and when. */
export function GoneTiles({ suggestions, onSelect }: GoneTilesProps) {
  const { t } = useTranslation('catalog');
  const entries = goneInOrder(suggestions).slice(0, MAX_TILES);
  const when = (since: string | null) => {
    if (since === null) return '';
    const days = daysSince(since);
    return days === 0
      ? t('search.today')
      : t('search.daysAgo', { count: days });
  };
  const tile = ({
    suggestion,
    reason,
  }: {
    suggestion: Suggestion;
    reason: GoneReason;
  }) => {
    const { name, since } = suggestion;
    const age = when(since);
    const { color } = tokens;
    const why = {
      expired: {
        glyph: '◷',
        text: t('search.expiredWhen', { when: age }),
        color: color.urgentFg,
      },
      usedUp: {
        glyph: '→',
        text: t('search.usedUpWhen', { when: age }),
        color: color.muted,
      },
      staple: { glyph: '★', text: t('search.staple'), color: color.soonIcon },
    }[reason];
    const label = {
      expired: t('search.goneLabelExpired', { name, when: age }),
      usedUp: t('search.goneLabelUsedUp', { name, when: age }),
      staple: t('search.goneLabelStaple', { name }),
    }[reason];
    return (
      <IngredientTile
        key={suggestion.ingredientId}
        ingredientId={suggestion.ingredientId}
        aisleId={suggestion.aisle?.id ?? null}
        name={name}
        why={why}
        label={label}
        onSelect={() => onSelect(suggestion)}
      />
    );
  };
  return (
    <TileSection
      heading={t('search.gone')}
      count={entries.length}
      none={t('search.goneNone')}
    >
      {entries.map(tile)}
    </TileSection>
  );
}
