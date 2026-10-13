import {
  Box,
  ListRow,
  Sheet,
  SwipeRow,
  Typography,
  useToast,
  type SwipeRowHandle,
} from '@pocket-pantry/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpiryTag } from '../../../components/ExpiryTag';
import { expiryTagFor, type Batch } from '../../../lib/pantry';
import { useStaleThresholdDays } from '../../../lib/settings';
import { formatAmount } from '../../../lib/amount';
import { useSwipeRowLabels } from '../../../lib/useSwipeRowLabels';
import { EditBatchForm } from './EditBatchForm';

/** "Sat, Oct 11" in the UI locale, with the year only when it is not this year. */
function fullDate(expiryDate: string, today: Date, locale: string): string {
  const date = new Date(`${expiryDate}T00:00:00`);
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date);
}

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
 * One Batch inside an expanded roll-up row: its own amount, Product Description, full expiry date and tag. Swipe left
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
  const staleThresholdDays = useStaleThresholdDays(i18n.language);
  const tag = expiryTagFor(batch.expiryDate, today, staleThresholdDays);
  const [editing, setEditing] = useState(false);
  const row = useRef<SwipeRowHandle>(null);
  // "Remove from Pantry" closes the sheet and asks once it has finished closing (focus is back on the row).
  const removeRequested = useRef(false);

  const amount =
    batch.quantity === null || batch.unit === null
      ? null
      : formatAmount(batch.quantity, batch.unit, i18n.language, t);
  const detail = [amount, batch.productDescription].filter(Boolean).join(' · ');
  const expires =
    batch.expiryDate === null
      ? null
      : fullDate(batch.expiryDate, today, i18n.language);

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
          meta={expires}
          tags={<ExpiryTag tag={tag} />}
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
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            <Typography
              component="h2"
              sx={{ fontSize: 20, fontWeight: 700, overflowWrap: 'anywhere' }}
            >
              {batch.name}
            </Typography>
            <Typography variant="meta" color="text.secondary">
              {t('common:row.context.pantry')}
            </Typography>
          </Box>
        }
      >
        <EditBatchForm
          batch={batch}
          onSaved={(edit) => {
            setEditing(false);
            toast.show(t('common:row.updated', { name: batch.name }));
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
