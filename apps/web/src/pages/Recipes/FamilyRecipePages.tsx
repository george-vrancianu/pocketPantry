import {
  Alert,
  Button,
  Link,
  Spinner,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { RecipeDraftStatus } from '../../components/RecipeDraftStatus';
import {
  contentOfForm,
  formOfContent,
  type RecipeDraftForm,
} from '../../lib/recipeDraftContent';
import { useRecipeDraftRoute } from './useRecipeDraftRoute';
import { plateMatchInput, useResumedPlateBases } from './useResumedPlateBases';
import { RecipeDraftLimitNotice } from './components/RecipeDraftLimitNotice';
import type { DiscardedDraftState } from './useRecipeDraftDiscard';
import { useRecipeDraftAutosave } from '../../lib/recipeDraftAutosave';
import { type RecipeDraftView } from '../../lib/recipeDrafts';
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
  /** The fill came from a Plate Scan: the Recipe Draft is marked so (ADR 0028). */
  plateScan?: boolean;
};

const blankGuidance = { nutritionNote: null, pairings: [], eatingMoments: [] };

/** "New Recipe": the Family Recipe form, blank or filled from a supplied draft or a resumed Recipe Draft; saved as a Base Recipe, or a Variant of the picked base. */
export function NewRecipePage() {
  const location = useLocation();
  const { t } = useTranslation(['common', 'errors']);
  const route = useRecipeDraftRoute();
  if (route.error) return <Alert>{translateApiError(t, route.error)}</Alert>;
  if (route.loading) return <Spinner label={t('common:loading')} />;
  return (
    <NewRecipeContent
      key={route.formKey}
      // A resumed Recipe Draft holds everything; the state a reload kept would only repeat it.
      supplied={route.resumed ? null : suppliedOf(location.state)}
      resumed={route.resumed}
      onDraftId={route.onDraftId}
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
    plateScan,
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
  if (plateScan !== undefined && typeof plateScan !== 'boolean') return null;
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
  // True from the tap on Save until the create answers, so a second tap cannot make a second Recipe.
  const [finishing, setFinishing] = useState(false);
  const momentOptions = useMomentOptions();
  // The Member may drop the Source Link before saving, but not change it.
  const [resumedForm] = useState(() =>
    resumed ? formOfContent(resumed.content) : null,
  );
  // The picked base: a resumed one, else the top match the picker starts on.
  const [parentId, setParentId] = useState<string | null>(
    resumedForm?.pickedBaseId ?? supplied?.closestBases?.[0]?.id ?? null,
  );
  const plateScan = resumedForm ? resumedForm.plateScan : supplied?.plateScan;
  // Plate matches and the base picked before leaving are not stored: asked for again.
  // Once Save is tapped they stop, so the save's refetches do not wait on them.
  const resumedBases = useResumedPlateBases(resumedForm, !finishing);
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
      ...(resumedForm
        ? plateMatchInput(resumedForm.draft.title, resumedForm.draft.lines)
        : plateMatchInput(
            supplied?.draft.title ?? '',
            supplied?.draft.lines ?? [],
          )),
      showHidden: true,
    },
    showHidden && !finishing,
  );
  const offeredBases = supplied?.closestBases ?? resumedBases.closest;
  const offeredHidden =
    supplied?.hiddenByAllergiesCount ?? resumedBases.hiddenByAllergiesCount;
  const closestBases = revealed.data?.matches ?? offeredBases;
  const hiddenCount = revealed.data
    ? revealed.data.hiddenByAllergiesCount
    : offeredHidden;
  // Nothing close and nothing hidden (or not matched yet): no picker, a Base Recipe.
  // A resumed pick counts too: matches may be slow, empty or failed, and the pick must still be saved (ADR 0028).
  const hasBases =
    offeredBases.length > 0 ||
    offeredHidden > 0 ||
    (Boolean(resumedForm?.pickedBaseId) && !resumedBases.gone);
  // What the Member picked before leaving stays picked (named once looked up).
  const pick = {
    ...basePick,
    // A Plate Scan draft stores Standalone as no pick: it must not fall back to the top match.
    chosen:
      basePick.chosen ??
      resumedForm?.pickedBaseId ??
      (resumedForm?.plateScan ? STANDALONE : null),
    another: basePick.another ?? resumedBases.picked,
  };
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
  // What the form holds now, for the Recipe Draft.
  const [formState, setFormState] = useState<RecipeDraftForm>({
    draft: initial,
    guidance: initialGuidance,
  });
  const autosave = useRecipeDraftAutosave({
    kind: 'new_recipe',
    baseRecipeId: null,
    content: contentOfForm({
      ...formState,
      sourceLink,
      sourceLanguage,
      pickedBaseId: hasBases ? parentId : null,
      plateScan,
    }),
    // A supplied fill is kept at once, so nothing counts as blank.
    blank: supplied
      ? null
      : contentOfForm({
          draft: emptyDraft(),
          guidance: toGuidanceDraft(blankGuidance),
        }),
    resumed: resumed ? { id: resumed.id, version: resumed.version } : undefined,
  });
  const { draftId, flush } = autosave;
  const [discarding, setDiscarding] = useState(false);
  // A read that counted against a Cap must not be lost: no waiting for an edit.
  useEffect(() => {
    if (supplied) void flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // Only a new id goes to the URL, and not while the Recipe is being saved: the page is about to leave.
    if (draftId && !finishing) onDraftId(draftId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, finishing]);

  return (
    <>
      <AppScreenHeader
        title={t('recipes:family.newRecipeHeading')}
        titleRef={headingRef}
        trailing={<RecipeDraftStatus status={autosave.status} />}
      />
      <Stack spacing={2.5}>
        {hasBases && resumedBases.ready ? (
          <BaseRecipePicker
            pick={pick}
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
                ...pick,
                chosen: parentId ?? STANDALONE,
                another: current ?? pick.another,
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
        <RecipeDraftLimitNotice error={autosave.error} />
        <FamilyRecipeForm
          heading={t('recipes:family.newRecipeHeading')}
          description={t('recipes:family.newRecipeHint')}
          initial={initial}
          saveLabel={t('recipes:family.save')}
          saving={create.isPending || finishing || discarding}
          error={create.error}
          guidance={{ initial: initialGuidance, momentOptions }}
          onChange={setFormState}
          onSave={async (document, guidance) => {
            if (finishing) return;
            setFinishing(true);
            // The Recipe Draft ends with the create, so it must be known first.
            const recipeDraftId = await autosave.flush();
            // It is being consumed: no update may go out meanwhile.
            autosave.pause();
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
                onError: () => {
                  setFinishing(false);
                  autosave.resume();
                },
              },
            );
          }}
          onCancel={() => navigate('/recipes')}
        />
        {draftId ? (
          <Button
            variant="secondary"
            disabled={discarding || finishing}
            onClick={async () => {
              setDiscarding(true);
              // Let a write in flight land (it may be the create that gives the id), then keep autosave from writing again.
              const id = await autosave.flush();
              autosave.stop();
              // The Recipes page owns the Undo: this form is about to be gone.
              const state: DiscardedDraftState | null = id
                ? { discardRecipeDraft: { id } }
                : null;
              navigate('/recipes', { replace: true, state });
            }}
          >
            {t('recipes:drafts.discard')}
          </Button>
        ) : null}
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
