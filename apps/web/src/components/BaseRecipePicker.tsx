import { Box, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecipes, type CompactAllergyWarning } from '../lib/recipes';
import { AllergenIndicator } from './AllergenIndicator';
import { HiddenByAllergiesNote } from './HiddenByAllergiesNote';

const STANDALONE = 'standalone';

/** A Catalog Base Recipe offered as the base of a new Family Recipe. */
export type BaseRecipeOption = {
  id: string;
  title: string;
  allergyWarning?: CompactAllergyWarning | null;
};

/** What the Member has done in the picker; the caller holds it so it survives the picker unmounting. */
export type BasePick = {
  chosen: string | null;
  another: BaseRecipeOption | null;
  search: string;
};

export const noBasePick: BasePick = { chosen: null, another: null, search: '' };

type Props = {
  pick: BasePick;
  onPick: (pick: BasePick) => void;
  /** The closest Base Recipes, best first. */
  closest: BaseRecipeOption[];
  /** The closest are still being fetched. */
  loading?: boolean;
  /** How many closest matches "Hide Recipes with my Allergies" left out; with `onShowHidden`, shows the note. */
  hiddenByAllergiesCount?: number;
  onShowHidden?: () => void;
  /** The picked base's id, or null for standalone; called on mount and on every change. Must be stable (it is an effect dependency). */
  onChange: (parentId: string | null) => void;
};

function BaseOption({
  checked,
  label,
  name,
  onSelect,
  allergyWarning,
}: {
  checked: boolean;
  label: string;
  name: string;
  onSelect: () => void;
  allergyWarning?: CompactAllergyWarning | null;
}) {
  return (
    <Box
      component="label"
      sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 44 }}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        style={{ width: 20, height: 20 }}
      />
      {label}
      <AllergenIndicator warning={allergyWarning} />
    </Box>
  );
}

/**
 * "Base Recipe": the closest Catalog Base Recipes, a title search for another,
 * and "standalone". Until the Member chooses, the top match (if any) is picked.
 */
export function BaseRecipePicker({
  pick: state,
  onPick,
  closest,
  loading = false,
  hiddenByAllergiesCount = 0,
  onShowHidden,
  onChange,
}: Props) {
  const { t } = useTranslation('review');
  const groupName = useId();
  const { chosen, another, search } = state;
  const setChosen = (id: string) => onPick({ ...state, chosen: id });
  const setSearch = (text: string) => onPick({ ...state, search: text });
  const searching = search.trim() !== '';
  const found = useRecipes(
    { search: searching ? search : '', cuisineId: '', methodId: '' },
    // A title search is a deliberate look-up with no note to show, so it lists every Recipe
    // (each still carries its Allergy indicator); only the suggested matches hide (ADR 0014 records this exception).
    { searchOnly: true, showHidden: true },
  );

  const listed = new Set(closest.map((s) => s.id));
  const results = !searching
    ? []
    : (found.data?.recipes ?? []).filter(
        (recipe) =>
          recipe.owner === 'catalog' &&
          recipe.parentId === null &&
          !listed.has(recipe.id),
      );
  const extra =
    another &&
    !listed.has(another.id) &&
    !results.some((r) => r.id === another.id)
      ? another
      : null;
  const available = new Set([
    ...listed,
    ...results.map((r) => r.id),
    ...(extra ? [extra.id] : []),
    STANDALONE,
  ]);
  const selected =
    chosen !== null && available.has(chosen)
      ? chosen
      : (closest[0]?.id ?? STANDALONE);
  const parentId = selected === STANDALONE ? null : selected;
  useEffect(() => onChange(parentId), [parentId, onChange]);

  const pickAnother = (base: BaseRecipeOption) =>
    onPick({ ...state, another: base, chosen: base.id });

  return (
    <Stack spacing={1.5}>
      <Box component="fieldset" sx={{ border: 0, p: 0, m: 0 }}>
        <Box component="legend" sx={{ fontWeight: 600, p: 0 }}>
          {t('plateRecipe.base')}
        </Box>
        {loading ? (
          <Typography role="status" color="text.secondary">
            {t('plateRecipe.loading')}
          </Typography>
        ) : null}
        {onShowHidden ? (
          <HiddenByAllergiesNote
            count={hiddenByAllergiesCount}
            onShow={onShowHidden}
          />
        ) : null}
        {closest.map((match, index) => (
          <BaseOption
            key={match.id}
            name={groupName}
            checked={selected === match.id}
            label={
              index === 0
                ? t('plateRecipe.closest', { title: match.title })
                : match.title
            }
            onSelect={() => setChosen(match.id)}
            allergyWarning={match.allergyWarning}
          />
        ))}
        {extra ? (
          <BaseOption
            name={groupName}
            checked={selected === extra.id}
            label={extra.title}
            onSelect={() => setChosen(extra.id)}
            allergyWarning={extra.allergyWarning}
          />
        ) : null}
        {results.map((recipe) => (
          <BaseOption
            key={recipe.id}
            name={groupName}
            checked={selected === recipe.id}
            label={recipe.title}
            onSelect={() => pickAnother(recipe)}
            allergyWarning={recipe.allergyWarning}
          />
        ))}
        <BaseOption
          name={groupName}
          checked={selected === STANDALONE}
          label={t('plateRecipe.standalone')}
          onSelect={() => setChosen(STANDALONE)}
        />
      </Box>
      <TextField
        type="search"
        label={t('plateRecipe.search')}
        value={search}
        slotProps={{ htmlInput: { maxLength: 100 } }}
        onChange={(event) => setSearch(event.target.value)}
      />
    </Stack>
  );
}
