import {
  Alert,
  Box,
  Button,
  CloseIcon,
  IconButton,
  Link,
  ListRow,
  ListRowItem,
  Spinner,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { CatalogSearch } from '../../components/CatalogSearch';
import { translateApiError } from '../../i18n/translateApiError';
import { UNITS, type Unit } from '../../lib/catalog';
import { parseQuantity } from '../../lib/pantry';
import { useStapleMutations, useStaples, type Staple } from '../../lib/staples';

/** The Family's Staples: add by Catalog search, set a preferred quantity and unit, or remove. */
export function StaplesPage() {
  const { t, i18n } = useTranslation(['staples', 'common']);
  const staples = useStaples(i18n.language);
  const { add, update, remove } = useStapleMutations(i18n.language);
  const [formKey, setFormKey] = useState(0);

  const error = staples.error ?? add.error ?? update.error ?? remove.error;

  return (
    <>
      <AppScreenHeader
        title={t('staples:title')}
        trailing={<Link href="/shopping">{t('staples:back')}</Link>}
      />
      <Stack spacing={2}>
        <Typography color="text.secondary">{t('staples:hint')}</Typography>
        {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
        <CatalogSearch
          key={formKey}
          onSelect={(ingredient) =>
            add.mutate(
              { ingredientId: ingredient.id },
              { onSettled: () => setFormKey((key) => key + 1) },
            )
          }
        />
        {staples.isPending ? <Spinner label={t('common:loading')} /> : null}
        {staples.data?.length === 0 ? (
          <Typography color="text.secondary">{t('staples:empty')}</Typography>
        ) : null}
        {staples.data && staples.data.length > 0 ? (
          <Box
            component="ul"
            aria-label={t('staples:listLabel')}
            sx={{
              listStyle: 'none',
              m: 0,
              px: 1.5,
              py: 0,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: '20px',
            }}
          >
            {staples.data.map((staple) => (
              <StapleRow
                key={`${staple.id}-${staple.quantity}-${staple.unit}`}
                staple={staple}
                saving={update.isPending}
                onSave={(quantity, unit) =>
                  update.mutate({ id: staple.id, quantity, unit })
                }
                onRemove={() => remove.mutate(staple.id)}
              />
            ))}
          </Box>
        ) : null}
      </Stack>
    </>
  );
}

function StapleRow({
  staple,
  saving,
  onSave,
  onRemove,
}: {
  staple: Staple;
  saving: boolean;
  onSave: (quantity: number | null, unit: Unit | null) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation('staples');
  const [quantity, setQuantity] = useState(
    staple.quantity === null ? '' : String(staple.quantity),
  );
  const [unit, setUnit] = useState<Unit | ''>(staple.unit ?? '');
  const amount = parseQuantity(quantity);
  const needsUnit = amount.valid && amount.value !== null && unit === '';
  const dirty =
    (amount.valid ? amount.value : undefined) !== staple.quantity ||
    (unit || null) !== staple.unit;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!amount.valid || needsUnit) return;
    onSave(amount.value, unit || null);
  };

  return (
    <ListRowItem>
      <ListRow
        title={staple.name}
        trailing={
          <IconButton
            label={t('remove', { name: staple.name })}
            tone="plain"
            size={40}
            onClick={onRemove}
          >
            <CloseIcon size={18} />
          </IconButton>
        }
        below={
          <Box
            component="form"
            onSubmit={submit}
            noValidate
            sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}
          >
            <TextField
              label={t('quantityOf', { name: staple.name })}
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              error={!amount.valid}
              slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            />
            <TextField
              select
              label={t('unitOf', { name: staple.name })}
              value={unit}
              error={needsUnit}
              helperText={needsUnit ? t('unitRequired') : undefined}
              onChange={(event) => setUnit(event.target.value as Unit | '')}
              slotProps={{
                select: { native: true },
                inputLabel: { shrink: true },
              }}
            >
              <option value="">{t('noUnit')}</option>
              {UNITS.map((value) => (
                <option key={value} value={value}>
                  {t(`common:units.${value}`)}
                </option>
              ))}
            </TextField>
            <Button
              type="submit"
              disabled={!dirty || !amount.valid || needsUnit || saving}
              aria-label={t('save', { name: staple.name })}
            >
              {t('saveShort')}
            </Button>
          </Box>
        }
      />
    </ListRowItem>
  );
}
