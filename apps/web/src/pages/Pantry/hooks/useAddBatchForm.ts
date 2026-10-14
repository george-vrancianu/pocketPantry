import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import type {
  CatalogSearchResult,
  StorageLocation,
  Unit,
} from '../../../lib/catalog';
import {
  defaultExpiryDate,
  parseAmountText,
  useAddBatch,
  type IsoDate,
} from '../../../lib/pantry';

const FALLBACK_LOCATION: StorageLocation = 'cupboard';

/** Add-Batch form state: Catalog defaults pre-fill Location and expiry, and the Member can override them. */
export function useAddBatchForm({ onSaved }: { onSaved: () => void }) {
  const { t, i18n } = useTranslation();
  const addBatch = useAddBatch(i18n.language);

  const [ingredient, setIngredient] = useState<CatalogSearchResult | null>(
    null,
  );
  const [unmatchedName, setUnmatchedName] = useState<string | null>(null);
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
    unmatchedName,
    quantity,
    unit,
    location,
    expiryDate,
    /** The Default Expiry in days for the "Usual" quick pick: only for a chosen Ingredient that has one. */
    usualDays: ingredient?.defaults.expiryDays ?? null,
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
