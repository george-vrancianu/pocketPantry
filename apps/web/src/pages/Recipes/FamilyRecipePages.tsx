import {
  Alert,
  Button,
  Link,
  Spinner,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  BaseRecipePicker,
  noBasePick,
  type BaseRecipeOption,
} from '../../components/BaseRecipePicker';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { SourceLink, isSourceLink } from '../../components/SourceLink';
import { translateApiError } from '../../i18n/translateApiError';
import {
  useCreateFamilyRecipe,
  useFamilyRecipeEdit,
  useFamilyTipWrites,
  useUpdateFamilyRecipe,
  useVariantDraft,
  type FamilyRecipeDraft,
} from '../../lib/familyRecipes';
import { TipsEditor } from '../../components/recipeEditor/RecipeTips';
import { emptyDraft } from '../../lib/recipeDraft';
import { toGuidanceDraft, type GuidanceDraft } from '../../lib/guidanceDraft';
import { useRecipe, type RecipeDetail } from '../../lib/recipes';
import { FamilyGuidance, useMomentOptions } from './components/FamilyGuidance';
import {
  draftOfEdit,
  draftOfVariantDraft,
  type NewRecipeDraft,
} from './familyDraft';
import { FamilyRecipeForm } from './components/FamilyRecipeForm';

/** The draft's guidance with its Pairing links named from the source Recipe (same order). */
function namedGuidance(
  draft: Pick<FamilyRecipeDraft, 'guidance'>,
  source: RecipeDetail | undefined,
): GuidanceDraft {
  const guidance = toGuidanceDraft(draft.guidance);
  const pairings = source?.guidance.pairings ?? [];
  return {
    ...guidance,
    pairings: guidance.pairings.map((pairing, index) => {
      const link = pairings[index]?.link;
      if (link?.type === 'ingredient' && link.id === pairing.linkTarget) {
        return { ...pairing, linkName: link.name };
      }
      if (link?.type === 'recipe' && link.id === pairing.linkTarget) {
        return { ...pairing, linkTitle: link.title };
      }
      return pairing;
    }),
  };
}

/**
 * What can be handed to the New Recipe page (react-router `location.state`) to open it filled:
 * a draft, and the closest Base Recipes to offer as its base. Without `closestBases` the page
 * saves a Base Recipe and shows no picker.
 */
export type NewRecipeState = {
  draft: NewRecipeDraft;
  closestBases?: BaseRecipeOption[];
  /** The page the draft was read from; kept on the Recipe unless the Member removes it. */
  sourceLink?: string | null;
};

const blankGuidance = { nutritionNote: null, pairings: [], eatingMoments: [] };

/** "New Recipe": the Family Recipe form, blank or filled from a supplied draft; saved as a Base Recipe, or a Variant of the picked base. */
export function NewRecipePage() {
  const location = useLocation();
  // A new navigation (even to this same route) starts the form afresh.
  return (
    <NewRecipeContent
      key={location.key}
      supplied={suppliedOf(location.state)}
    />
  );
}

/** The route state if it is a supplied draft; anything else is ignored. */
function suppliedOf(state: unknown): NewRecipeState | null {
  if (typeof state !== 'object' || state === null) return null;
  const { draft, closestBases, sourceLink } = state as Partial<NewRecipeState>;
  if (typeof draft !== 'object' || draft === null) return null;
  if (!Array.isArray(draft.lines) || !Array.isArray(draft.steps)) return null;
  if (closestBases !== undefined && !Array.isArray(closestBases)) return null;
  // A Source Link that is not a web address would show a Remove button with nothing to remove.
  if (
    sourceLink !== undefined &&
    sourceLink !== null &&
    !(typeof sourceLink === 'string' && isSourceLink(sourceLink))
  )
    return null;
  return state as NewRecipeState;
}

function NewRecipeContent({ supplied }: { supplied: NewRecipeState | null }) {
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const navigate = useNavigate();
  const [basePick, setBasePick] = useState(noBasePick);
  const create = useCreateFamilyRecipe();
  const momentOptions = useMomentOptions();
  const [parentId, setParentId] = useState<string | null>(null);
  // The Member may drop the Source Link before saving, but not change it.
  const [sourceLink, setSourceLink] = useState(supplied?.sourceLink ?? null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // No closest Base Recipes (none found, or not matched yet): no picker, a Base Recipe.
  const hasBases = (supplied?.closestBases?.length ?? 0) > 0;
  const [initial] = useState(() =>
    supplied ? draftOfVariantDraft(supplied.draft) : emptyDraft(),
  );

  return (
    <>
      <AppScreenHeader
        title={t('recipes:family.newRecipeHeading')}
        titleRef={headingRef}
      />
      <Stack spacing={2.5}>
        {supplied?.closestBases && hasBases ? (
          <BaseRecipePicker
            pick={basePick}
            onPick={setBasePick}
            closest={supplied.closestBases}
            onChange={setParentId}
          />
        ) : null}
        {sourceLink ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <SourceLink href={sourceLink} />
            <Button
              variant="ghost"
              onClick={() => {
                setSourceLink(null);
                // The button unmounts with the row: keep focus on the page.
                headingRef.current?.focus();
              }}
            >
              {t('recipes:sourceLink.remove')}
            </Button>
          </Stack>
        ) : null}
        <FamilyRecipeForm
          heading={t('recipes:family.newRecipeHeading')}
          description={t('recipes:family.newRecipeHint')}
          initial={initial}
          saveLabel={t('recipes:family.save')}
          saving={create.isPending}
          error={create.error}
          guidance={{
            initial: supplied
              ? namedGuidance(supplied.draft, undefined)
              : toGuidanceDraft(blankGuidance),
            momentOptions,
          }}
          onSave={(document, guidance) =>
            create.mutate(
              {
                parentId: hasBases ? parentId : null,
                document: {
                  ...document,
                  guidance,
                  ...(sourceLink ? { sourceLink } : {}),
                },
              },
              { onSuccess: (saved) => navigate(`/recipes/${saved.id}`) },
            )
          }
          onCancel={() => navigate('/recipes')}
        />
      </Stack>
    </>
  );
}

/** "Make a variant": the editor opens on a copy of the Recipe being viewed. */
export function NewVariantPage() {
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const draft = useVariantDraft(id);
  const create = useCreateFamilyRecipe();
  const momentOptions = useMomentOptions();
  // The draft carries link ids only; the source's own view names them.
  const source = useRecipe(id);
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
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useFamilyRecipeEdit(id);
  const update = useUpdateFamilyRecipe(id);
  const tipWrites = useFamilyTipWrites(id);
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
