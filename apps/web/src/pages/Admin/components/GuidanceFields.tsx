import { Stack, TextField, Typography, Button } from '@pocket-pantry/ui';
import { useId, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import {
  MAX_EATING_MOMENTS,
  MAX_NUTRITION_NOTE,
  MAX_PAIRINGS,
  PAIRING_KINDS,
  PAIRING_PRINCIPLES,
  type EatingMomentPolarity,
  type PairingKind,
  type PairingPrinciple,
} from '../../../lib/adminRecipes';
import {
  MAX_PAIRING_LABEL,
  MAX_PAIRING_REASON,
  emptyPairing,
  guidanceProblems,
  noteLength,
  type EatingMomentDraft,
  type GuidanceDraft,
  type LinkType,
  type PairingDraft,
} from '../guidanceDraft';
import { moved } from '../recipeDraft';
import { RowControls } from './RowControls';

export type MomentOption = { id: string; name: string; archived: boolean };

/** Picks the Recipe a Pairing links to; the Admin and the Family offer different Recipes. */
export type RecipePickerProps = {
  label: string;
  value: string;
  onChange: (recipeId: string) => void;
};
export type RecipePickerComponent = ComponentType<RecipePickerProps>;

type FieldsProps = {
  draft: GuidanceDraft;
  onChange: (draft: GuidanceDraft) => void;
  /** Eating Moments the editor can name (and, unless `canAddMoments` is false, add). */
  momentOptions: MomentOption[];
  /** False when the Member has no list of Eating Moments to pick from. */
  canAddMoments?: boolean;
  RecipePicker: RecipePickerComponent;
  /** Name of a linked Ingredient the Pairing already carries, when known. */
  ingredientName?: (id: string) => string | undefined;
};

/**
 * The guidance fields (Pairings, Nutrition Note, Eating Moments), controlled by
 * `draft`. Where the Eating Moments, linkable Recipes and Ingredient names come
 * from is injected, so the Admin and the Family editors share it.
 */
export function GuidanceFields({
  draft,
  onChange,
  momentOptions,
  canAddMoments = true,
  RecipePicker,
  ingredientName,
}: FieldsProps) {
  const { t } = useTranslation(['admin', 'recipes']);
  const problems = guidanceProblems(draft);
  const change = (patch: Partial<GuidanceDraft>) =>
    onChange({ ...draft, ...patch });
  const patchPairing = (key: number, patch: Partial<PairingDraft>) =>
    change({
      pairings: draft.pairings.map((p) =>
        p.key === key ? { ...p, ...patch } : p,
      ),
    });
  const patchMoment = (id: string, patch: Partial<EatingMomentDraft>) =>
    change({
      eatingMoments: draft.eatingMoments.map((m) =>
        m.eatingMomentId === id ? { ...m, ...patch } : m,
      ),
    });
  const count = noteLength(draft.nutritionNote);
  const pairingsFull = draft.pairings.length >= MAX_PAIRINGS;
  const momentsFull = draft.eatingMoments.length >= MAX_EATING_MOMENTS;
  const usedMoments = new Set(draft.eatingMoments.map((m) => m.eatingMomentId));
  const pickable = momentOptions.filter(
    (m) => !m.archived && !usedMoments.has(m.id),
  );

  return (
    <>
      <Stack
        component="fieldset"
        spacing={1.5}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <Typography component="legend" variant="body2" sx={{ fontWeight: 700 }}>
          {t('admin:recipe.guidance.pairings.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('admin:recipe.guidance.pairings.hint', { max: MAX_PAIRINGS })}
        </Typography>
        {draft.pairings.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('admin:recipe.guidance.pairings.empty')}
          </Typography>
        ) : null}
        {draft.pairings.map((pairing, index) => (
          <PairingRow
            key={pairing.key}
            pairing={pairing}
            position={index + 1}
            first={index === 0}
            last={index === draft.pairings.length - 1}
            RecipePicker={RecipePicker}
            ingredientName={ingredientName}
            onChange={(patch) => patchPairing(pairing.key, patch)}
            onMove={(offset) =>
              change({ pairings: moved(draft.pairings, index, offset) })
            }
            onRemove={() =>
              change({
                pairings: draft.pairings.filter((p) => p.key !== pairing.key),
              })
            }
          />
        ))}
        {problems.pairing ? (
          <Typography variant="body2" color="error">
            {t('admin:recipe.guidance.pairings.invalid')}
          </Typography>
        ) : null}
        {problems.linkPosition !== null ? (
          <Typography variant="body2" color="error">
            {t('admin:recipe.guidance.pairings.linkIncomplete', {
              position: problems.linkPosition,
            })}
          </Typography>
        ) : null}
        {pairingsFull ? (
          <Typography variant="body2" color="text.secondary">
            {t('admin:recipe.guidance.pairings.limit', { max: MAX_PAIRINGS })}
          </Typography>
        ) : null}
        <div>
          <Button
            variant="secondary"
            disabled={pairingsFull}
            onClick={() =>
              change({ pairings: [...draft.pairings, emptyPairing()] })
            }
          >
            {t('admin:recipe.guidance.pairings.add')}
          </Button>
        </div>
      </Stack>

      <Stack
        component="fieldset"
        spacing={1}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <Typography component="legend" variant="body2" sx={{ fontWeight: 700 }}>
          {t('admin:recipe.guidance.nutrition.title')}
        </Typography>
        <TextField
          label={t('admin:recipe.guidance.nutrition.label')}
          value={draft.nutritionNote}
          onChange={(event) => change({ nutritionNote: event.target.value })}
          error={problems.note}
          helperText={t('admin:recipe.guidance.nutrition.helper')}
          multiline
        />
        <Typography
          variant="body2"
          color={problems.note ? 'error' : 'text.secondary'}
        >
          {t('admin:recipe.guidance.nutrition.counter', {
            count,
            max: MAX_NUTRITION_NOTE,
          })}
        </Typography>
        {problems.note ? (
          <Typography variant="body2" color="error">
            {t('admin:recipe.guidance.nutrition.tooLong', {
              max: MAX_NUTRITION_NOTE,
            })}
          </Typography>
        ) : null}
      </Stack>

      <Stack
        component="fieldset"
        spacing={1.5}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <Typography component="legend" variant="body2" sx={{ fontWeight: 700 }}>
          {t('admin:recipe.guidance.eatingMoments.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('admin:recipe.guidance.eatingMoments.hint', {
            max: MAX_EATING_MOMENTS,
          })}
        </Typography>
        {draft.eatingMoments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('admin:recipe.guidance.eatingMoments.empty')}
          </Typography>
        ) : null}
        {draft.eatingMoments.map((use, index) => {
          const moment = momentOptions.find((m) => m.id === use.eatingMomentId);
          const name =
            moment?.name ?? t('admin:recipe.guidance.eatingMoments.unknown');
          return (
            <Stack key={use.eatingMomentId} spacing={0.5}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {name}
                {moment?.archived
                  ? ` (${t('admin:eatingMoment.archivedBadge')})`
                  : ''}
              </Typography>
              <TextField
                select
                label={t('admin:recipe.guidance.eatingMoments.polarity', {
                  name,
                })}
                value={use.polarity}
                onChange={(event) =>
                  patchMoment(use.eatingMomentId, {
                    polarity: event.target.value as EatingMomentPolarity,
                  })
                }
                slotProps={{ select: { native: true } }}
              >
                <option value="good_for">
                  {t('admin:recipe.guidance.eatingMoments.goodFor')}
                </option>
                <option value="avoid">
                  {t('admin:recipe.guidance.eatingMoments.avoid')}
                </option>
              </TextField>
              <TextField
                label={t('admin:recipe.guidance.eatingMoments.reason', {
                  name,
                })}
                value={use.reason}
                onChange={(event) =>
                  patchMoment(use.eatingMomentId, {
                    reason: event.target.value,
                  })
                }
                multiline
              />
              <RowControls
                moveUp={t('admin:recipe.guidance.eatingMoments.moveUp', {
                  name,
                })}
                moveDown={t('admin:recipe.guidance.eatingMoments.moveDown', {
                  name,
                })}
                remove={t('admin:recipe.guidance.eatingMoments.remove', {
                  name,
                })}
                first={index === 0}
                last={index === draft.eatingMoments.length - 1}
                onMoveUp={() =>
                  change({
                    eatingMoments: moved(draft.eatingMoments, index, -1),
                  })
                }
                onMoveDown={() =>
                  change({
                    eatingMoments: moved(draft.eatingMoments, index, 1),
                  })
                }
                onRemove={() =>
                  change({
                    eatingMoments: draft.eatingMoments.filter(
                      (m) => m.eatingMomentId !== use.eatingMomentId,
                    ),
                  })
                }
              />
            </Stack>
          );
        })}
        {momentsFull ? (
          <Typography variant="body2" color="text.secondary">
            {t('admin:recipe.guidance.eatingMoments.limit', {
              max: MAX_EATING_MOMENTS,
            })}
          </Typography>
        ) : !canAddMoments ? null : (
          <TextField
            select
            label={t('admin:recipe.guidance.eatingMoments.pick')}
            value=""
            onChange={(event) => {
              if (event.target.value === '') return;
              change({
                eatingMoments: [
                  ...draft.eatingMoments,
                  {
                    eatingMomentId: event.target.value,
                    polarity: 'good_for',
                    reason: '',
                  },
                ],
              });
            }}
            slotProps={{ select: { native: true } }}
          >
            <option value="">
              {t('admin:recipe.guidance.eatingMoments.pickNone')}
            </option>
            {pickable.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </TextField>
        )}
      </Stack>
    </>
  );
}

