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
import { Link } from 'react-router-dom';
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
import { useRecipeDrafts } from '../../lib/recipeDrafts';
import { useRecipeDraftDiscard } from './useRecipeDraftDiscard';
import { CookTonightCardLink } from './components/CookTonightCardLink';
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
  // "Show" in the hidden-by-Allergies note asks the list and the Cook Tonight card for everything.
  const [showHidden, setShowHidden] = useState(false);
  const recipes = useRecipes(browse, { showHidden });
  const filters = useRecipeFilters();
  const cookTonight = useCookTonight(
    // oxlint-disable-next-line react/purity -- "today" must follow the clock across midnight; freezing it would leave a Member on a stale day
    localIso(new Date()),
    showHidden,
  );
  // Recipe Drafts are not Recipes: just an entry to the list, hidden when there are none (ADR 0028).
  const drafts = useRecipeDrafts();
  const discarding = useRecipeDraftDiscard({ takeFromForm: true });
  const draftCount =
    drafts.data?.filter((draft) => !discarding.hiddenIds.has(draft.id))
      .length ?? 0;
  const headingId = useId();
  const items = recipes.data?.recipes ?? [];
  const filtering = isFiltering(browse);
  const cards = cookTonight.data?.cards ?? [];
  const index = indexCards(cards);

  return (
    <>
      <AppScreenHeader
        title={t('recipes:title')}
        action={{
          label: t('recipes:add'),
          icon: <PlusIcon size={20} />,
          items: [
            { label: t('recipes:family.newRecipe'), href: '/recipes/new' },
            {
              label: t('recipes:fromLink.menuItem'),
              href: '/recipes/from-link',
            },
          ],
        }}
      />
      {/* Flex gap leaves the children's margins alone, so the filters can bleed to the screen edges. */}
      <Stack spacing={1.5} useFlexGap>
        {/* Hidden until the answer arrives, so an error or a slow load never reads as "nothing to cook". */}
        {!filtering && cookTonight.data && !cookTonight.error ? (
          <CookTonightCardLink cards={cards} />
        ) : null}
        {draftCount > 0 ? (
          <Box
            component={Link}
            to="/recipes/drafts"
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: tokens.color.accent,
              textDecoration: 'none',
            }}
          >
            {t('recipes:drafts.entry', { count: draftCount })}
          </Box>
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
