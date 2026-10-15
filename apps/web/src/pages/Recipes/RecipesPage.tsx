import {
  Alert,
  Box,
  PlusIcon,
  Spinner,
  Stack,
  tokens,
  displayType,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { HiddenByAllergiesNote } from '../../components/HiddenByAllergiesNote';
import { translateApiError } from '../../i18n/translateApiError';
import { cardFor, indexCards, useCookTonight } from '../../lib/cookTonight';
import { localIso } from '../../lib/pantry';
import {
  isFiltering,
  useRecipeFilters,
  useRecipes,
  type RecipeBrowse,
} from '../../lib/recipes';
import { CanMakeStrip } from './components/CanMakeStrip';
import { RecipeFilters } from './components/RecipeFilters';
import { RecipeRow } from './components/RecipeRow';
import { SectionLabel } from './components/SectionLabel';

/** Browse Recipes: Base Recipes by default, Variants too once a search or filter is active. */
export function RecipesPage() {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const [browse, setBrowse] = useState<RecipeBrowse>({
    search: '',
    cuisineId: '',
    methodId: '',
  });
  // "Show" in the hidden-by-Allergies note asks the list and the Can Make strip for everything.
  const [showHidden, setShowHidden] = useState(false);
  const recipes = useRecipes(browse, i18n.language, { showHidden });
  const filters = useRecipeFilters(i18n.language);
  const cookTonight = useCookTonight(
    i18n.language,
    localIso(new Date()),
    showHidden,
  );
  const headingId = useId();
  const items = recipes.data?.recipes ?? [];
  const filtering = isFiltering(browse);
  const cards = cookTonight.data?.cards ?? [];
  const canMakeCards = cards.filter((card) => card.canMake);
  const index = indexCards(cards);

  return (
    <>
      <AppScreenHeader
        title={t('recipes:title')}
        action={{
          label: t('recipes:family.newRecipe'),
          icon: <PlusIcon size={20} />,
          href: '/recipes/new',
        }}
      />
      {/* Flex gap leaves the children's margins alone, so the filters can bleed to the screen edges. */}
      <Stack spacing={1.5} useFlexGap>
        {!filtering && canMakeCards.length > 0 ? (
          <CanMakeStrip cards={canMakeCards} />
        ) : null}
        <RecipeFilters
          value={browse}
          onChange={setBrowse}
          options={filters.data}
        />
        <HiddenByAllergiesNote
          count={
            filtering
              ? (recipes.data?.hiddenByAllergiesCount ?? 0)
              : Math.max(
                  recipes.data?.hiddenByAllergiesCount ?? 0,
                  cookTonight.data?.hiddenByAllergiesCount ?? 0,
                )
          }
          onShow={() => setShowHidden(true)}
        />
        {recipes.error ? (
          <Alert>{translateApiError(t, recipes.error)}</Alert>
        ) : null}
        {recipes.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipes.data && items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: '32px' }}>
            <Box
              sx={{
                ...displayType,
                fontSize: 18,
              }}
            >
              {filtering ? t('recipes:noMatches') : t('recipes:empty')}
            </Box>
            <Box sx={{ fontSize: 14, color: tokens.color.muted, mt: '4px' }}>
              {filtering ? t('recipes:noMatchesHint') : t('recipes:emptyHint')}
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
                <RecipeRow
                  key={recipe.id}
                  recipe={recipe}
                  card={cardFor(index, recipe)}
                  filtering={filtering}
                />
              ))}
            </Box>
            {!filtering ? (
              <Box sx={{ fontSize: 13, color: tokens.color.muted, mt: '12px' }}>
                {t('recipes:variantsHint')}
              </Box>
            ) : null}
          </section>
        ) : null}
      </Stack>
    </>
  );
}
