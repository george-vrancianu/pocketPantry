import {
  ListRow,
  Sheet,
  SwipeRow,
  Typography,
  useToast,
  type SwipeRowHandle,
} from '@pocket-pantry/ui';
import { useRef, useState } from 'react';
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
  /** The first-use peek, for the first Batch of the first expanded roll-up. */
  peek: boolean;
  onLearned: () => void;
};

/**
 * One Batch inside an expanded roll-up row: its own amount, expiry and Product Description. Swipe left
 * to remove it; hold (or press Enter) to edit it in a sheet, which also offers "Remove from Pantry".
 */
export function BatchDetail({
  batch,
  today,
  onRemove,
  onLeft,
  peek,
  onLearned,
}: Props) {
  const { t, i18n } = useTranslation('pantry');
  const toast = useToast();
  const labels = useSwipeRowLabels(batch.name, 'pantry', { hold: true });
  const chip = expiryChipFor(batch.expiryDate, today, batch.expiringSoon);
  const [editing, setEditing] = useState(false);
  const row = useRef<SwipeRowHandle>(null);
  // "Remove from Pantry" closes the sheet and asks once it has finished closing (focus is back on the row).
  const removeRequested = useRef(false);

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
        peek={peek}
        onLearned={onLearned}
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
        onExited={() => {
          if (!removeRequested.current) return;
          removeRequested.current = false;
          row.current?.askToRemove();
        }}
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
            removeRequested.current = true;
            setEditing(false);
          }}
        />
      </Sheet>
    </>
  );
}
