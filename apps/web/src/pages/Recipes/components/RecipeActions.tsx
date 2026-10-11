import { Alert, Button, Stack } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ConfirmAction } from '../../../components/ConfirmAction';
import { translateApiError } from '../../../i18n/translateApiError';
import { useArchiveFamilyRecipe } from '../../../lib/familyRecipes';
import type { RecipeDetail } from '../../../lib/recipes';

/**
 * What a Member can do with a Recipe: make a Family Variant from it, and, on
 * the Family's own Recipes, edit or delete (archive) it.
 */
export function RecipeActions({ recipe }: { recipe: RecipeDetail }) {
  const { t, i18n } = useTranslation(['recipes', 'errors']);
  const navigate = useNavigate();
  const archive = useArchiveFamilyRecipe(recipe.id, i18n.language);
  const own = recipe.owner === 'family';
  // A Variant's parent is a Catalog Base Recipe, so a Family standalone Recipe
  // gets none; the Recipe and its base must also be live.
  const canMakeVariant =
    !recipe.archived &&
    !recipe.base?.archived &&
    !(own && recipe.parentId === null);

  const remove = () =>
    archive.mutate(undefined, {
      onSuccess: () =>
        navigate(recipe.base ? `/recipes/${recipe.base.id}` : '/recipes'),
    });

  return (
    <Stack spacing={1}>
      {archive.error ? (
        <Alert>{translateApiError(t, archive.error)}</Alert>
      ) : null}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {canMakeVariant ? (
          <Button
            variant="secondary"
            href={`/recipes/${recipe.id}/variant/new`}
          >
            {t('recipes:family.makeVariant')}
          </Button>
        ) : null}
        {own ? (
          <Button variant="secondary" href={`/recipes/${recipe.id}/edit`}>
            {t('recipes:family.edit')}
          </Button>
        ) : null}
      </Stack>
      {own ? (
        <ConfirmAction
          variant="text"
          label={t('recipes:family.delete')}
          message={t('recipes:family.deleteConfirm')}
          disabled={archive.isPending}
          onConfirm={remove}
        />
      ) : null}
    </Stack>
  );
}
