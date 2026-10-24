import { Alert, Link, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { RecipeDraftStatus } from '../../components/RecipeDraftStatus';
import {
  contentOfForm,
  formOfContent,
  type RecipeDraftForm,
} from '../../lib/recipeDraftContent';
import { useRecipeDraftAutosave } from '../../lib/recipeDraftAutosave';
import { useRecipeDraft, type RecipeDraftView } from '../../lib/recipeDrafts';
import {
  BaseRecipePicker,
  STANDALONE,
  noBasePick,
  type BaseRecipeOption,
} from '../../components/BaseRecipePicker';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { RemovableSourceLink, isSourceLink } from '../../components/SourceLink';
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
import { usePlateMatches } from '../../lib/plateRecipe';
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
  /** How many of the closest "Hide Recipes with my Allergies" left out; with it, the picker offers Show. */
  hiddenByAllergiesCount?: number;
  /** The page the draft was read from; kept on the Recipe unless the Member removes it. */
  sourceLink?: string | null;
  /** The language the page was translated from (a code like "fr"); only kept with the Source Link. */
  sourceLanguage?: string | null;
};

const blankGuidance = { nutritionNote: null, pairings: [], eatingMoments: [] };

/** The query parameter that carries the Recipe Draft id once it exists, so a reload resumes it. */
export const DRAFT_PARAM = 'draft';

/** "New Recipe": the Family Recipe form, blank or filled from a supplied draft or a resumed Recipe Draft; saved as a Base Recipe, or a Variant of the picked base. */
export function NewRecipePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'errors']);
  const draftParam = new URLSearchParams(location.search).get(DRAFT_PARAM);
  // `own` is the Recipe Draft this form created itself (it already holds it).
  // A new navigation (even to this same route) starts the form afresh, but not our own `draft` param.
  const [form, setForm] = useState({
    key: location.key,
    seen: location.key,
    own: null as string | null,
  });
  if (form.seen !== location.key) {
    const ours = form.own !== null && draftParam === form.own;
    setForm({
      key: ours ? form.key : location.key,
      seen: location.key,
      own: ours ? form.own : null,
    });
  }
  const resumeId =
    draftParam !== null && draftParam !== form.own ? draftParam : null;
  const resuming = useRecipeDraft(resumeId);
  if (resumeId !== null) {
    if (resuming.error) {
      return <Alert>{translateApiError(t, resuming.error)}</Alert>;
    }
    if (!resuming.data) return <Spinner label={t('common:loading')} />;
  }
  return (
    <NewRecipeContent
      key={form.key}
      supplied={suppliedOf(location.state)}
      resumed={resumeId !== null ? resuming.data : undefined}
      onDraftId={(id) => {
        if (id === draftParam) return;
        setForm((current) => ({ ...current, own: id }));
        // Replace: the Recipe Draft is the same page, not a new step in the history.
        const search = new URLSearchParams(location.search);
        search.set(DRAFT_PARAM, id);
        navigate(
          { pathname: location.pathname, search: `?${search}` },
          { replace: true, state: location.state },
        );
      }}
    />
  );
}

/** The route state if it is a supplied draft; anything else is ignored. */
function suppliedOf(state: unknown): NewRecipeState | null {
  if (typeof state !== 'object' || state === null) return null;
  const {
    draft,
    closestBases,
    hiddenByAllergiesCount,
    sourceLink,
    sourceLanguage,
  } = state as Partial<NewRecipeState>;
  if (typeof draft !== 'object' || draft === null) return null;
  if (!Array.isArray(draft.lines) || !Array.isArray(draft.steps)) return null;
  if (!Array.isArray(draft.tips)) return null;
  if (typeof draft.guidance !== 'object' || draft.guidance === null)
    return null;
  if (closestBases !== undefined && !Array.isArray(closestBases)) return null;
  if (
    hiddenByAllergiesCount !== undefined &&
    typeof hiddenByAllergiesCount !== 'number'
  )
    return null;
  // A Source Link that is not a web address would show a Remove button with nothing to remove.
  if (
    sourceLink !== undefined &&
    sourceLink !== null &&
    !(typeof sourceLink === 'string' && isSourceLink(sourceLink))
  )
    return null;
  if (
    sourceLanguage !== undefined &&
    sourceLanguage !== null &&
    typeof sourceLanguage !== 'string'
  )
    return null;
  return state as NewRecipeState;
}

