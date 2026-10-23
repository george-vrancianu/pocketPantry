import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AllergenIndicator } from '../../../components/AllergenIndicator';
import { HiddenByAllergiesNote } from '../../../components/HiddenByAllergiesNote';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  matchedIngredientIds,
  useSaveFromPlate,
  usePlateMatches,
} from '../../../lib/plateRecipe';
import { useRecipes, type CompactAllergyWarning } from '../../../lib/recipes';
import type { ReviewLine } from '../../../lib/review';

const STANDALONE = 'standalone';

type Base = {
  id: string;
  title: string;
  allergyWarning?: CompactAllergyWarning | null;
};

type Props = {
  dishTitle: string;
  /** The Review's current lines, for one serving. */
  lines: ReviewLine[];
  /** The Review's own line checks: opens and focuses the first invalid line, and says whether there was one. */
  hasInvalidLine: () => boolean;
  onSaved: (recipeId: string) => void;
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

/** Saves a Plate Scan's dish as a Family Recipe: a Variant of a Catalog Base Recipe, or standalone. */
export function PlateRecipeSave({
  dishTitle,
  lines,
  hasInvalidLine,
  onSaved,
}: Props) {
  const { t } = useTranslation('review');
  const groupName = useId();
  // The Ingredients are read when the panel opens, so editing lines does not reshuffle the matches.
  const [ingredientIds, setIngredientIds] = useState<string[] | null>(null);
  const open = ingredientIds !== null;
  const [title, setTitle] = useState(dishTitle);
  // Until the Member chooses, the top match (if any) is the base.
  const [chosen, setChosen] = useState<string | null>(null);
  const [another, setAnother] = useState<Base | null>(null);
  const [search, setSearch] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  // Focus follows the panel: its heading when it opens, the opener when it is cancelled.
  useEffect(() => {
    if (open) headingRef.current?.focus();
    else if (wasOpen.current) openerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);
  const save = useSaveFromPlate();
  // "Show" in the hidden-by-Allergies note asks for the closest matches again, hidden ones too.
  const [showHidden, setShowHidden] = useState(false);
  const matches = usePlateMatches(
    {
      dishTitle,
      ingredientIds: ingredientIds ?? [],
      ...(showHidden ? { showHidden: true as const } : {}),
    },
    open,
  );
  const searching = open && search.trim() !== '';
  const found = useRecipes(
    { search: searching ? search : '', cuisineId: '', methodId: '' },
    // A title search is a deliberate look-up with no note to show, so it lists every Recipe
    // (each still carries its Allergy indicator); only the suggested matches hide (ADR 0014 records this exception).
    { searchOnly: true, showHidden: true },
  );

  const closestBases = matches.data?.matches ?? [];
  const listed = new Set(closestBases.map((s) => s.id));
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
      : (closestBases[0]?.id ?? STANDALONE);

  if (!open)
    return (
      <Button
        ref={openerRef}
        variant="secondary"
        onClick={() => setIngredientIds(matchedIngredientIds(lines))}
      >
        {t('plateRecipe.open')}
      </Button>
    );

  const submit = () => {
    if (hasInvalidLine()) return;
    save.mutate(
      {
        title,
        parentId: selected === STANDALONE ? null : selected,
        lines,
      },
      { onSuccess: (recipe) => onSaved(recipe.id) },
    );
  };
  const pick = (base: Base) => {
    setAnother(base);
    setChosen(base.id);
  };

  return (
    <Stack
      component="section"
      aria-labelledby={`${groupName}-heading`}
      spacing={1.5}
    >
      <Typography
        id={`${groupName}-heading`}
        component="h2"
        ref={headingRef}
        tabIndex={-1}
        sx={{ fontWeight: 700, outline: 'none' }}
      >
        {t('plateRecipe.heading')}
      </Typography>
      <TextField
        label={t('plateRecipe.title')}
        value={title}
        slotProps={{ htmlInput: { maxLength: 200 } }}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Box component="fieldset" sx={{ border: 0, p: 0, m: 0 }}>
        <Box component="legend" sx={{ fontWeight: 600, p: 0 }}>
          {t('plateRecipe.base')}
        </Box>
        {matches.isPending ? (
          <Typography role="status" color="text.secondary">
            {t('plateRecipe.loading')}
          </Typography>
        ) : null}
        <HiddenByAllergiesNote
          count={matches.data?.hiddenByAllergiesCount ?? 0}
          onShow={() => setShowHidden(true)}
        />
        {closestBases.map((match, index) => (
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
            onSelect={() => pick(recipe)}
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
      {save.error ? <Alert>{translateApiError(t, save.error)}</Alert> : null}
      <Stack direction="row" spacing={1}>
        <Button
          variant="ghost"
          onClick={() => setIngredientIds(null)}
          disabled={save.isPending}
        >
          {t('plateRecipe.cancel')}
        </Button>
        <Button
          onClick={submit}
          disabled={
            save.isPending ||
            matches.isPending ||
            title.trim() === '' ||
            lines.length === 0
          }
        >
          {save.isPending ? t('plateRecipe.saving') : t('plateRecipe.save')}
        </Button>
      </Stack>
    </Stack>
  );
}
