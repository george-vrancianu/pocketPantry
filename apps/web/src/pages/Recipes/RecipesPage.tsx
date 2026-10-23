import {
  Alert,
  Box,
  PlusIcon,
  Spinner,
  Stack,
  tokens,
  displayType,
  usePrefersReducedMotion,
} from '@pocket-pantry/ui';
import { useId, useRef, useState } from 'react';
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
import { CookTonightPrompt } from './components/CookTonightPrompt';
import { RecipeFilters } from './components/RecipeFilters';
import { RecipeRow } from './components/RecipeRow';
import { SectionLabel } from './components/SectionLabel';

/** Browse Recipes: Base Recipes by default, Variants too once a search or filter is active. */
export function RecipesPage() {
  const { t } = useTranslation(['recipes', 'common']);
  const [browse, setBrowse] = useState<RecipeBrowse>({
    search: '',
    cuisineId: '',
    methodId: '',
  });
  // "Show" in the hidden-by-Allergies note asks the list and the Can Make strip for everything.
  const [showHidden, setShowHidden] = useState(false);
  const recipes = useRecipes(browse, { showHidden });
  const filters = useRecipeFilters();
  const cookTonight = useCookTonight(
    // oxlint-disable-next-line react/purity -- "today" must follow the clock across midnight; freezing it would leave a Member on a stale day
    localIso(new Date()),
    showHidden,
  );
  const headingId = useId();
  const items = recipes.data?.recipes ?? [];
  const filtering = isFiltering(browse);
  const cards = cookTonight.data?.cards ?? [];
  // Expiring first, so the strip starts with what to cook before it expires; the rank decides within each group.
  const canMakeCards = cards
    .filter((card) => card.canMake)
    .sort((a, b) => Number(b.expiringCount > 0) - Number(a.expiringCount > 0));
  const expiringCount = canMakeCards.filter(
    (card) => card.expiringCount > 0,
  ).length;
  const reduceMotion = usePrefersReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
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
        {!filtering && expiringCount > 0 ? (
          <CookTonightPrompt
            count={expiringCount}
            onSeeThem={() =>
              stripRef.current?.scrollIntoView?.({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'start',
              })
            }
          />
        ) : null}
        {!filtering && canMakeCards.length > 0 ? (
          <div ref={stripRef}>
            <CanMakeStrip cards={canMakeCards} />
          </div>
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
