import {
  Alert,
  Button,
  Spinner,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { LOCATIONS, UNITS } from '../../../lib/pantry';
import { useFinishReview } from '../hooks/useFinishReview';

type Props = { onDone: () => void; onCancel: () => void };

/** Review screen: the proposed Batches for every checked item, editable, before anything is saved. */
export function FinishShoppingReview({ onDone, onCancel }: Props) {
  const { t } = useTranslation(['shopping', 'pantry', 'common']);
  const review = useFinishReview({ onDone });

  return (
    <Stack
      spacing={2}
      aria-label={t('shopping:finish.reviewTitle')}
      role="region"
    >
      <Typography variant="h2">{t('shopping:finish.reviewTitle')}</Typography>
      <Typography color="text.secondary">
        {t('shopping:finish.reviewHint')}
      </Typography>
      {review.error ? <Alert>{review.error}</Alert> : null}
      {review.isLoading ? <Spinner label={t('common:loading')} /> : null}

      {review.lines.map(({ line, edit, dropped, quantityValid }) => (
        <Stack
          key={line.itemId}
          component="section"
          aria-label={line.name}
          spacing={1.5}
          sx={{
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: '20px',
            opacity: dropped ? 0.5 : 1,
          }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              {line.name}
              {line.unmatched ? ` (${t('shopping:item.unmatched')})` : ''}
            </Typography>
            <Button
              variant="text"
              type="button"
              onClick={() => review.toggleDrop(line.itemId)}
            >
              {dropped
                ? t('shopping:finish.restore', { name: line.name })
                : t('shopping:finish.drop', { name: line.name })}
            </Button>
          </Stack>
          {dropped ? null : (
            <>
              <Stack direction="row" spacing={1}>
                <TextField
                  label={t('shopping:add.quantity')}
                  type="number"
                  value={edit.quantity}
                  error={!quantityValid}
                  helperText={
                    quantityValid
                      ? undefined
                      : t('shopping:finish.quantityInvalid')
                  }
                  onChange={(event) =>
                    review.edit(line.itemId, { quantity: event.target.value })
                  }
                  slotProps={{
                    htmlInput: { min: 0, step: 'any', inputMode: 'decimal' },
                  }}
                />
                <TextField
                  select
                  label={t('shopping:add.unit')}
                  value={edit.unit}
                  onChange={(event) =>
                    review.edit(line.itemId, {
                      unit: event.target.value as typeof edit.unit,
                    })
                  }
                  slotProps={{ select: { native: true } }}
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(`shopping:units.${unit}`)}
                    </option>
                  ))}
                </TextField>
              </Stack>
              <TextField
                select
                label={t('pantry:form.location')}
                value={edit.location}
                onChange={(event) =>
                  review.edit(line.itemId, {
                    location: event.target.value as typeof edit.location,
                  })
                }
                slotProps={{ select: { native: true } }}
              >
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {t(`pantry:locations.${location}`)}
                  </option>
                ))}
              </TextField>
              <TextField
                type="date"
                label={t('pantry:form.expiry')}
                value={edit.expiryDate}
                onChange={(event) =>
                  review.edit(line.itemId, { expiryDate: event.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}
        </Stack>
      ))}

      <Stack direction="row" spacing={1}>
        <Button
          type="button"
          disabled={!review.canConfirm}
          onClick={review.confirm}
        >
          {review.confirming
            ? t('shopping:finish.confirming')
            : t('shopping:finish.confirm', { count: review.keptCount })}
        </Button>
        <Button type="button" variant="text" onClick={onCancel}>
          {t('shopping:finish.cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
