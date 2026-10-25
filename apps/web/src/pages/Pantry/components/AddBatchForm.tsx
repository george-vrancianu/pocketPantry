import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/catalogSearch/CatalogSearch';
import { BrowseByAisle } from '../../../components/catalogSearch/emptyState/BrowseByAisle';
import { RecentlyStockedOrPopular } from '../../../components/catalogSearch/emptyState/RecentlyStockedOrPopular';
import {
  ListedAllergensNote,
  OpenFoodFactsCredit,
} from '../../../components/BarcodeLookupNotes';
import { ExpiryField, expiryContext } from '../../../components/ExpiryPicker';
import { LocationToggle } from '../../../components/LocationToggle';
import { StatusIcon } from '../../../components/StatusIcon';
import type { Batch } from '../../../lib/pantry';
import type { CameraMode } from '../../../lib/cameraMode';
import { CameraOverlay } from '../../Scan/CameraOverlay';
import {
  useAddBatchForm,
  type AddBatchStart,
  type PrefillField,
} from '../hooks/useAddBatchForm';
import { BatchAmountField } from './BatchAmountField';
import { QuickRow } from './QuickRow';

type Props = {
  /** Called with the Batch the save created. */
  onSaved: (batch: Batch) => void;
  onCancel: () => void;
  /** Start with an Ingredient picked, or an Unmatched name typed in; empty without. */
  start?: AddBatchStart;
  /** Told when the camera overlay opens or closes, so a host can leave Escape to the overlay. */
  onCameraOpenChange?: (open: boolean) => void;
  /** The Say it tile; leave out where the Dock has no mic. */
  onSayIt?: () => void;
  /** Scan several, from the camera: the host closes the sheet and opens the Scan page in this mode. */
  onScanSeveral: (mode: CameraMode) => void;
};

/** The camera the form opens: a Product photo or a barcode, never the Scan page's other modes. */
const FORM_CAMERA_MODES = ['product', 'barcode'] as const;

export function AddBatchForm({
  onSaved,
  onCancel,
  start,
  onCameraOpenChange,
  onSayIt,
  onScanSeveral,
}: Props) {
  const { t, i18n } = useTranslation('pantry');
  const form = useAddBatchForm({ onSaved, start });
  const id = useId();
  const { t: tReview } = useTranslation('review');
  const { t: tCatalog } = useTranslation('catalog');
  const opener = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const picked = form.ingredient?.name ?? form.unmatchedName;
  const { camera } = form;
  const searchInput = useRef<HTMLInputElement>(null);
  // After the overlay closes, focus goes back to the button that opened it.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !camera.open)
      (camera.typeRequested ? searchInput : opener).current?.focus();
    wasOpen.current = camera.open;
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- only when the camera opens or closes
  }, [camera.open]);
  useEffect(() => {
    onCameraOpenChange?.(camera.open);
    return () => onCameraOpenChange?.(false);
  }, [camera.open, onCameraOpenChange]);
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
      <QuickRow
        openerRef={opener}
        onOpen={(mode) => camera.openCamera(mode)}
        onSayIt={onSayIt}
      />
      {camera.open ? (
        <CameraOverlay
          modes={FORM_CAMERA_MODES}
          defaultMode={camera.openMode}
          onResult={camera.onResult}
          onScanSeveral={onScanSeveral}
          onCancel={camera.cancel}
        />
      ) : null}

      {camera.fromOpenFoodFacts ? <OpenFoodFactsCredit /> : null}

      <CatalogSearch
        autoFocus
        inputRef={searchInput}
        placeholder={tCatalog('search.placeholderAdd')}
        defaultQuery={form.initialQuery}
        selected={form.selected}
        onSelect={form.selectIngredient}
        onQueryChange={form.changeQuery}
        onUseTyped={form.chooseTypedName}
        newIngredientAllergenIds={camera.listedAllergenIds}
        emptyState={
          <>
            <RecentlyStockedOrPopular />
            <BrowseByAisle />
          </>
        }
      />

      {camera.source ? (
        <Typography
          variant="caption"
          color="text.secondary"
          data-testid="camera-source-tag"
        >
          {t(`form.tag.${camera.source}`)}
        </Typography>
      ) : null}
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
          <BatchAmountField
            name={picked}
            amountScale={form.ingredient?.amountScale}
            quantity={form.quantity}
            unit={form.unit}
            quantityValid={form.quantityValid}
            onQuantityChange={form.setQuantity}
            onUnitChange={form.setUnit}
            onSubmit={() => formRef.current?.requestSubmit()}
          />

          {mark('amount')}
          <LocationToggle
            label={t('form.location')}
            value={form.location}
            onChange={form.setLocation}
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
