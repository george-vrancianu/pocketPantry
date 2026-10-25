import {
  Alert,
  Box,
  Spinner,
  Stack,
  displayType,
  tokens,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { ExploreRow } from '../../components/ExploreRow';
import { HiddenByAllergiesNote } from '../../components/HiddenByAllergiesNote';
import { translateApiError } from '../../i18n/translateApiError';
import { useAddToFamily } from '../../lib/addToFamily';
import {
  isFiltering,
  useRecipeFilters,
  useRecipes,
  type RecipeBrowse,
} from '../../lib/recipes';
import { RecipeFilters } from './components/RecipeFilters';
import { SectionLabel } from './components/SectionLabel';

/**
 * Explore (`/recipes/explore`): the Catalog Base Recipes, each one tap from being added to the
 * Family. Searching or filtering lists Catalog Variants too.
 */
export function ExplorePage() {
  const { t } = useTranslation(['recipes', 'common']);
  const [browse, setBrowse] = useState<RecipeBrowse>({
    search: '',
    cuisineId: '',
    methodId: '',
  });
  const [showHidden, setShowHidden] = useState(false);
  const recipes = useRecipes(browse, { showHidden, scope: 'catalog' });
  const filters = useRecipeFilters();
  const { add, stateOf } = useAddToFamily();
  const headingId = useId();
  const items = recipes.data?.recipes ?? [];
  const filtering = isFiltering(browse);

  return (
    <>
      <AppScreenHeader
        title={t('recipes:explore.title')}
        back={{ label: t('recipes:explore.back'), href: '/recipes' }}
      />
      <Stack spacing={1.5} useFlexGap>
        <Box
          sx={{ fontSize: 13.5, color: tokens.color.muted, lineHeight: 1.4 }}
        >
          {t('recipes:explore.subline')}
        </Box>
        <RecipeFilters
          value={browse}
          onChange={setBrowse}
          options={filters.data}
        />
        <HiddenByAllergiesNote
          count={recipes.data?.hiddenByAllergiesCount ?? 0}
          onShow={() => setShowHidden(true)}
        />
        {recipes.error ? (
          <Alert>{translateApiError(t, recipes.error)}</Alert>
        ) : null}
        {recipes.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipes.data && items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: '32px' }}>
            <Box sx={{ ...displayType, fontSize: 18 }}>
              {t('recipes:noMatches')}
            </Box>
            <Box sx={{ fontSize: 14, color: tokens.color.muted, mt: '4px' }}>
              {t('recipes:noMatchesHint')}
            </Box>
          </Box>
        ) : null}
        {items.length > 0 ? (
          <section>
            <SectionLabel id={headingId} count={items.length}>
              {filtering ? t('recipes:matches') : t('recipes:allRecipes')}
            </SectionLabel>
            <Box
              component="ul"
              aria-labelledby={headingId}
              sx={{ listStyle: 'none', m: 0, p: 0 }}
            >
              {items.map((recipe) => (
                <ExploreRow
                  key={recipe.id}
                  recipe={recipe}
                  state={stateOf(recipe)}
                  onAdd={() => void add(recipe)}
                  filtering={filtering}
                />
              ))}
            </Box>
          </section>
        ) : null}
      </Stack>
    </>
  );
}
