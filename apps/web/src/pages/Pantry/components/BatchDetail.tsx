import { Alert, Box, Button, Typography, tokens } from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { expiryChipFor, useDeleteBatch, type Batch } from '../../../lib/pantry';
import { formatAmount } from './amount';
import { EditBatchForm } from './EditBatchForm';
import { ExpiryChip } from './ExpiryChip';

type Props = {
  batch: Batch;
  today: Date;
  /** Called once the Batch is deleted or moved to another Location, so the parent can place focus (this row unmounts). */
  onLeft: () => void;
};

/** One Batch inside an expanded roll-up row: its own amount, expiry and Product Description, with Edit and Delete. */
export function BatchDetail({ batch, today, onLeft }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const [mode, setMode] = useState<'view' | 'edit' | 'confirmDelete'>('view');
  const remove = useDeleteBatch();
  const chip = expiryChipFor(batch.expiryDate, today, batch.expiringSoon);

  // Focus follows the mode: into the form or confirmation, back to the opening button on leaving it.
  const editButton = useRef<HTMLButtonElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const previous = useRef(mode);
  const moved = useRef(false);
  useEffect(() => {
    const from = previous.current;
    previous.current = mode;
    if (mode === 'confirmDelete') confirmButton.current?.focus();
    else if (mode === 'view' && from === 'edit' && !moved.current)
      editButton.current?.focus();
    else if (mode === 'view' && from === 'confirmDelete')
      deleteButton.current?.focus();
  }, [mode]);

  const confirmDelete = () =>
    remove.mutateAsync(batch.id).then(onLeft, () => undefined);

  if (mode === 'edit') {
    return (
      <Box component="li" sx={{ listStyle: 'none' }}>
        <EditBatchForm
          batch={batch}
          onSaved={(edit) => {
            setMode('view');
            // A `location` in the edit means the Batch moved out of this row.
            if (edit.location) {
              moved.current = true;
              onLeft();
            }
          }}
          onCancel={() => setMode('view')}
        />
      </Box>
    );
  }

  const amount =
    batch.quantity === null || batch.unit === null
      ? null
      : formatAmount(batch.quantity, batch.unit, i18n.language, t);
  const detail = [amount, batch.productDescription].filter(Boolean).join(' · ');

  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        py: '10px',
        borderTop: `1px dashed ${tokens.color.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Typography
          component="p"
          sx={{ flexGrow: 1, minWidth: 0, fontSize: 13, m: 0 }}
        >
          {detail || t('noDetails')}
        </Typography>
        {chip ? <ExpiryChip chip={chip} /> : null}
      </Box>
      {mode === 'confirmDelete' ? (
        <Box sx={{ mt: 1 }} role="group" aria-label={t('delete.confirm')}>
          <Typography component="p" sx={{ fontSize: 13, m: 0, mb: 1 }}>
            {t('delete.confirm')}
          </Typography>
          {remove.error ? (
            <Alert>{translateApiError(t, remove.error)}</Alert>
          ) : null}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              ref={confirmButton}
              disabled={remove.isPending}
              onClick={confirmDelete}
            >
              {t('delete.yes')}
            </Button>
            <Button variant="text" onClick={() => setMode('view')}>
              {t('form.cancel')}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button
            ref={editButton}
            variant="text"
            aria-label={t('edit.action', { name: batch.name })}
            onClick={() => setMode('edit')}
          >
            {t('edit.label')}
          </Button>
          <Button
            ref={deleteButton}
            variant="text"
            aria-label={t('delete.action', { name: batch.name })}
            onClick={() => setMode('confirmDelete')}
          >
            {t('delete.label')}
          </Button>
        </Box>
      )}
    </Box>
  );
}
