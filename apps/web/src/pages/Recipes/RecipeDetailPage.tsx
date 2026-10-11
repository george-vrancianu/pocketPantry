import { Alert, Link, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import { useRecipe } from '../../lib/recipes';
import { OwnerBadge } from './components/OwnerBadge';
import { RecipeMeta } from './components/RecipeMeta';
import { DETAIL_SECTIONS } from './components/sections';

/** One Recipe: header, then its sections; a Variant links back to its base. */
export function RecipeDetailPage() {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const { id = '' } = useParams();
  const query = useRecipe(id, i18n.language);
  const recipe = query.data;

  return (
    <>
      <AppScreenHeader title={recipe?.title ?? t('recipes:title')} />
      <Stack spacing={2.5}>
        {query.error ? (
          <Alert>{translateApiError(t, query.error)}</Alert>
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
                servings={recipe.servings}
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
              <Component key={key} recipe={recipe} />
            ))}
          </>
        ) : null}
        <Link href="/recipes">{t('recipes:backToList')}</Link>
      </Stack>
    </>
  );
}
