import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import type { Unit } from '../../../lib/catalog';
import {
  parseQuantity,
  useUpdateBatch,
  type Batch,
  type BatchEdit,
} from '../../../lib/pantry';

/** Only the fields that differ from the Batch: a stale form must not overwrite another Member's edit. */
function changesFrom(batch: Batch, next: Required<BatchEdit>): BatchEdit {
  const edit: BatchEdit = {};
  if (next.quantity !== batch.quantity) edit.quantity = next.quantity;
  // The unit only matters alongside a quantity; the server clears it with the quantity.
  if (next.quantity !== null && next.unit !== batch.unit) edit.unit = next.unit;
  if (next.location !== batch.location) edit.location = next.location;
  if (next.expiryDate !== batch.expiryDate) edit.expiryDate = next.expiryDate;
  if (next.productDescription !== batch.productDescription)
    edit.productDescription = next.productDescription;
  return edit;
}

/** Edit-Batch form state, starting from the Batch as it is now. */
export function useEditBatchForm(
  batch: Batch,
  { onSaved }: { onSaved: () => void },
) {
  const { t, i18n } = useTranslation();
  const update = useUpdateBatch(i18n.language);

  const [quantity, setQuantity] = useState(
    batch.quantity === null ? '' : String(batch.quantity),
  );
  const [unit, setUnit] = useState<Unit>(batch.unit ?? 'g');
  const [location, setLocation] = useState(batch.location);
  const [expiryDate, setExpiryDate] = useState(batch.expiryDate ?? '');
  const [description, setDescription] = useState(
    batch.productDescription ?? '',
  );

  const parsed = parseQuantity(quantity);
  const canSave = parsed.valid && !update.isPending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    const edit = changesFrom(batch, {
      quantity: parsed.value,
      unit,
      location,
      expiryDate: expiryDate === '' ? null : expiryDate,
      productDescription: description.trim() || null,
    });
    if (Object.keys(edit).length === 0) {
      onSaved();
      return;
    }
    update.mutate({ id: batch.id, edit }, { onSuccess: onSaved });
  };

  return {
    quantity,
    unit,
    location,
    expiryDate,
    description,
    quantityValid: parsed.valid,
    canSave,
    saving: update.isPending,
    error: update.error ? translateApiError(t, update.error) : null,
    setQuantity,
    setUnit,
    setLocation,
    setExpiryDate,
    setDescription,
    submit,
  };
}
