import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useCatalogSearch,
  type CatalogSearchResult,
  type StorageLocation,
  type Unit,
} from '../../../lib/catalog';
import {
  defaultExpiryDate,
  parseAmountText,
  useAddBatch,
  type IsoDate,
} from '../../../lib/pantry';

/**
 * What the form starts with, from an open Ingredient card: the Ingredient (its id and name; the
 * form looks up its Catalog defaults), or the typed name of an Unmatched one.
 */
export type AddBatchStart =
  | { ingredient: Pick<CatalogSearchResult, 'id' | 'name'> }
  | { unmatchedName: string };

const FALLBACK_LOCATION: StorageLocation = 'cupboard';

/** The picked Ingredient: a Catalog search result, or a starting one whose defaults are still loading. */
type PickedIngredient = Pick<CatalogSearchResult, 'id' | 'name'> &
  Partial<CatalogSearchResult>;

/** Add-Batch form state: Catalog defaults pre-fill Location and expiry, and the Member can override them. */
export function useAddBatchForm({
  onSaved,
  start,
}: {
  onSaved: () => void;
  start?: AddBatchStart;
}) {
  const { t, i18n } = useTranslation();
  const addBatch = useAddBatch(i18n.language);

  const [startingIngredient] = useState(() =>
    start && 'ingredient' in start ? start.ingredient : null,
  );
  const [ingredient, setIngredient] = useState<PickedIngredient | null>(
    startingIngredient,
  );
  // The text the search field starts with: the starting Ingredient's name, or the Unmatched name.
  const [initialQuery] = useState(() =>
    start === undefined
      ? ''
      : 'ingredient' in start
        ? start.ingredient.name
        : start.unmatchedName,
  );
  const [unmatchedName, setUnmatchedName] = useState<string | null>(() =>
    start && 'unmatchedName' in start ? start.unmatchedName : null,
  );
  const [quantity, setQuantity] = useState('');
  // The Member's own unit choice, or none: then the picked Ingredient's default unit applies.
  const [chosenUnit, setChosenUnit] = useState<Unit | null>(null);
  // The unit a dropped Ingredient had on screen: kept while its name is edited, never carried to the next pick.
  const [frozenUnit, setFrozenUnit] = useState<Unit | null>(null);
  const unit: Unit = chosenUnit ?? frozenUnit ?? ingredient?.defaultUnit ?? 'g';
  const [location, setLocation] = useState<StorageLocation>(FALLBACK_LOCATION);
  const [expiryDate, setExpiryDate] = useState<IsoDate | null>(null);
  const [description, setDescription] = useState('');

  const selectIngredient = (result: CatalogSearchResult) => {
    setIngredient(result);
    setUnmatchedName(null);
    // A frozen unit belonged to the dropped Ingredient: the new one's default applies.
    setFrozenUnit(null);
    // Keep a unit the Member chose with an amount before the pick ("2 kg", then Parmesan); with no amount, the new Ingredient's unit applies.
    if (quantity.trim() === '') setChosenUnit(null);
    setLocation(result.defaults.location ?? FALLBACK_LOCATION);
    const days = result.defaults.expiryDays;
    setExpiryDate(days === null ? null : defaultExpiryDate(days, new Date()));
  };

  // A starting Ingredient has only its id and name: its Catalog defaults come from searching its
  // name, which the search field has already asked for, and apply as if it had been picked there
  // (so it then shows as the picked token).
  const startingLookup = useCatalogSearch(
    startingIngredient?.name ?? '',
    i18n.language,
  );
  const startingDefaults = startingLookup.data?.find(
    (result) => result.id === startingIngredient?.id,
  );
  useEffect(() => {
    if (startingDefaults && ingredient === startingIngredient)
      selectIngredient(startingDefaults);
    // Once, when the lookup lands; not again after the Member has picked or typed something else.
  }, [startingDefaults]);

  /** Dropping the picked Ingredient must not change the unit on screen: freeze the Ingredient's unit first. */
  const clearIngredient = () => {
    if (ingredient && chosenUnit === null) setFrozenUnit(unit);
    setIngredient(null);
  };

  const changeQuery = () => {
    clearIngredient();
    setUnmatchedName(null);
  };

  const chooseTypedName = (name: string) => {
    setUnmatchedName(name);
    clearIngredient();
    setExpiryDate(null);
  };

  const { value: quantityValue, valid: quantityValid } =
    parseAmountText(quantity);
  const canSave =
    (ingredient !== null || Boolean(unmatchedName)) &&
    quantityValid &&
    !addBatch.isPending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    addBatch.mutate(
      {
        ...(ingredient
          ? { ingredientId: ingredient.id }
          : { rawName: unmatchedName as string }),
        quantity: quantityValue,
        unit: quantityValue === null ? null : unit,
        location,
        expiryDate,
        productDescription: description.trim() || null,
      },
      { onSuccess: onSaved },
    );
  };

  return {
    ingredient,
    /** The picked Ingredient as the search field's token: only once its Catalog result is on hand. */
    selected: ingredient?.parentCategory
      ? (ingredient as CatalogSearchResult)
      : null,
    initialQuery,
    unmatchedName,
    quantity,
    unit,
    location,
    expiryDate,
    /** The Default Expiry in days for the "Usual" quick pick: only for a chosen Ingredient that has one. */
    usualDays: ingredient?.defaults?.expiryDays ?? null,
    description,
    canSave,
    quantityValid,
    saving: addBatch.isPending,
    error: addBatch.error ? translateApiError(t, addBatch.error) : null,
    selectIngredient,
    changeQuery,
    chooseTypedName,
    setQuantity,
    setUnit: setChosenUnit,
    setLocation,
    setExpiryDate,
    setDescription,
    submit,
  };
}
