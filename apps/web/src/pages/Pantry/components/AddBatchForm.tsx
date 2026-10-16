import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/catalogSearch/CatalogSearch';
import { BrowseByAisle } from '../../../components/catalogSearch/emptyState/BrowseByAisle';
import { RecentlyStocked } from '../../../components/catalogSearch/emptyState/RecentlyStocked';
import {
  ListedAllergensNote,
  OpenFoodFactsCredit,
} from '../../../components/BarcodeLookupNotes';
import { ExpiryField, expiryContext } from '../../../components/ExpiryPicker';
import { StatusIcon } from '../../../components/StatusIcon';
import { saveOverlayMode } from '../../../lib/cameraMode';
import { CameraOverlay } from '../../Scan/CameraOverlay';
import {
  useAddBatchForm,
  type AddBatchStart,
  type PrefillField,
} from '../hooks/useAddBatchForm';
import { AmountLocationRow } from './AmountLocationRow';

type Props = {
  onSaved: () => void;
  onCancel: () => void;
  /** Start with an Ingredient picked, or an Unmatched name typed in; empty without. */
  start?: AddBatchStart;
};

/** The camera the form opens: a Product photo or a barcode, never the Scan page's other modes. */
const FORM_CAMERA_MODES = ['product', 'barcode'] as const;

export function AddBatchForm({ onSaved, onCancel, start }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const form = useAddBatchForm({ onSaved, start });
  const id = useId();
  const { t: tReview } = useTranslation('review');
  const { t: tScan } = useTranslation('scan');
  const cameraButton = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const picked = form.ingredient?.name ?? form.unmatchedName;
  const { camera } = form;
  const busy = camera.reading || camera.lookingUp;
  // After the overlay closes, focus goes back to the button that opened it.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !camera.open) cameraButton.current?.focus();
    wasOpen.current = camera.open;
  }, [camera.open]);
  /** Marks a field Prefill filled and the Member has not edited since. */
  const mark = (field: PrefillField) =>
    camera.prefilled.has(field) ? (
      <Typography
        variant="caption"
        color="text.secondary"
        data-testid={`prefilled-${field}`}
      >
        {t('form.prefill.mark')}
      </Typography>
    ) : null;

  return (
    <Stack
      component="form"
      ref={formRef}
      spacing={2}
      onSubmit={form.submit}
      aria-label={t('form.title')}
    >
      <Button
        type="button"
        variant="ghost"
        ref={cameraButton}
        aria-disabled={busy || undefined}
        className={busy ? 'Mui-disabled' : undefined}
        onClick={() => {
          if (!busy) camera.openCamera();
        }}
      >
        {t('form.prefill.open')}
      </Button>
      {busy ? (
        <Typography role="status" color="text.secondary">
          {camera.lookingUp
            ? t('form.prefill.lookingUp')
            : t('form.prefill.reading')}
        </Typography>
      ) : null}
      <div aria-live="polite" data-testid="prefill-read-error">
        {camera.readError ? <Alert>{camera.readError}</Alert> : null}
      </div>
      {camera.open ? (
        <CameraOverlay
          modes={FORM_CAMERA_MODES}
          defaultMode={camera.openMode}
          onModeChange={saveOverlayMode}
          notice={
            camera.barcodeMissed ? tScan('overlay.barcodeNotFound') : undefined
          }
          onResult={camera.onResult}
          onCancel={camera.cancel}
        />
      ) : null}

      {camera.fromOpenFoodFacts ? <OpenFoodFactsCredit /> : null}

      <CatalogSearch
        autoFocus
        defaultQuery={form.initialQuery}
        selected={form.selected}
        onSelect={form.selectIngredient}
        onQueryChange={form.changeQuery}
        onUseTyped={form.chooseTypedName}
        newIngredientAllergenIds={camera.listedAllergenIds}
        emptyState={
          <>
            <RecentlyStocked />
            <BrowseByAisle />
          </>
        }
      />

      {mark('ingredient')}
      <ListedAllergensNote allergens={camera.missingAllergens} />
      {camera.checkIngredient ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <StatusIcon status="low" />
          <Typography variant="caption">{tReview('msg.low')}</Typography>
        </Stack>
      ) : null}
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

          {mark('amount')}
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

          {mark('expiry')}
          <TextField
            id={`${id}-description`}
            label={t('form.description')}
            placeholder={t('form.descriptionPlaceholder')}
            value={form.description}
            onChange={(event) => form.setDescription(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
          {mark('description')}
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
