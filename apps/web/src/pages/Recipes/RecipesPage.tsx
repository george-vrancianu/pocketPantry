import { Alert, PlusIcon, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import {
  isFiltering,
  useRecipeFilters,
  useRecipes,
  type RecipeBrowse,
} from '../../lib/recipes';
import { RecipeCard } from './components/RecipeCard';
import { RecipeFilters } from './components/RecipeFilters';

/** Browse Recipes: Base Recipes by default, Variants too once a search or filter is active. */
export function RecipesPage() {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const [browse, setBrowse] = useState<RecipeBrowse>({
    search: '',
    cuisineId: '',
    methodId: '',
  });
  const recipes = useRecipes(browse, i18n.language);
  const filters = useRecipeFilters(i18n.language);
  const items = recipes.data ?? [];

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
      <Stack spacing={2.5}>
        <RecipeFilters
          value={browse}
          onChange={setBrowse}
          options={filters.data}
        />
        {recipes.error ? (
          <Alert>{translateApiError(t, recipes.error)}</Alert>
        ) : null}
        {recipes.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipes.data && items.length === 0 ? (
          <Typography color="text.secondary">
            {isFiltering(browse) ? t('recipes:noMatches') : t('recipes:empty')}
          </Typography>
        ) : null}
        <Stack
          component="ul"
          spacing={1.5}
          sx={{ listStyle: 'none', m: 0, p: 0 }}
        >
          {items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </Stack>
      </Stack>
    </>
  );
}
