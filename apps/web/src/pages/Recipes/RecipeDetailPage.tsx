import {
  Alert,
  Link,
  Snackbar,
  Spinner,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import { ApiError } from '../../lib/api';
import {
  useAddMissingToShoppingList,
  useRecipe,
  useRecipePantryMatch,
} from '../../lib/recipes';
import { OwnerBadge } from './components/OwnerBadge';
import { RecipeMeta } from './components/RecipeMeta';
import { linesToAdd } from './components/PantryStatus';
import { DETAIL_SECTIONS } from './components/sections';

/** One Recipe: header, then its sections; a Variant links back to its base. */
export function RecipeDetailPage() {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const { id = '' } = useParams();
  const query = useRecipe(id, i18n.language);
  const recipe = query.data;
  const [picked, setPicked] = useState<number | null>(null);
  const servings = picked ?? recipe?.servings ?? 1;
  const match = useRecipePantryMatch(id, servings, recipe !== undefined).data;
  const addMissing = useAddMissingToShoppingList(id, i18n.language);
  const [added, setAdded] = useState<number | null>(null);
  const onAddMissing = () => {
    const count = linesToAdd(match).length;
    addMissing.mutate(servings, { onSuccess: () => setAdded(count) });
  };

  return (
    <>
      <AppScreenHeader title={recipe?.title ?? t('recipes:title')} />
      <Stack spacing={2.5}>
        {query.error ? (
          <Alert>
            {query.error instanceof ApiError && query.error.status === 404
              ? t('recipes:notFound')
              : translateApiError(t, query.error)}
          </Alert>
        ) : null}
        {addMissing.error ? (
          <Alert>{translateApiError(t, addMissing.error)}</Alert>
        ) : null}
        {query.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipe ? (
          <>
            <Stack spacing={0.5}>
              {recipe.base ? (
                <Link href={`/recipes/${recipe.base.id}`}>
                  {t('recipes:variantOf', { base: recipe.base.title })}
                </Link>
              ) : null}
              <OwnerBadge owner={recipe.owner} />
              <RecipeMeta
                cuisine={recipe.cuisine}
                method={recipe.method}
                prepMinutes={recipe.prepMinutes}
                cookMinutes={recipe.cookMinutes}
                difficulty={recipe.difficulty}
              />
              {recipe.archived ? (
                <Typography color="text.secondary">
                  {t('recipes:archived')}
                </Typography>
              ) : null}
            </Stack>
            {DETAIL_SECTIONS.map(({ key, Component }) => (
              <Component
                key={key}
                recipe={recipe}
                servings={servings}
                onServingsChange={setPicked}
                match={match}
                adding={addMissing.isPending}
                onAddMissing={onAddMissing}
              />
            ))}
          </>
        ) : null}
        <Link href="/recipes">{t('recipes:backToList')}</Link>
      </Stack>
      <Snackbar
        open={added !== null}
        onClose={() => setAdded(null)}
        bottom="aboveDock"
      >
        <Alert severity="success" role="status">
          {t('recipes:pantry.added', { count: added ?? 0 })}
        </Alert>
      </Snackbar>
    </>
  );
}
