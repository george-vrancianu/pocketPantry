import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import type {
  CatalogSearchResult,
  StorageLocation,
} from '../../../lib/catalog';
import { defaultExpiryDate, useAddBatch, type Unit } from '../../../lib/pantry';

const FALLBACK_LOCATION: StorageLocation = 'cupboard';

/** Add-Batch form state: Catalog defaults pre-fill Location and expiry, and the Member can override them. */
export function useAddBatchForm({ onSaved }: { onSaved: () => void }) {
  const { t, i18n } = useTranslation();
  const addBatch = useAddBatch(i18n.language);

  const [ingredient, setIngredient] = useState<CatalogSearchResult | null>(
    null,
  );
  const [typed, setTyped] = useState('');
  const [unmatchedName, setUnmatchedName] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<Unit>('g');
  const [location, setLocation] = useState<StorageLocation>(FALLBACK_LOCATION);
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');

  const selectIngredient = (result: CatalogSearchResult) => {
    setIngredient(result);
    setUnmatchedName(null);
    setTyped(result.name);
    setUnit(result.defaultUnit);
    setLocation(result.defaults.location ?? FALLBACK_LOCATION);
    setExpiryDate(defaultExpiryDate(result.defaults.expiryDays, new Date()));
  };

  const changeQuery = (query: string) => {
    setTyped(query);
    setIngredient(null);
    setUnmatchedName(null);
  };

  const markTypedAsUnmatched = () => {
    setUnmatchedName(typed.trim());
    setIngredient(null);
    setExpiryDate('');
  };

  const quantityValue = quantity.trim() === '' ? null : Number(quantity);
  // numeric(10,3) on the server: at least 0.001, at most 3 decimals.
  const quantityValid =
    quantityValue === null ||
    (Number.isFinite(quantityValue) &&
      quantityValue >= 0.001 &&
      Math.abs(Math.round(quantityValue * 1000) - quantityValue * 1000) < 1e-6);
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
        expiryDate: expiryDate === '' ? null : expiryDate,
        productDescription: description.trim() || null,
      },
      { onSuccess: onSaved },
    );
  };

  return {
    ingredient,
    typed: typed.trim(),
    unmatchedName,
    quantity,
    unit,
    location,
    expiryDate,
    description,
    canSave,
    quantityValid,
    saving: addBatch.isPending,
    error: addBatch.error ? translateApiError(t, addBatch.error) : null,
    selectIngredient,
    changeQuery,
    markTypedAsUnmatched,
    setQuantity,
    setUnit,
    setLocation,
    setExpiryDate,
    setDescription,
    submit,
  };
}
