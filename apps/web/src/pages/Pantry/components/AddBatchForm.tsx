import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import { useAddBatchForm } from '../hooks/useAddBatchForm';
import { AmountLocationRow } from './AmountLocationRow';

type Props = { onSaved: () => void; onCancel: () => void };

export function AddBatchForm({ onSaved, onCancel }: Props) {
  const { t } = useTranslation('pantry');
  const form = useAddBatchForm({ onSaved });
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Stack
      component="form"
      ref={formRef}
      spacing={2}
      onSubmit={form.submit}
      aria-label={t('form.title')}
    >
      <CatalogSearch
        autoFocus
        onSelect={form.selectIngredient}
        onQueryChange={form.changeQuery}
      />

      {form.unmatchedName ? (
        <Alert severity="info">
          {t('form.unmatchedNotice', { name: form.unmatchedName })}
        </Alert>
      ) : null}
      {!form.ingredient && !form.unmatchedName && form.typed ? (
        <Button
          variant="text"
          type="button"
          onClick={form.markTypedAsUnmatched}
        >
          {t('form.useUnmatched', { name: form.typed })}
        </Button>
      ) : null}
      {!form.ingredient && !form.unmatchedName && !form.typed ? (
        <Typography variant="meta" color="text.secondary">
          {t('form.pickIngredient')}
        </Typography>
      ) : null}

      <AmountLocationRow
        name={form.ingredient?.name ?? form.unmatchedName ?? ''}
        quantity={form.quantity}
        unit={form.unit}
        location={form.location}
        quantityValid={form.quantityValid}
        onQuantityChange={form.setQuantity}
        onUnitChange={form.setUnit}
        onLocationChange={form.setLocation}
        onSubmit={() => formRef.current?.requestSubmit()}
      />

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
          {form.saving ? t('form.saving') : t('form.save')}
        </Button>
        <Button type="button" variant="text" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
