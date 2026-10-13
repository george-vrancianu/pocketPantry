import {
  ListRow,
  Sheet,
  SwipeRow,
  Typography,
  useToast,
  type SwipeRowHandle,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { expiryChipFor, type Batch } from '../../../lib/pantry';
import { formatAmount } from '../../../lib/amount';
import { useSwipeRowLabels } from '../../../lib/useSwipeRowLabels';
import { EditBatchForm } from './EditBatchForm';
import { ExpiryChip } from './ExpiryChip';

type Props = {
  batch: Batch;
  today: Date;
  /** Swiped or confirmed away: the page hides the Batch and deletes it when its Undo ends. */
  onRemove: (batch: Batch) => void;
  /** Called once the Batch moved to another Location, so the parent can place focus (this row unmounts). */
  onLeft: () => void;
};

/**
 * One Batch inside an expanded roll-up row: its own amount, expiry and Product Description. Swipe left
 * to remove it; hold (or press Enter) to edit it in a sheet, which also offers "Remove from Pantry".
 */
export function BatchDetail({ batch, today, onRemove, onLeft }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const toast = useToast();
  const labels = useSwipeRowLabels(batch.name, 'pantry', { hold: true });
  const chip = expiryChipFor(batch.expiryDate, today, batch.expiringSoon);
  const [editing, setEditing] = useState(false);
  const row = useRef<SwipeRowHandle>(null);

  // "Remove from Pantry" closes the sheet first and asks once it is gone: the sheet hands focus back to the
  // row as it closes, and the confirmation's Keep button must be focused after that, not before.
  const [askAfterClose, setAskAfterClose] = useState(false);
  useEffect(() => {
    if (!askAfterClose || editing) return;
    setAskAfterClose(false);
    row.current?.askToRemove();
  }, [askAfterClose, editing]);

  const amount =
    batch.quantity === null || batch.unit === null
      ? null
      : formatAmount(batch.quantity, batch.unit, i18n.language, t);
  const detail = [amount, batch.productDescription].filter(Boolean).join(' · ');

  return (
    <>
      <SwipeRow
        ref={row}
        name={batch.name}
        labels={labels}
        disabled={editing}
        onEdit={() => setEditing(true)}
        onRemove={() => onRemove(batch)}
      >
        <ListRow
          title={detail || t('noDetails')}
          tags={chip ? <ExpiryChip chip={chip} /> : null}
        />
      </SwipeRow>
      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        label={t('edit.title', { name: batch.name })}
        header={
          <Typography
            component="h2"
            sx={{ px: 3, pt: 2, pb: 1, fontSize: 20, fontWeight: 700 }}
          >
            {batch.name}
          </Typography>
        }
      >
        <EditBatchForm
          batch={batch}
          onSaved={(edit) => {
            setEditing(false);
            toast.show(t('edit.updated', { name: batch.name }));
            // A `location` in the edit means the Batch moved out of this row.
            if (edit.location) onLeft();
          }}
          onCancel={() => setEditing(false)}
          onRemove={() => {
            setEditing(false);
            setAskAfterClose(true);
          }}
        />
      </Sheet>
    </>
  );
}
