import { Box, Stack, TextField } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { AmountField } from '../../../components/AmountField';
import {
  LOCATIONS,
  type StorageLocation,
  type Unit,
} from '../../../lib/catalog';

type Props = {
  /** Name of the Ingredient, for the amount's accessible name. */
  name: string;
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

/** The Batch amount and its Location on one line. A Batch amount always has a unit. */
export function AmountLocationRow({
  name,
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

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
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
          error={quantityValid ? null : t('form.quantityInvalid')}
          onSubmit={onSubmit}
          allowNoUnit={false}
        />
      </Box>
      <TextField
        id={`${id}-location`}
        select
        size="small"
        label={t('form.location')}
        value={location}
        onChange={(event) =>
          onLocationChange(event.target.value as StorageLocation)
        }
        slotProps={{ select: { native: true } }}
        sx={{
          flex: '0 0 40%',
          // Match the amount input's 44 px.
          '& .MuiInputBase-root': { minHeight: 44 },
        }}
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
