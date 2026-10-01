import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  parseQuantity,
  useUpdateBatch,
  type Batch,
  type Unit,
} from '../../../lib/pantry';

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
    update.mutate(
      {
        id: batch.id,
        edit: {
          quantity: parsed.value,
          unit: parsed.value === null ? null : unit,
          location,
          expiryDate: expiryDate === '' ? null : expiryDate,
          productDescription: description.trim() || null,
        },
      },
      { onSuccess: onSaved },
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
