import { Alert, Link, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { RecipeDraftStatus } from '../../components/RecipeDraftStatus';
import {
  useRecipeDraftFormSession,
  type RecipeDraftRouteProps,
} from './useRecipeDraftFormSession';
import {
  contentOfForm,
  formOfContent,
  type RecipeDraftForm,
} from '../../lib/recipeDraftContent';
import { DRAFT_PARAM, useRecipeDraftRoute } from './useRecipeDraftRoute';
import { RecipeDraftContinue } from './RecipeDraftContinue';
import { plateMatchInput, useResumedPlateBases } from './useResumedPlateBases';
import { useRecipeDraftAutosave } from '../../lib/recipeDraftAutosave';
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
  useFamilyRecipeEdit,
  useFamilyTipWrites,
  useUpdateFamilyRecipe,
  useVariantDraft,
  type FamilyRecipeDraft,
} from '../../lib/familyRecipes';
import { useDeferredRemoval } from '../../lib/useDeferredRemoval';
import { RecipeTipsCard } from './components/RecipeTipsCard';
import { emptyDraft } from '../../lib/recipeDraft';
import { toGuidanceDraft, type GuidanceDraft } from '../../lib/guidanceDraft';
import { usePlateMatches } from '../../lib/plateRecipe';
import {
  recipesQueryKey,
  useRecipe,
  type RecipeDetail,
} from '../../lib/recipes';
import { FamilyGuidance, useMomentOptions } from './components/FamilyGuidance';
import {
  draftOfEdit,
  draftOfVariantDraft,
  type FamilyDraft,
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

/** The route's Recipe Draft handles, as one object for the form. */
function routePropsOf(
  route: ReturnType<typeof useRecipeDraftRoute>,
): RecipeDraftRouteProps {
  return {
    resumed: route.resumed,
    onDraftId: route.onDraftId,
    onLoadLatest: route.adopt,
  };
}

/** "New Recipe": the Family Recipe form, blank or filled from a supplied draft or a resumed Recipe Draft; saved as a Base Recipe, or a Variant of the picked base. */
export function NewRecipePage() {
  const location = useLocation();
  const { t } = useTranslation(['common', 'errors', 'recipes']);
  const route = useRecipeDraftRoute();
  const draftRoute = routePropsOf(route);
  if (route.error || route.loading) {
    return (
      <>
        <AppScreenHeader
          title={t('recipes:family.newRecipeHeading')}
          back={{ label: t('recipes:back'), href: '/recipes' }}
        />
        {route.error ? (
          <Alert>{translateApiError(t, route.error)}</Alert>
        ) : (
          <Spinner label={t('common:loading')} />
        )}
      </>
    );
  }
  // A resumed Recipe Draft holds everything; the state a reload kept would only repeat it.
  const supplied = route.resumed ? null : suppliedOf(location.state);
  const resuming = new URLSearchParams(location.search).has(DRAFT_PARAM);
  return (
    <RecipeDraftContinue
      key={route.formKey}
      active={supplied === null && !resuming}
      kind="new_recipe"
      baseRecipeId={null}
      title={t('recipes:family.newRecipeHeading')}
    >
      <NewRecipeContent supplied={supplied} draftRoute={draftRoute} />
    </RecipeDraftContinue>
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
  draftRoute,
}: {
  supplied: NewRecipeState | null;
  draftRoute: RecipeDraftRouteProps;
}) {
  const { resumed } = draftRoute;
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const [basePick, setBasePick] = useState(noBasePick);
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
  const session = useRecipeDraftFormSession({
    autosave,
    route: draftRoute,
    finishing,
    setFinishing,
  });
  // A read that counted against a Cap must not be lost: no waiting for an edit.
  useEffect(() => {
    if (supplied) void autosave.flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FamilyRecipeForm
      header={{
        title: t('recipes:family.newRecipeHeading'),
        titleRef: headingRef,
        back: { label: t('recipes:back'), href: '/recipes' },
        subline: <RecipeDraftStatus status={autosave.status} />,
      }}
      openTab="details"
      hint={t('recipes:family.newRecipeHint')}
      stepsHint={t('recipes:family.tips.newHint')}
      detailsTop={
        <>
          {hasBases && resumedBases.ready ? (
            <BaseRecipePicker
              pick={pick}
              onPick={setBasePick}
              closest={closestBases}
              loading={
                showHidden && (revealed.isPending || revealed.isFetching)
              }
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
          {resumed?.kind === 'variant' && !resumed.baseAvailable ? (
            <Alert severity="info">{t('recipes:drafts.baseGone')}</Alert>
          ) : null}
        </>
      }
      notices={session.notices}
      detailsEnd={session.discardButton}
      initial={initial}
      saving={session.saving}
      error={session.create.error}
      guidance={{ initial: initialGuidance, momentOptions }}
      onChange={setFormState}
      onSave={(document, guidance) =>
        session.save({
          parentId: hasBases ? parentId : null,
          document,
          guidance,
          extra: {
            ...(sourceLink ? { sourceLink } : {}),
            // The language note belongs to the link: no link, no note.
            ...(sourceLink && sourceLanguage ? { sourceLanguage } : {}),
          },
        })
      }
    />
  );
}

/** "Make a variant": the editor opens on a copy of the Recipe being viewed, or on a resumed Recipe Draft of this base. */
export function NewVariantPage() {
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const { id = '' } = useParams();
  const location = useLocation();
  const route = useRecipeDraftRoute();
  const draftRoute = routePropsOf(route);
  const resuming = new URLSearchParams(location.search).has(DRAFT_PARAM);
  const title = t('recipes:family.newHeading');
  if (route.error || route.loading) {
    return (
      <>
        <AppScreenHeader title={title} />
        {route.error ? (
          <Alert>{translateApiError(t, route.error)}</Alert>
        ) : (
          <Spinner label={t('common:loading')} />
        )}
      </>
    );
  }
  // The base is archived (or not visible): the Recipe Draft carries on as a New Recipe (ADR 0028).
  if (
    route.resumed &&
    (!route.resumed.baseAvailable || !route.resumed.baseRecipeId)
  ) {
    return (
      <Navigate
        to={`/recipes/new?${DRAFT_PARAM}=${route.resumed.id}`}
        replace
      />
    );
  }
  // The Recipe Draft belongs to another base: open it under that base, so Save makes a Variant of the right one.
  if (route.resumed?.baseRecipeId && route.resumed.baseRecipeId !== id) {
    return (
      <Navigate
        to={`/recipes/${route.resumed.baseRecipeId}/variant/new?${DRAFT_PARAM}=${route.resumed.id}`}
        replace
      />
    );
  }
  return (
    <RecipeDraftContinue
      key={route.formKey}
      active={!resuming}
      kind="variant"
      baseRecipeId={id}
      title={title}
    >
      <NewVariantContent baseId={id} draftRoute={draftRoute} />
    </RecipeDraftContinue>
  );
}

function NewVariantContent({
  baseId: id,
  draftRoute,
}: {
  baseId: string;
  draftRoute: RecipeDraftRouteProps;
}) {
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const draft = useVariantDraft(id);
  // The draft carries link ids only; the source's own view names them.
  const source = useRecipe(id);
  const ready = draft.data !== undefined && !source.isPending;

  return (
    <>
      {draft.error ? (
        <>
          <AppScreenHeader title={t('recipes:family.newHeading')} />
          <Alert>{translateApiError(t, draft.error)}</Alert>
        </>
      ) : null}
      {!ready && !draft.error ? (
        <>
          <AppScreenHeader title={t('recipes:family.newHeading')} />
          <Spinner label={t('common:loading')} />
        </>
      ) : null}
      {draft.data && ready ? (
        <VariantForm
          baseId={id}
          prefill={draft.data}
          source={source.data}
          draftRoute={draftRoute}
        />
      ) : null}
    </>
  );
}

/** The Variant form once the base's copy is here; autosaves like New Recipe, with the base stored on the Recipe Draft. */
function VariantForm({
  baseId,
  prefill,
  source,
  draftRoute,
}: {
  baseId: string;
  prefill: FamilyRecipeDraft;
  source: RecipeDetail | undefined;
  draftRoute: RecipeDraftRouteProps;
}) {
  const { resumed } = draftRoute;
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const momentOptions = useMomentOptions();
  const [finishing, setFinishing] = useState(false);
  const [resumedForm] = useState(() =>
    resumed ? formOfContent(resumed.content) : null,
  );
  // The untouched form is the copy of the base: no Recipe Draft until the Member changes it.
  const [copy] = useState(() => ({
    draft: draftOfVariantDraft(prefill),
    guidance: namedGuidance(prefill, source),
  }));
  const [initial] = useState(() => ({
    draft: resumedForm?.draft ?? copy.draft,
    guidance: resumedForm?.guidance ?? copy.guidance,
  }));
  const [formState, setFormState] = useState<RecipeDraftForm>(initial);
  const autosave = useRecipeDraftAutosave({
    kind: 'variant',
    baseRecipeId: baseId,
    content: contentOfForm(formState),
    blank: contentOfForm(copy),
    resumed: resumed ? { id: resumed.id, version: resumed.version } : undefined,
  });
  const session = useRecipeDraftFormSession({
    autosave,
    route: draftRoute,
    finishing,
    setFinishing,
  });

  return (
    <FamilyRecipeForm
      header={{
        title: t('recipes:family.newHeading'),
        back: { label: t('recipes:back'), href: `/recipes/${baseId}` },
        subline: <RecipeDraftStatus status={autosave.status} />,
      }}
      openTab="details"
      stepsHint={t('recipes:family.tips.variantHint')}
      hint={t('recipes:family.copyHint', {
        source: source?.title ?? prefill.title,
      })}
      notices={session.notices}
      detailsEnd={session.discardButton}
      initial={initial.draft}
      saving={session.saving}
      error={session.create.error}
      guidance={{ initial: initial.guidance, momentOptions }}
      onChange={setFormState}
      onSave={(document, guidance) =>
        session.save({ parentId: prefill.parentId, document, guidance })
      }
    />
  );
}

/** Edit one of the Family's own Recipes, with its own Tips below. */
export function EditFamilyRecipePage() {
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const { id = '' } = useParams();
  const query = useFamilyRecipeEdit(id);
  const update = useUpdateFamilyRecipe(id);
  const tipWrites = useFamilyTipWrites(id);
  // Deleting a Tip waits for its Undo window to end (ADR 0009).
  const tipRemoval = useDeferredRemoval(
    [...recipesQueryKey, 'edit', id],
    tipWrites.remove.mutateAsync,
  );
  const recipe = query.data;
  /** Bumped after each save so the form reseeds with the new line and Step ids. */
  const [saves, setSaves] = useState(0);
  /** The Member dropped the Source Link; it is only sent (and gone) once they save. */
  const [linkRemoved, setLinkRemoved] = useState(false);
  /** What the form holds now, for Suggest Guidance in the Guidance section below it. */
  const [page, setPage] = useState<FamilyDraft | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const back = { label: t('recipes:back'), href: `/recipes/${id}` };
  const tipError =
    tipWrites.add.error ??
    tipWrites.update.error ??
    tipWrites.remove.error ??
    tipWrites.hide.error;
  const tips = (recipe?.tips ?? []).filter(
    (tip) => !tipRemoval.hiddenIds.has(tip.id),
  );
  const tipActions = {
    add: (text: string, stepId: string | null) =>
      tipWrites.add.mutateAsync({ text, stepId }),
    update: (tipId: string, text: string) =>
      tipWrites.update.mutate({ tipId, text }),
    remove: (tipId: string) =>
      tipRemoval.remove(tipId, '', t('recipes:family.tips.deleted'), {
        polite: true,
      }),
  };
  if (!recipe || recipe.archived) {
    return (
      <>
        <AppScreenHeader
          title={recipe?.title ?? t('recipes:title')}
          back={back}
        />
        <Stack spacing={3}>
          {query.error ? (
            <Alert>{translateApiError(t, query.error)}</Alert>
          ) : null}
          {query.isPending ? <Spinner label={t('common:loading')} /> : null}
          {recipe?.archived ? (
            <Typography>{t('recipes:family.unavailable')}</Typography>
          ) : null}
        </Stack>
      </>
    );
  }
  return (
    <FamilyRecipeForm
      // Tip writes refresh `recipe` but must not reset unsaved edits; a save reseeds.
      seedKey={`${recipe.id}-${saves}`}
      header={{
        title: t('recipes:family.editHeading'),
        titleRef: headingRef,
        back,
      }}
      openTab="steps"
      detailsTop={
        recipe.sourceLink && !linkRemoved ? (
          <RemovableSourceLink
            href={recipe.sourceLink}
            translatedFrom={recipe.sourceLanguage}
            onRemove={() => {
              setLinkRemoved(true);
              // The button unmounts with the row: keep focus on the page.
              headingRef.current?.focus();
            }}
          />
        ) : null
      }
      notices={
        <>
          <Typography role="status" variant="body2">
            {saves > 0 && !update.isPending ? t('recipes:family.saved') : null}
          </Typography>
          {tipError ? <Alert>{translateApiError(t, tipError)}</Alert> : null}
        </>
      }
      stepsEnd={
        <>
          <Link href={`/recipes/${id}`}>{t('recipes:family.viewRecipe')}</Link>
          <RecipeTipsCard
            tips={tips.filter((tip) => tip.stepId === null)}
            parentTips={recipe.parentTips ?? undefined}
            actions={tipActions}
            busy={tipWrites.hide.isPending}
            onHide={(tipIds) => tipWrites.hide.mutate(tipIds)}
          />
          <FamilyGuidance recipe={recipe} page={page} />
        </>
      }
      initial={draftOfEdit(recipe)}
      onDraftChange={setPage}
      saving={update.isPending}
      error={update.error}
      stepTipCount={(stepId) =>
        tips.filter((tip) => tip.stepId === stepId).length
      }
      stepTips={{
        of: (stepId) => tips.filter((tip) => tip.stepId === stepId),
        actions: tipActions,
      }}
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
    />
  );
}