type RowProps = {
  pairing: PairingDraft;
  position: number;
  first: boolean;
  last: boolean;
  RecipePicker: RecipePickerComponent;
  ingredientName?: (id: string) => string | undefined;
  onChange: (patch: Partial<PairingDraft>) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
};

function PairingRow({
  pairing,
  position,
  first,
  last,
  RecipePicker,
  ingredientName,
  onChange,
  onMove,
  onRemove,
}: RowProps) {
  const { t } = useTranslation(['admin', 'recipes']);
  const p = { position };
  const linkedId = `${useId()}-linked-ingredient`;
  const linkedName =
    pairing.linkType === 'ingredient' && pairing.linkTarget
      ? (pairing.linkName ?? ingredientName?.(pairing.linkTarget))
      : undefined;
  return (
    <Stack
      component="fieldset"
      spacing={1}
      sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
    >
      <Typography component="legend" variant="body2" sx={{ fontWeight: 700 }}>
        {t('admin:recipe.guidance.pairings.heading', p)}
      </Typography>
      <TextField
        select
        label={t('admin:recipe.guidance.pairings.kind', p)}
        value={pairing.kind}
        onChange={(event) =>
          onChange({ kind: event.target.value as PairingKind })
        }
        slotProps={{ select: { native: true } }}
      >
        {PAIRING_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {kind === 'food'
              ? t('admin:recipe.guidance.pairings.kindFood')
              : t('admin:recipe.guidance.pairings.kindDrink')}
          </option>
        ))}
      </TextField>
      <TextField
        label={t('admin:recipe.guidance.pairings.label', p)}
        value={pairing.label}
        onChange={(event) => onChange({ label: event.target.value })}
        slotProps={{ htmlInput: { maxLength: MAX_PAIRING_LABEL } }}
      />
      <TextField
        label={t('admin:recipe.guidance.pairings.reason', p)}
        value={pairing.reason}
        onChange={(event) => onChange({ reason: event.target.value })}
        slotProps={{ htmlInput: { maxLength: MAX_PAIRING_REASON } }}
        multiline
      />
      <TextField
        select
        label={t('admin:recipe.guidance.pairings.principle', p)}
        value={pairing.principle}
        onChange={(event) =>
          onChange({ principle: event.target.value as PairingPrinciple | '' })
        }
        slotProps={{ select: { native: true } }}
      >
        <option value="">
          {t('admin:recipe.guidance.pairings.principleNone')}
        </option>
        {PAIRING_PRINCIPLES.map((principle) => (
          <option key={principle} value={principle}>
            {t(`recipes:principles.${principle}`)}
          </option>
        ))}
      </TextField>
      <TextField
        select
        label={t('admin:recipe.guidance.pairings.linkType', p)}
        value={pairing.linkType}
        onChange={(event) =>
          onChange({
            linkType: event.target.value as LinkType,
            linkTarget: '',
            linkName: undefined,
          })
        }
        slotProps={{ select: { native: true } }}
      >
        <option value="none">
          {t('admin:recipe.guidance.pairings.linkNone')}
        </option>
        <option value="ingredient">
          {t('admin:recipe.guidance.pairings.linkIngredient')}
        </option>
        <option value="recipe">
          {t('admin:recipe.guidance.pairings.linkRecipe')}
        </option>
      </TextField>
      {pairing.linkType === 'ingredient' ? (
        <Stack spacing={0.5}>
          {linkedName ? (
            <Typography variant="body2" id={linkedId}>
              {t('admin:recipe.guidance.pairings.linkedIngredient', {
                name: linkedName,
              })}
            </Typography>
          ) : null}
          <CatalogSearch
            label={t('admin:recipe.guidance.pairings.linkIngredientTarget', p)}
            describedBy={linkedName ? linkedId : undefined}
            onSelect={(ingredient) =>
              onChange({ linkTarget: ingredient.id, linkName: ingredient.name })
            }
          />
        </Stack>
      ) : null}
      {pairing.linkType === 'recipe' ? (
        <RecipePicker
          label={t('admin:recipe.guidance.pairings.linkRecipeTarget', p)}
          value={pairing.linkTarget}
          onChange={(linkTarget) => onChange({ linkTarget })}
        />
      ) : null}
      <RowControls
        moveUp={t('admin:recipe.guidance.pairings.moveUp', p)}
        moveDown={t('admin:recipe.guidance.pairings.moveDown', p)}
        remove={t('admin:recipe.guidance.pairings.remove', p)}
        first={first}
        last={last}
        onMoveUp={() => onMove(-1)}
        onMoveDown={() => onMove(1)}
        onRemove={onRemove}
      />
    </Stack>
  );
}
