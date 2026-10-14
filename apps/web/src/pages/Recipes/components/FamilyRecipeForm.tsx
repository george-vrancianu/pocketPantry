import { Stack, Typography } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/catalogSearch/CatalogSearch';
import type { FamilyRecipeDocument } from '../../../lib/familyRecipes';
import { useRecipeFilters } from '../../../lib/recipes';
import type { GuidanceInput } from '../../../lib/adminRecipes';
import {
  guidanceProblems,
  toGuidanceInput,
  type GuidanceDraft,
} from '../../../lib/guidanceDraft';
import type { MomentOption } from '../../../components/recipeEditor/GuidanceFields';
import { FamilyGuidanceFields } from './FamilyGuidance';
import { EditorForm } from '../../../components/EditorForm';
import { RecipeLinesSection } from '../../../components/recipeEditor/RecipeLinesSection';
import { RecipeMetaFields } from '../../../components/recipeEditor/RecipeMetaFields';
import { RecipeStepsSection } from '../../../components/recipeEditor/RecipeStepsSection';
import { documentOf, type FamilyDraft } from '../familyDraft';
import {
  hasProblems,
  newKey,
  problemsOf,
  type LineDraft,
} from '../../../lib/recipeDraft';

type Props = {
  heading: string;
  description?: string;
  initial: FamilyDraft;
  saveLabel: string;
  saving: boolean;
  error: unknown;
  /** How many own Tips a saved Step carries, for the warning before removing it. */
  stepTipCount?: (stepId: string) => number;
  /** The Recipe's guidance (a Variant draft's copy, or a blank one), edited and saved with the document. */
  guidance?: { initial: GuidanceDraft; momentOptions: MomentOption[] };
  onSave: (document: FamilyRecipeDocument, guidance?: GuidanceInput) => void;
  onCancel: () => void;
};

/**
 * The Family's Recipe document: metadata, Cuisine and Method from the curated
 * lists, Ingredient Lines (a Catalog Ingredient or a typed name) and Steps.
 * Family Recipes are never translated, so there is one text per field.
 */
export function FamilyRecipeForm({
  heading,
  description,
  initial,
  saveLabel,
  saving,
  error,
  stepTipCount,
  guidance,
  onSave,
  onCancel,
}: Props) {
  const { t, i18n } = useTranslation(['recipes', 'admin', 'common']);
  const filters = useRecipeFilters(i18n.language);
  const [draft, setDraft] = useState<FamilyDraft>(initial);
  const [searchKey, setSearchKey] = useState(0);
  const [guidanceDraft, setGuidanceDraft] = useState<GuidanceDraft | null>(
    guidance?.initial ?? null,
  );
  const [titleTouched, setTitleTouched] = useState(false);
  const problems = problemsOf(draft);
  const guidanceBad = guidanceDraft
    ? Object.values(guidanceProblems(guidanceDraft)).some(
        (problem) => problem !== false && problem !== null,
      )
    : false;
  const showTitleError = problems.title && titleTouched;

  const change = (patch: Partial<FamilyDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const addLine = (line: Pick<LineDraft, 'ingredientId' | 'name' | 'unit'>) =>
    change({
      lines: [
        ...draft.lines,
        { key: newKey(), quantity: '', optional: false, note: '', ...line },
      ],
    });

  return (
    <EditorForm
      heading={heading}
      description={description}
      error={error}
      canSave={!hasProblems(problems) && !guidanceBad}
      saving={saving}
      onSubmit={() =>
        onSave(
          documentOf(draft),
          guidanceDraft ? toGuidanceInput(guidanceDraft) : undefined,
        )
      }
      onCancel={onCancel}
      saveLabel={saveLabel}
    >
      <RecipeMetaFields
        draft={draft}
        problems={problems}
        titleLabel={t('recipes:family.title')}
        cuisineLabel={t('recipes:cuisine')}
        methodLabel={t('recipes:method')}
        cuisines={filters.data?.cuisines ?? []}
        methods={filters.data?.methods ?? []}
        showTitleError={showTitleError}
        onChange={change}
        onTitleBlur={() => setTitleTouched(true)}
      />

      <RecipeLinesSection
        lines={draft.lines}
        problems={problems}
        onChange={(lines) => change({ lines })}
        nameNote={(line) =>
          line.ingredientId === '' ? (
            <Typography component="span" variant="meta" color="text.secondary">
              {' '}
              ({t('recipes:family.freeTextNote')})
            </Typography>
          ) : null
        }
      >
        <CatalogSearch
          key={searchKey}
          onSelect={(ingredient) => {
            addLine({
              ingredientId: ingredient.id,
              name: ingredient.name,
              unit: ingredient.defaultUnit,
            });
            setSearchKey((value) => value + 1);
          }}
          onUseTyped={(name) => {
            addLine({ ingredientId: '', name, unit: 'g' });
            setSearchKey((value) => value + 1);
          }}
        />
      </RecipeLinesSection>

      <RecipeStepsSection
        steps={draft.steps}
        problems={problems}
        tipCount={(step) =>
          step.id && stepTipCount
            ? stepTipCount(step.id)
            : (step.tips?.length ?? 0)
        }
        onChange={(steps) => change({ steps })}
      />
      {guidance && guidanceDraft ? (
        <Stack
          spacing={2}
          component="section"
          aria-label={t('admin:recipe.guidance.title')}
        >
          <Typography variant="sectionLabel" color="text.secondary">
            {t('admin:recipe.guidance.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('recipes:family.guidanceHint')}
          </Typography>
          <FamilyGuidanceFields
            draft={guidanceDraft}
            onChange={setGuidanceDraft}
            momentOptions={guidance.momentOptions}
          />
        </Stack>
      ) : null}
    </EditorForm>
  );
}
