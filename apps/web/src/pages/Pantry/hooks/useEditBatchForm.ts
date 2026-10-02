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

/** Only the fields that differ from the Batch the form opened with, so a field the Member left alone never overwrites another Member's edit made meanwhile. */
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
  { onSaved }: { onSaved: (edit: BatchEdit) => void },
) {
  const { t, i18n } = useTranslation();
  const [opened] = useState(batch);
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
    const edit = changesFrom(opened, {
      quantity: parsed.value,
      unit,
      location,
      expiryDate: expiryDate === '' ? null : expiryDate,
      productDescription: description.trim() || null,
    });
    if (Object.keys(edit).length === 0) {
      onSaved(edit);
      return;
    }
    // `mutateAsync`, not `mutate`'s callbacks: those are dropped once the form unmounts, which a move out of the section does.
    update.mutateAsync({ id: opened.id, edit }).then(
      () => onSaved(edit),
      () => undefined,
    );
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
