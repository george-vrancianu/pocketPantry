import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import { translateApiError } from '../../../i18n/translateApiError';
import { localName, type AdminCatalog } from '../../../lib/admin';
import {
  MAX_EATING_MOMENTS,
  MAX_NUTRITION_NOTE,
  MAX_PAIRINGS,
  PAIRING_KINDS,
  PAIRING_PRINCIPLES,
  useAdminRecipes,
  useSetGuidance,
  type AdminRecipe,
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
  toGuidanceDraft,
  toGuidanceInput,
  type EatingMomentDraft,
  type GuidanceDraft,
  type LinkType,
  type PairingDraft,
} from '../guidanceDraft';
import { moved } from '../recipeDraft';
import { RowControls } from './RowControls';

type Props = { recipe: AdminRecipe; catalog: AdminCatalog };

/**
 * Pairings, Nutrition Note and Eating Moments of a saved Recipe, saved together
 * through the guidance endpoint (its own Save, like Tips are separate from the
 * Recipe document). Saved Pairings keep their id so translations survive.
 */
export function RecipeGuidance({ recipe, catalog }: Props) {
  const { t, i18n } = useTranslation(['admin', 'recipes', 'errors']);
  const save = useSetGuidance(recipe.id);
  const [draft, setDraft] = useState<GuidanceDraft>(() =>
    toGuidanceDraft(recipe),
  );
  const [done, setDone] = useState(false);
  const problems = guidanceProblems(draft);

  const change = (patch: Partial<GuidanceDraft>) => {
    setDone(false);
    setDraft((d) => ({ ...d, ...patch }));
  };
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

  const submit = async () => {
    try {
      const result = await save.mutateAsync(toGuidanceInput(draft));
      setDraft(toGuidanceDraft(result as AdminRecipe));
      setDone(true);
    } catch {
      // The error is shown below.
    }
  };

  const count = noteLength(draft.nutritionNote);
  const pairingsFull = draft.pairings.length >= MAX_PAIRINGS;
  const momentsFull = draft.eatingMoments.length >= MAX_EATING_MOMENTS;
  const usedMoments = new Set(draft.eatingMoments.map((m) => m.eatingMomentId));
  const pickable = catalog.eatingMoments.filter(
    (m) => !m.archived && !usedMoments.has(m.id),
  );

  return (
    <Stack
      spacing={2}
      component="section"
      aria-label={t('admin:recipe.guidance.title')}
    >
      <Typography variant="sectionLabel" color="text.secondary">
        {t('admin:recipe.guidance.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('admin:recipe.guidance.hint')}
      </Typography>
      {save.error ? <Alert>{translateApiError(t, save.error)}</Alert> : null}

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
            recipeId={recipe.id}
            catalog={catalog}
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
          const moment = catalog.eatingMoments.find(
            (m) => m.id === use.eatingMomentId,
          );
          const name = moment ? localName(moment, i18n.language) : '';
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
        ) : (
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
                {localName(m, i18n.language)}
              </option>
            ))}
          </TextField>
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button
          disabled={
            save.isPending ||
            problems.pairing ||
            problems.note ||
            problems.linkPosition !== null
          }
          onClick={() => void submit()}
        >
          {save.isPending
            ? t('admin:recipe.guidance.saving')
            : t('admin:recipe.guidance.save')}
        </Button>
        <Typography role="status" variant="body2">
          {done ? t('admin:recipe.guidance.saved') : null}
        </Typography>
      </Stack>
    </Stack>
  );
}

type RowProps = {
  pairing: PairingDraft;
  position: number;
  first: boolean;
  last: boolean;
  recipeId: string;
  catalog: AdminCatalog;
  onChange: (patch: Partial<PairingDraft>) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
};

function PairingRow({
  pairing,
  position,
  first,
  last,
  recipeId,
  catalog,
  onChange,
  onMove,
  onRemove,
}: RowProps) {
  const { t, i18n } = useTranslation(['admin', 'recipes']);
  const recipes = useAdminRecipes();
  const p = { position };
  // The picker hides archived Recipes and this Recipe, except a link already saved.
  const recipeOptions = (recipes.data ?? [])
    .filter(
      (r) => r.id !== recipeId && (!r.archived || r.id === pairing.linkTarget),
    )
    .sort((a, b) => a.title.localeCompare(b.title, i18n.language));
  const linkedIngredient =
    pairing.linkType === 'ingredient'
      ? catalog.ingredients.find((item) => item.id === pairing.linkTarget)
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
          {linkedIngredient ? (
            <Typography variant="body2">
              {t('admin:recipe.guidance.pairings.linkedIngredient', {
                name: localName(linkedIngredient, i18n.language),
              })}
            </Typography>
          ) : null}
          <CatalogSearch
            onSelect={(ingredient) => onChange({ linkTarget: ingredient.id })}
          />
        </Stack>
      ) : null}
      {pairing.linkType === 'recipe' ? (
        <TextField
          select
          label={t('admin:recipe.guidance.pairings.linkRecipeTarget', p)}
          value={pairing.linkTarget}
          onChange={(event) => onChange({ linkTarget: event.target.value })}
          slotProps={{ select: { native: true } }}
        >
          <option value="">{t('admin:recipe.guidance.pairings.choose')}</option>
          {recipeOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.archived
                ? `${r.title} (${t('admin:recipe.archivedBadge')})`
                : r.title}
            </option>
          ))}
        </TextField>
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
