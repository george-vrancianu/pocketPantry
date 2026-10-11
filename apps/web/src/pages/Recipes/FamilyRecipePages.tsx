import { Alert, Link, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useState } from 'react';
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
  type FamilyRecipeDraft,
} from '../../lib/familyRecipes';
import { TipsEditor } from '../Admin/components/RecipeTips';
import { toGuidanceDraft, type GuidanceDraft } from '../Admin/guidanceDraft';
import { useRecipe, type RecipeDetail } from '../../lib/recipes';
import { FamilyGuidance, useMomentOptions } from './components/FamilyGuidance';
import { draftOfEdit, draftOfVariantDraft } from './familyDraft';
import { FamilyRecipeForm } from './components/FamilyRecipeForm';

/** The draft's guidance with its Pairing links named from the source Recipe (same order). */
function namedGuidance(
  draft: FamilyRecipeDraft,
  source: RecipeDetail | undefined,
): GuidanceDraft {
  const guidance = toGuidanceDraft(draft.guidance);
  const pairings = source?.guidance.pairings ?? [];
  return {
    ...guidance,
    pairings: guidance.pairings.map((pairing, index) => {
      const link = pairings[index]?.link;
      if (!link) return pairing;
      return link.type === 'ingredient'
        ? { ...pairing, linkName: link.name }
        : { ...pairing, linkTitle: link.title };
    }),
  };
}

/** "Make a variant": the editor opens on a copy of the Recipe being viewed. */
export function NewVariantPage() {
  const { t, i18n } = useTranslation(['recipes', 'common', 'errors']);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const draft = useVariantDraft(id, i18n.language);
  const create = useCreateFamilyRecipe(i18n.language);
  const momentOptions = useMomentOptions();
  // The draft carries link ids only; the source's own view names them.
  const source = useRecipe(id, i18n.language);
  const ready = draft.data !== undefined && !source.isPending;

  return (
    <>
      <AppScreenHeader title={t('recipes:family.newHeading')} />
      <Stack spacing={2.5}>
        {draft.error ? (
          <Alert>{translateApiError(t, draft.error)}</Alert>
        ) : null}
        {draft.isPending || (draft.data && source.isPending) ? (
          <Spinner label={t('common:loading')} />
        ) : null}
        {draft.data && ready ? (
          <FamilyRecipeForm
            heading={t('recipes:family.newHeading')}
            description={`${t('recipes:family.copyHint')} ${t('recipes:family.tipsHint')}`}
            initial={draftOfVariantDraft(draft.data)}
            saveLabel={t('recipes:family.create')}
            saving={create.isPending}
            error={create.error}
            guidance={{
              initial: namedGuidance(draft.data, source.data),
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
  /** Bumped after each save so the form reseeds with the new line and Step ids. */
  const [saves, setSaves] = useState(0);

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
              // Tip writes refresh `recipe` but must not reset unsaved edits; a save reseeds.
              key={`${recipe.id}-${saves}`}
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
                  onSuccess: () => setSaves((count) => count + 1),
                })
              }
              onCancel={() => navigate(`/recipes/${id}`)}
            />
            <Typography role="status" variant="body2">
              {saves > 0 && !update.isPending
                ? t('recipes:family.saved')
                : null}
            </Typography>
            <Link href={`/recipes/${id}`}>
              {t('recipes:family.viewRecipe')}
            </Link>
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
