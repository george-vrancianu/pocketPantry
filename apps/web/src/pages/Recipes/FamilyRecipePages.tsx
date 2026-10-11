import { Alert, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import {
  useCreateFamilyRecipe,
  useFamilyRecipeEdit,
  useFamilyTipWrites,
  useUpdateFamilyRecipe,
  useVariantDraft,
} from '../../lib/familyRecipes';
import { TipsEditor } from '../Admin/components/RecipeTips';
import { toGuidanceDraft } from '../Admin/guidanceDraft';
import { FamilyGuidance, useMomentOptions } from './components/FamilyGuidance';
import { draftOfEdit, draftOfVariantDraft } from './familyDraft';
import { FamilyRecipeForm } from './components/FamilyRecipeForm';

/** "Make a variant": the editor opens on a copy of the Recipe being viewed. */
export function NewVariantPage() {
  const { t, i18n } = useTranslation(['recipes', 'common', 'errors']);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const draft = useVariantDraft(id, i18n.language);
  const create = useCreateFamilyRecipe(i18n.language);
  const momentOptions = useMomentOptions();

  return (
    <>
      <AppScreenHeader title={t('recipes:family.newHeading')} />
      <Stack spacing={2.5}>
        {draft.error ? (
          <Alert>{translateApiError(t, draft.error)}</Alert>
        ) : null}
        {draft.isPending ? <Spinner label={t('common:loading')} /> : null}
        {draft.data ? (
          <FamilyRecipeForm
            heading={t('recipes:family.newHeading')}
            description={`${t('recipes:family.copyHint')} ${t('recipes:family.tipsHint')}`}
            initial={draftOfVariantDraft(draft.data)}
            saveLabel={t('recipes:family.create')}
            saving={create.isPending}
            error={create.error}
            guidance={{
              initial: toGuidanceDraft(draft.data.guidance),
              momentOptions,
            }}
            onSave={(document, guidance) =>
              create.mutate(
                {
                  parentId: draft.data.parentId,
                  document: { ...document, guidance },
                },
                { onSuccess: (saved) => navigate(`/recipes/${saved.id}`) },
              )
            }
            onCancel={() => navigate(`/recipes/${id}`)}
          />
        ) : null}
      </Stack>
    </>
  );
}

/** Edit one of the Family's own Recipes, with its own Tips below. */
export function EditFamilyRecipePage() {
  const { t, i18n } = useTranslation(['recipes', 'common', 'errors']);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useFamilyRecipeEdit(id, i18n.language);
  const update = useUpdateFamilyRecipe(id, i18n.language);
  const tipWrites = useFamilyTipWrites(id, i18n.language);
  const recipe = query.data;

  return (
    <>
      <AppScreenHeader title={recipe?.title ?? t('recipes:title')} />
      <Stack spacing={3}>
        {query.error ? (
          <Alert>{translateApiError(t, query.error)}</Alert>
        ) : null}
        {query.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipe && !recipe.archived ? (
          <>
            <FamilyRecipeForm
              // Keyed on the Recipe only: Tip writes refresh `recipe` but must not reset unsaved edits.
              key={recipe.id}
              heading={t('recipes:family.editHeading')}
              initial={draftOfEdit(recipe)}
              saveLabel={t('recipes:family.save')}
              saving={update.isPending}
              error={update.error}
              stepTipCount={(stepId) =>
                recipe.tips.filter((tip) => tip.stepId === stepId).length
              }
              onSave={(document) =>
                update.mutate(document, {
                  onSuccess: () => navigate(`/recipes/${id}`),
                })
              }
              onCancel={() => navigate(`/recipes/${id}`)}
            />
            <TipsEditor recipe={{ ...recipe, id }} writes={tipWrites} />
            <FamilyGuidance recipe={recipe} />
          </>
        ) : null}
        {recipe?.archived ? (
          <Typography>{t('recipes:family.unavailable')}</Typography>
        ) : null}
      </Stack>
    </>
  );
}
