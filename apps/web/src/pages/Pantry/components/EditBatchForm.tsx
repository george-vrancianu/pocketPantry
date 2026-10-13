import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  tokens,
} from '@pocket-pantry/ui';
import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCATIONS, UNITS } from '../../../lib/catalog';
import type { Batch, BatchEdit } from '../../../lib/pantry';
import { useEditBatchForm } from '../hooks/useEditBatchForm';

type Props = {
  batch: Batch;
  onSaved: (edit: BatchEdit) => void;
  onCancel: () => void;
  /** The "Remove from Pantry" link under the buttons. */
  onRemove: () => void;
};

export function EditBatchForm({ batch, onSaved, onCancel, onRemove }: Props) {
  const { t } = useTranslation('pantry');
  const form = useEditBatchForm(batch, { onSaved });
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('input, select')?.focus();
  }, []);

  return (
    <Stack
      component="form"
      ref={formRef}
      spacing={2}
      onSubmit={form.submit}
      aria-label={t('edit.title', { name: batch.name })}
      sx={{ px: 3, pt: 1, pb: 3 }}
    >
      <Stack direction="row" spacing={1}>
        <TextField
          id={`${id}-quantity`}
          label={t('form.quantity')}
          type="number"
          value={form.quantity}
          error={!form.quantityValid}
          helperText={
            form.quantityValid ? undefined : t('form.quantityInvalid')
          }
          onChange={(event) => form.setQuantity(event.target.value)}
          slotProps={{
            htmlInput: { min: 0, step: 'any', inputMode: 'decimal' },
          }}
        />
        <TextField
          id={`${id}-unit`}
          select
          label={t('form.unit')}
          value={form.unit}
          onChange={(event) =>
            form.setUnit(event.target.value as typeof form.unit)
          }
          slotProps={{ select: { native: true } }}
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {t(`common:units.${unit}`)}
            </option>
          ))}
        </TextField>
      </Stack>
      <TextField
        id={`${id}-location`}
        select
        label={t('form.location')}
        value={form.location}
        onChange={(event) =>
          form.setLocation(event.target.value as typeof form.location)
        }
        slotProps={{ select: { native: true } }}
      >
        {LOCATIONS.map((location) => (
          <option key={location} value={location}>
            {t(`common:locations.${location}`)}
          </option>
        ))}
      </TextField>
      <TextField
        id={`${id}-expiry`}
        type="date"
        label={t('form.expiry')}
        value={form.expiryDate}
        onChange={(event) => form.setExpiryDate(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        id={`${id}-description`}
        label={t('form.description')}
        placeholder={t('form.descriptionPlaceholder')}
        value={form.description}
        onChange={(event) => form.setDescription(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 200 } }}
      />
      {form.error ? <Alert>{form.error}</Alert> : null}
      <Stack direction="row" spacing={1}>
        <Button type="submit" disabled={!form.canSave}>
          {form.saving ? t('form.saving') : t('edit.save')}
        </Button>
        <Button type="button" variant="text" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
      </Stack>
      <Box
        component="button"
        type="button"
        onClick={onRemove}
        sx={{
          alignSelf: 'flex-start',
          minHeight: 40,
          p: 0,
          border: 0,
          bgcolor: 'transparent',
          font: 'inherit',
          fontSize: 14,
          fontWeight: 700,
          color: tokens.color.urgentFg,
          cursor: 'pointer',
        }}
      >
        {t('edit.remove')}
      </Box>
    </Stack>
  );
}
