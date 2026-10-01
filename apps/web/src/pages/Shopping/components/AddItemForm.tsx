import {
  Box,
  Button,
  PlusIcon,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import type { CatalogSearchResult } from '../../../lib/catalog';
import {
  SHOPPING_UNITS,
  type NewShoppingItem,
  type ShoppingUnit,
} from '../../../lib/shopping';

export type AddItemFormProps = {
  adding: boolean;
  onAdd: (item: NewShoppingItem) => Promise<boolean>;
};

/**
 * Type a name and pick the Catalog Match, with an optional quantity and unit.
 * A name left without a pick is added as an Unmatched Shopping Item.
 */
export function AddItemForm({ adding, onAdd }: AddItemFormProps) {
  const { t } = useTranslation('shopping');
  const [typed, setTyped] = useState('');
  const [match, setMatch] = useState<CatalogSearchResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<ShoppingUnit | ''>('');
  // Remounts the search box to clear it after an add.
  const [formKey, setFormKey] = useState(0);

  const name = typed.trim();
  const unmatched = name.length > 0 && match === null;

  const select = (ingredient: CatalogSearchResult) => {
    setMatch(ingredient);
    setTyped(ingredient.name);
    setUnit(ingredient.defaultUnit);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name) return;
    const amount = quantity === '' ? undefined : Number(quantity);
    const added = await onAdd({
      ...(match ? { ingredientId: match.id } : { name }),
      ...(amount !== undefined && amount > 0 ? { quantity: amount } : {}),
      ...(unit ? { unit } : {}),
    });
    if (!added) return;
    setTyped('');
    setMatch(null);
    setQuantity('');
    setUnit('');
    setFormKey((key) => key + 1);
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack spacing={1.5}>
        <CatalogSearch
          key={formKey}
          onSelect={select}
          onQueryChange={(query) => {
            setTyped(query);
            setMatch(null);
          }}
        />
        {unmatched ? (
          <Typography variant="meta" color="text.secondary">
            {t('add.unmatchedHint')}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1.5}>
          <TextField
            label={t('add.quantity')}
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          />
          <TextField
            select
            label={t('add.unit')}
            value={unit}
            onChange={(event) =>
              setUnit(event.target.value as ShoppingUnit | '')
            }
            slotProps={{
              select: { native: true },
              inputLabel: { shrink: true },
            }}
          >
            <option value="">{t('add.noUnit')}</option>
            {SHOPPING_UNITS.map((value) => (
              <option key={value} value={value}>
                {t(`units.${value}`)}
              </option>
            ))}
          </TextField>
        </Stack>
        <Button
          type="submit"
          disabled={!name || adding}
          startIcon={<PlusIcon />}
        >
          {t('add.submit')}
        </Button>
      </Stack>
    </Box>
  );
}
