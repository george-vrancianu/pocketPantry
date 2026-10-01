import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import { LOCATIONS, UNITS } from '../../../lib/pantry';
import { useAddBatchForm } from '../hooks/useAddBatchForm';

type Props = { onSaved: () => void; onCancel: () => void };

export function AddBatchForm({ onSaved, onCancel }: Props) {
  const { t } = useTranslation('pantry');
  const form = useAddBatchForm({ onSaved });
  const id = useId();

  return (
    <Stack
      component="form"
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
              {t(`units.${unit}`)}
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
            {t(`locations.${location}`)}
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
          {form.saving ? t('form.saving') : t('form.save')}
        </Button>
        <Button type="button" variant="text" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
