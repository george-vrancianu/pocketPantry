import { Alert, Snackbar, Spinner, Stack } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { translateApiError } from '../../i18n/translateApiError';
import { ApiError } from '../../lib/api';
import {
  useAddMissingToShoppingList,
  useRecipe,
  useRecipePantryMatch,
} from '../../lib/recipes';
import { RecipeHero } from './components/RecipeHero';
import { RecipeHeader } from './components/RecipeHeader';
import { linesToAdd } from './components/PantryStatus';
import { DETAIL_SECTIONS } from './components/sections';

/** One Recipe. Keyed by id so Servings and add results never leak across a Variant <-> base link. */
export function RecipeDetailPage() {
  const { id = '' } = useParams();
  return <RecipeDetail key={id} id={id} />;
}

/** Header, then the sections; a Variant links back to its base. */
function RecipeDetail({ id }: { id: string }) {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const query = useRecipe(id, i18n.language);
  const recipe = query.data;
  const [picked, setPicked] = useState<number | null>(null);
  const servings = picked ?? recipe?.servings ?? 1;
  const matchQuery = useRecipePantryMatch(id, servings, recipe !== undefined);
  const match = matchQuery.data;
  const addMissing = useAddMissingToShoppingList(id, i18n.language);
  const [added, setAdded] = useState<number | null>(null);
  const onAddMissing = () => {
    const count = linesToAdd(match).length;
    addMissing.mutate(servings, { onSuccess: () => setAdded(count) });
  };

  return (
    <>
      <RecipeHeader recipe={recipe} />
      <Stack spacing={2.5}>
        {query.error ? (
          <Alert>
            {query.error instanceof ApiError && query.error.status === 404
              ? t('recipes:notFound')
              : translateApiError(t, query.error)}
          </Alert>
        ) : null}
        {query.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipe ? (
          <>
            <RecipeHero recipe={recipe} servings={servings} />
            {DETAIL_SECTIONS.map(({ key, Component }) => (
              <Component
                key={key}
                recipe={recipe}
                servings={servings}
                onServingsChange={setPicked}
                match={match}
                stale={matchQuery.isPlaceholderData}
                adding={addMissing.isPending}
                addError={
                  addMissing.error
                    ? translateApiError(t, addMissing.error)
                    : null
                }
                onAddMissing={onAddMissing}
              />
            ))}
          </>
        ) : null}
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
