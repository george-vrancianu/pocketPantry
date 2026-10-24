import { Box, Stack, TextField } from '@pocket-pantry/ui';
import { useId, useState, type FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AmountField } from '../../../components/AmountField';
import {
  LOCATIONS,
  type StorageLocation,
  type Unit,
} from '../../../lib/catalog';
import type { AmountScale } from '../../../lib/usualAmounts';

type Props = {
  /** Name of the Ingredient, for the amount's accessible name. */
  name: string;
  /** The Ingredient's Amount Scale; null or left out for an Unmatched name (no chips). */
  amountScale?: AmountScale | null;
  quantity: string;
  unit: Unit;
  location: StorageLocation;
  quantityValid: boolean;
  onQuantityChange: (quantity: string) => void;
  onUnitChange: (unit: Unit) => void;
  onLocationChange: (location: StorageLocation) => void;
  /** Enter in the amount input. */
  onSubmit: () => void;
};

/** The Batch amount across the full width, with its Location on its own row below. A Batch amount always has a unit. */
export function AmountLocationRow({
  name,
  amountScale,
  quantity,
  unit,
  location,
  quantityValid,
  onQuantityChange,
  onUnitChange,
  onLocationChange,
  onSubmit,
}: Props) {
  const { t } = useTranslation('pantry');
  const id = useId();
  // Typing "500 kg" passes through invalid text ("500 "), so the error waits until the amount is left or submitted.
  const [touched, setTouched] = useState(false);

  return (
    <Stack spacing={2}>
      <Box
        onBlur={(event: FocusEvent<HTMLElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setTouched(true);
        }}
      >
        <AmountField
          name={name}
          quantity={quantity}
          unit={unit}
          onQuantityChange={(next, nextUnit) => {
            onQuantityChange(next);
            if (nextUnit) onUnitChange(nextUnit);
          }}
          onUnitChange={(next) => {
            if (next) onUnitChange(next);
          }}
          error={touched && !quantityValid ? t('common:amount.invalid') : null}
          onSubmit={() => {
            setTouched(true);
            onSubmit();
          }}
          allowNoUnit={false}
          amountScale={amountScale}
          label={t('common:amount.placeholder')}
          height={56}
          popoverAlign="start"
        />
      </Box>
      <TextField
        id={`${id}-location`}
        select
        label={t('form.location')}
        value={location}
        onChange={(event) =>
          onLocationChange(event.target.value as StorageLocation)
        }
        slotProps={{ select: { native: true } }}
        fullWidth
      >
        {LOCATIONS.map((value) => (
          <option key={value} value={value}>
            {t(`common:locations.${value}`)}
          </option>
        ))}
      </TextField>
    </Stack>
  );
}
