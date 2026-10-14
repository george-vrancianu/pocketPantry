import { Button, Stack, Typography } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useAdminRecipes,
  type AdminRecipeListItem,
} from '../../../lib/adminRecipes';

type Props = {
  onCreate: () => void;
  onEdit: (id: string) => void;
};

/** The Catalog Recipes, each Base Recipe followed by its Variants; archived ones are marked. */
export function RecipeList({ onCreate, onEdit }: Props) {
  const { t } = useTranslation(['admin', 'errors']);
  const query = useAdminRecipes();
  const headingId = useId();
  const recipes = query.data ?? [];
  const bases = recipes.filter((recipe) => recipe.parentId === null);
  const variantsOf = (id: string) =>
    recipes.filter((recipe) => recipe.parentId === id);

  const row = (recipe: AdminRecipeListItem) => (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Button
        variant="ghost"
        aria-label={t('admin:recipe.edit', { title: recipe.title })}
        onClick={() => onEdit(recipe.id)}
      >
        {recipe.title}
      </Button>
      {recipe.archived ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:recipe.archivedBadge')}
        </Typography>
      ) : null}
    </Stack>
  );

  return (
    <Stack spacing={1} component="section" aria-labelledby={headingId}>
      <Typography id={headingId} component="h2" variant="h6">
        {t('admin:recipe.title')}
      </Typography>
      <div>
        <Button onClick={onCreate}>{t('admin:recipe.new')}</Button>
      </div>
      {query.error ? (
        <Typography role="alert">
          {translateApiError(t, query.error)}
        </Typography>
      ) : null}
      {query.data && bases.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:recipe.empty')}
        </Typography>
      ) : null}
      <Stack
        component="ul"
        spacing={0.5}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {bases.map((base) => {
          const variants = variantsOf(base.id);
          return (
            <li key={base.id}>
              {row(base)}
              {variants.length > 0 ? (
                <Stack
                  component="ul"
                  aria-label={t('admin:recipe.variantsOf', {
                    title: base.title,
                  })}
                  sx={{ m: 0, pl: 4, listStyle: 'none' }}
                >
                  {variants.map((variant) => (
                    <li key={variant.id}>{row(variant)}</li>
                  ))}
                </Stack>
              ) : null}
            </li>
          );
        })}
      </Stack>
    </Stack>
  );
}