function NewRecipeContent({
  supplied,
  resumed,
  onDraftId,
}: {
  supplied: NewRecipeState | null;
  resumed?: RecipeDraftView;
  onDraftId: (id: string) => void;
}) {
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const navigate = useNavigate();
  const [basePick, setBasePick] = useState(noBasePick);
  const create = useCreateFamilyRecipe();
  const momentOptions = useMomentOptions();
  const [parentId, setParentId] = useState<string | null>(null);
  // The Member may drop the Source Link before saving, but not change it.
  const [resumedForm] = useState(() =>
    resumed ? formOfContent(resumed.content) : null,
  );
  const sourceLanguage = resumedForm
    ? resumedForm.sourceLanguage
    : supplied?.sourceLanguage;
  const [sourceLink, setSourceLink] = useState(
    resumedForm ? resumedForm.sourceLink : (supplied?.sourceLink ?? null),
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  // "Show" in the hidden-by-Allergies note asks the ranking again, hidden ones too, for the draft as it arrived.
  const [showHidden, setShowHidden] = useState(false);
  const revealed = usePlateMatches(
    {
      dishTitle: supplied?.draft.title ?? '',
      ingredientIds: [
        ...new Set(
          (supplied?.draft.lines ?? []).flatMap((line) =>
            line.ingredientId ? [line.ingredientId] : [],
          ),
        ),
      ],
      showHidden: true,
    },
    showHidden,
  );
  const suppliedBases = supplied?.closestBases ?? [];
  const suppliedHidden = supplied?.hiddenByAllergiesCount ?? 0;
  const closestBases = revealed.data?.matches ?? suppliedBases;
  const hiddenCount = revealed.data
    ? revealed.data.hiddenByAllergiesCount
    : suppliedHidden;
  // Nothing close and nothing hidden (or not matched yet): no picker, a Base Recipe.
  const hasBases = suppliedBases.length > 0 || suppliedHidden > 0;
  const [initial] = useState(() =>
    resumedForm
      ? resumedForm.draft
      : supplied
        ? draftOfVariantDraft(supplied.draft)
        : emptyDraft(),
  );
  const [initialGuidance] = useState(
    () =>
      resumedForm?.guidance ??
      (supplied
        ? namedGuidance(supplied.draft, undefined)
        : toGuidanceDraft(blankGuidance)),
  );
  // What the form holds now, for the Recipe Draft. A supplied fill is not kept yet.
  const [formState, setFormState] = useState<RecipeDraftForm>({
    draft: initial,
    guidance: initialGuidance,
  });
  const autosave = useRecipeDraftAutosave({
    kind: 'new_recipe',
    baseRecipeId: null,
    content: contentOfForm({ ...formState, sourceLink, sourceLanguage }),
    blank: contentOfForm({
      draft: emptyDraft(),
      guidance: toGuidanceDraft(blankGuidance),
    }),
    resumed: resumed ? { id: resumed.id, version: resumed.version } : undefined,
    enabled: supplied === null,
  });
  const { draftId } = autosave;
  useEffect(() => {
    if (draftId) onDraftId(draftId);
    // Only a new id goes to the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  return (
    <>
      <AppScreenHeader
        title={t('recipes:family.newRecipeHeading')}
        titleRef={headingRef}
        trailing={<RecipeDraftStatus status={autosave.status} />}
      />
      <Stack spacing={2.5}>
        {hasBases ? (
          <BaseRecipePicker
            pick={basePick}
            onPick={setBasePick}
            closest={closestBases}
            loading={showHidden && (revealed.isPending || revealed.isFetching)}
            hiddenByAllergiesCount={hiddenCount}
            onShowHidden={() => {
              // A failed Show leaves the answer in error (it never goes stale): ask again.
              if (showHidden) {
                if (revealed.isError) void revealed.refetch();
                return;
              }
              // Keep the current pick: the revealed list may rank it lower or drop it, so it stays offered.
              const current = closestBases.find((b) => b.id === parentId);
              setBasePick({
                ...basePick,
                chosen: parentId ?? STANDALONE,
                another: current ?? basePick.another,
              });
              setShowHidden(true);
            }}
            onChange={setParentId}
          />
        ) : null}
        {sourceLink ? (
          <RemovableSourceLink
            href={sourceLink}
            translatedFrom={sourceLanguage}
            onRemove={() => {
              setSourceLink(null);
              // The button unmounts with the row: keep focus on the page.
              headingRef.current?.focus();
            }}
          />
        ) : null}
        <FamilyRecipeForm
          heading={t('recipes:family.newRecipeHeading')}
          description={t('recipes:family.newRecipeHint')}
          initial={initial}
          saveLabel={t('recipes:family.save')}
          saving={create.isPending}
          error={create.error}
          guidance={{ initial: initialGuidance, momentOptions }}
          onChange={setFormState}
          onSave={async (document, guidance) => {
            // The Recipe Draft ends with the create, so it must be known first.
            const recipeDraftId = await autosave.flush();
            create.mutate(
              {
                parentId: hasBases ? parentId : null,
                document: {
                  ...document,
                  guidance,
                  ...(recipeDraftId ? { recipeDraftId } : {}),
                  ...(sourceLink ? { sourceLink } : {}),
                  // The language note belongs to the link: no link, no note.
                  ...(sourceLink && sourceLanguage ? { sourceLanguage } : {}),
                },
              },
              {
                onSuccess: (saved) => {
                  autosave.stop();
                  navigate(`/recipes/${saved.id}`);
                },
              },
            );
          }}
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
  /** The Member dropped the Source Link; it is only sent (and gone) once they save. */
  const [linkRemoved, setLinkRemoved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <AppScreenHeader
        title={recipe?.title ?? t('recipes:title')}
        titleRef={headingRef}
      />
      <Stack spacing={3}>
        {query.error ? (
          <Alert>{translateApiError(t, query.error)}</Alert>
        ) : null}
        {query.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipe && !recipe.archived ? (
          <>
            {recipe.sourceLink && !linkRemoved ? (
              <RemovableSourceLink
                href={recipe.sourceLink}
                translatedFrom={recipe.sourceLanguage}
                onRemove={() => {
                  setLinkRemoved(true);
                  // The button unmounts with the row: keep focus on the page.
                  headingRef.current?.focus();
                }}
              />
            ) : null}
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
                update.mutate(
                  // `null` clears the link (and its language); leaving it out keeps both.
                  linkRemoved ? { ...document, sourceLink: null } : document,
                  {
                    onSuccess: () => {
                      setSaves((count) => count + 1);
                      setLinkRemoved(false);
                    },
                  },
                )
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
