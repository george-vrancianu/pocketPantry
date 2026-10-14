import { Alert, Button, Stack, TextField } from '@pocket-pantry/ui';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/catalogSearch/CatalogSearch';
import { BrowseByAisle } from '../../../components/catalogSearch/emptyState/BrowseByAisle';
import { RecentlyStocked } from '../../../components/catalogSearch/emptyState/RecentlyStocked';
import { ExpiryField, expiryContext } from '../../../components/ExpiryPicker';
import { useAddBatchForm, type AddBatchStart } from '../hooks/useAddBatchForm';
import { AmountLocationRow } from './AmountLocationRow';

type Props = {
  onSaved: () => void;
  onCancel: () => void;
  /** Start with an Ingredient picked, or an Unmatched name typed in; empty without. */
  start?: AddBatchStart;
};

export function AddBatchForm({ onSaved, onCancel, start }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const form = useAddBatchForm({ onSaved, start });
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const picked = form.ingredient?.name ?? form.unmatchedName;

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
        defaultQuery={form.initialQuery}
        selected={form.selected}
        onSelect={form.selectIngredient}
        onQueryChange={form.changeQuery}
        onUseTyped={form.chooseTypedName}
        emptyState={
          <>
            <RecentlyStocked />
            <BrowseByAisle />
          </>
        }
      />

      {form.unmatchedName ? (
        <Alert severity="info">
          {t('form.unmatchedNotice', { name: form.unmatchedName })}
        </Alert>
      ) : null}
      {picked ? (
        <>
          <AmountLocationRow
            name={picked}
            amountScale={form.ingredient?.amountScale}
            quantity={form.quantity}
            unit={form.unit}
            location={form.location}
            quantityValid={form.quantityValid}
            onQuantityChange={form.setQuantity}
            onUnitChange={form.setUnit}
            onLocationChange={form.setLocation}
            onSubmit={() => formRef.current?.requestSubmit()}
          />

          <ExpiryField
            id={`${id}-expiry`}
            label={t('picker.label')}
            value={form.expiryDate}
            onChange={form.setExpiryDate}
            usualDays={form.usualDays}
            context={expiryContext(
              {
                name: picked,
                quantity: form.quantity,
                unit: form.unit,
                location: form.location,
              },
              i18n.language,
              t,
            )}
          />

          <TextField
            id={`${id}-description`}
            label={t('form.description')}
            placeholder={t('form.descriptionPlaceholder')}
            value={form.description}
            onChange={(event) => form.setDescription(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
        </>
      ) : null}

      {form.error ? <Alert>{form.error}</Alert> : null}

      <Stack direction="row" spacing={1}>
        <Button type="submit" disabled={!form.canSave}>
          {form.saving ? t('form.saving') : t('form.save')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
