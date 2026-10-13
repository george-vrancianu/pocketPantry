import {
  Alert,
  Box,
  Button,
  Sheet,
  Stack,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../i18n/translateApiError';
import type { Unit } from '../lib/catalog';
import { parseQuantity } from '../lib/pantry';
import { AmountField } from './AmountField';

/** The amount a row holds: both fields can be empty ("some"). */
export type Amount = { quantity: number | null; unit: Unit | null };

export type AmountSheetProps = {
  open: boolean;
  /** The sheet's title, and the name in the field's accessible label. */
  name: string;
  /** The line under the title, e.g. "from your list". */
  context: string;
  /** The amount shown when the sheet opens; the fields restart from it each time it opens. */
  amount: Amount;
  /**
   * Save the amount. Resolve when it is saved (the caller closes the sheet and shows "Updated {name}");
   * reject, ideally with an `ApiError`, to keep the sheet open with the reason shown.
   */
  onSave: (amount: Amount) => Promise<unknown>;
  /** Cancel, Escape and the scrim. */
  onClose: () => void;
  /** Text of the red link under the buttons, e.g. `t('common:edit.removeFromList')`. */
  removeLabel: string;
  /**
   * The link was pressed. The caller closes the sheet and, once it has closed, calls
   * `SwipeRowHandle.askToRemove()` (see the effect in ChecklistRow).
   */
  onRemove: () => void;
};

/**
 * The sheet that changes an item's amount: its name, a context line, the amount field with a unit chip,
 * Cancel and Save, and a "Remove from ..." link. It knows nothing about what the item is, so Shopping
 * Items, Template Lines and Staples share it.
 */
export function AmountSheet({
  open,
  name,
  context,
  amount,
  onSave,
  onClose,
  removeLabel,
  onRemove,
}: AmountSheetProps) {
  const { t } = useTranslation('common');
  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={t('edit.title', { name })}
      header={
        <Box sx={{ px: 3, pt: 2, pb: 1 }}>
          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, overflowWrap: 'anywhere' }}
          >
            {name}
          </Typography>
          <Typography variant="meta" color="text.secondary">
            {context}
          </Typography>
        </Box>
      }
    >
      <AmountForm
        name={name}
        amount={amount}
        onSave={onSave}
        onCancel={onClose}
        removeLabel={removeLabel}
        onRemove={onRemove}
      />
    </Sheet>
  );
}

/** Mounted with the open sheet, so its fields start from the item's amount every time. */
function AmountForm({
  name,
  amount,
  onSave,
  onCancel,
  removeLabel,
  onRemove,
}: Pick<AmountSheetProps, 'name' | 'amount' | 'onSave' | 'removeLabel'> & {
  onCancel: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation('common');
  const [quantity, setQuantity] = useState(
    amount.quantity === null ? '' : String(amount.quantity),
  );
  const [unit, setUnit] = useState<Unit | ''>(amount.unit ?? '');
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const sending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('input')?.focus();
  }, []);

  const parsed = parseQuantity(quantity.replace(',', '.'));

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    // Enter and the button can both fire; one save at a time.
    if (sending.current) return;
    setAttempted(true);
    if (!parsed.valid) return;
    sending.current = true;
    setSaving(true);
    setFailure(null);
    onSave({ quantity: parsed.value, unit: unit || null }).then(
      () => {
        // The caller closes the sheet, which unmounts this form.
      },
      (error: unknown) => {
        sending.current = false;
        setSaving(false);
        setFailure(translateApiError(t, error));
      },
    );
  };

  return (
    <Stack
      component="form"
      ref={formRef}
      spacing={2}
      onSubmit={submit}
      aria-label={t('edit.title', { name })}
      sx={{ px: 3, pt: 1, pb: 3 }}
    >
      <AmountField
        name={name}
        quantity={quantity}
        unit={unit}
        onQuantityChange={(next, typedUnit) => {
          setQuantity(next);
          if (typedUnit !== undefined) setUnit(typedUnit);
        }}
        onUnitChange={setUnit}
        error={attempted && !parsed.valid ? t('amount.invalid') : null}
        onSubmit={submit}
      />
      {failure ? <Alert>{failure}</Alert> : null}
      <Stack direction="row" spacing={1}>
        <Button type="submit" disabled={saving}>
          {saving ? t('edit.saving') : t('edit.save')}
        </Button>
        <Button type="button" variant="text" onClick={onCancel}>
          {t('cancel')}
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
        {removeLabel}
      </Box>
    </Stack>
  );
}
