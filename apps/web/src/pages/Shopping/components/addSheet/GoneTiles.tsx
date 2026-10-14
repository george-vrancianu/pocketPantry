import { Box, Link, tokens, focusRing } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useEmptyStateSearch } from '../../../../components/catalogSearch/emptyState/context';
import { IngredientTile } from '../../../../components/catalogSearch/emptyState/IngredientTile';
import {
  MAX_TILES,
  TileSection,
} from '../../../../components/catalogSearch/emptyState/TileSection';
import { useShortAgo } from '../../../../components/catalogSearch/emptyState/useShortAgo';
import { translateApiError } from '../../../../i18n/translateApiError';
import {
  goneInOrder,
  useDismissSuggestion,
  type GoneReason,
  type Suggestion,
  type Suggestions,
} from '../../../../lib/suggestions';
import { useSheetToast } from './SheetFooter';

export type GoneTilesProps = {
  suggestions: Suggestions;
  /** Called just before the tile's Ingredient is selected through the search (the Suggestion is not dismissed), e.g. to carry a Staple's amount. */
  onPick?: (suggestion: Suggestion) => void;
};

/** "Gone from your Pantry": expired, then Used Up, then missing Staples, as tiles saying why and when. */
export function GoneTiles({ suggestions, onPick }: GoneTilesProps) {
  const search = useEmptyStateSearch();
  const { t } = useTranslation('catalog');
  const { t: tShopping } = useTranslation('shopping');
  const toast = useSheetToast();
  const dismiss = useDismissSuggestion();
  const ago = useShortAgo();
  const all = goneInOrder(suggestions);
  const entries = all.slice(0, MAX_TILES);

  const dismissTile = (suggestion: Suggestion) => {
    void dismiss.mutateAsync(suggestion.ingredientId).then(
      () =>
        toast.show(
          tShopping('suggestions.dismissed', { name: suggestion.name }),
        ),
      (error: unknown) => toast.show(translateApiError(tShopping, error)),
    );
  };

  const tile = ({
    suggestion,
    reason,
  }: {
    suggestion: Suggestion;
    reason: GoneReason;
  }) => {
    const { name, since } = suggestion;
    const age = since === null ? '' : ago(since);
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
        onSelect={() => {
          onPick?.(suggestion);
          search?.select(suggestion.ingredient);
        }}
        action={
          <Box
            component="button"
            type="button"
            aria-label={tShopping('suggestions.dismiss', { name })}
            onClick={() => dismissTile(suggestion)}
            sx={{
              width: 24,
              height: 24,
              display: 'grid',
              placeItems: 'center',
              p: 0,
              font: 'inherit',
              fontSize: 16,
              lineHeight: 1,
              color: color.muted,
              background: 'none',
              border: 0,
              borderRadius: '50%',
              cursor: 'pointer',
              '&:hover': { backgroundColor: color.subtle },
              ...focusRing,
            }}
          >
            <span aria-hidden="true">×</span>
          </Box>
        }
      />
    );
  };
  return (
    <TileSection
      heading={t('search.gone')}
      count={all.length > 0 ? all.length : undefined}
      none={t('search.goneNone')}
      action={
        <Link href="/shopping/staples" sx={{ fontSize: 13, fontWeight: 700 }}>
          {tShopping('suggestions.manage')}
        </Link>
      }
    >
      {entries.map(tile)}
    </TileSection>
  );
}
