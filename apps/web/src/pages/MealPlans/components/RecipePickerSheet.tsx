import { Alert, Box, Sheet, Spinner, Typography } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  isFiltering,
  useRecipeFilters,
  useRecipes,
  type RecipeBrowse,
} from '../../../lib/recipes';
import { RecipeFilters } from '../../Recipes/components/RecipeFilters';
import { RecipeRow } from '../../Recipes/components/RecipeRow';

type Props = {
  open: boolean;
  /** "Dinner on Fri 16 Oct". */
  context: string;
  /** A failed slot write, shown here because the picker covers the page. */
  error: string | null;
  onPick: (recipeId: string) => void;
  onClose: () => void;
};

/** Every Recipe the Family can see, with the Recipes list's search and filters. */
export function RecipePickerSheet({
  open,
  context,
  error,
  onPick,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation(['mealPlans', 'recipes', 'common']);
  const [browse, setBrowse] = useState<RecipeBrowse>({
    search: '',
    cuisineId: '',
    methodId: '',
  });
  const recipes = useRecipes(browse, i18n.language, {
    includeVariants: true,
  });
  const filters = useRecipeFilters(i18n.language);
  const items = recipes.data ?? [];
  const filtering = isFiltering(browse);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={t('mealPlans:picker.title')}
      header={
        <Box sx={{ px: 3, pt: 2 }}>
          <Typography component="h2" variant="h3">
            {t('mealPlans:picker.title')}
          </Typography>
          <Typography variant="meta" color="text.secondary">
            {context}
          </Typography>
          <RecipeFilters
            value={browse}
            onChange={setBrowse}
            options={filters.data}
          />
        </Box>
      }
    >
      <Box sx={{ px: 3, pb: 2 }}>
        {error ? <Alert>{error}</Alert> : null}
        {recipes.error ? (
          <Alert>{translateApiError(t, recipes.error)}</Alert>
        ) : null}
        {recipes.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipes.data && items.length === 0 ? (
          <Typography color="text.secondary">
            {filtering ? t('recipes:noMatches') : t('recipes:empty')}
          </Typography>
        ) : null}
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {items.map((recipe) => (
            <RecipeRow
              key={recipe.id}
              recipe={recipe}
              card={undefined}
              filtering
              onSelect={() => onPick(recipe.id)}
            />
          ))}
        </Box>
      </Box>
    </Sheet>
  );
}
