import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCATIONS, type StorageLocation } from '../lib/catalog';
import { fullDate } from '../lib/pantry';
import type { VoiceBatchRow, VoiceReviewAction } from '../lib/voice';
import { voiceNote } from '../lib/voiceNoteStore';

/** The Location a Pantry add will use: the spoken one, else the Catalog default. */
export const effectiveLocation = (
  action: VoiceReviewAction,
): StorageLocation | null =>
  action.location ?? action.defaults.location ?? null;

/** The expiry a Pantry add will use; null is "no expiry". */
export const effectiveExpiry = (action: VoiceReviewAction): string | null =>
  action.noExpiry
    ? null
    : (action.expiresOn ?? action.defaults.expiresOn ?? null);

/** Whether Review still needs something from the Member before this Pantry action can apply. */
export function pantryActionIncomplete(action: VoiceReviewAction): boolean {
  if (action.target !== 'pantry') return false;
  if (action.op === 'add') {
    return action.status === 'ready' && effectiveLocation(action) === null;
  }
  return action.status === 'needsBatch' && !action.batchId;
}

function batchLine(
  batch: VoiceBatchRow,
  t: (key: string, options?: Record<string, unknown>) => string,
  language: string,
) {
  const amount =
    batch.quantity === null
      ? t('voice:review.pantry.noAmount')
      : `${batch.quantity} ${batch.unit ?? ''}`.trim();
  const date =
    batch.expiresOn === null
      ? t('voice:review.pantry.noDate')
      : fullDate(batch.expiresOn, new Date(), language);
  return t('voice:review.pantry.batch', { amount, date });
}

/** What taking this Batch does: all of it, or an amount off it. */
function takeLabel(
  batch: VoiceBatchRow,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  return batch.take === null || batch.take === undefined
    ? t('voice:review.pantry.whole')
    : t('voice:review.pantry.take', {
        amount: `${batch.take} ${batch.unit ?? ''}`.trim(),
      });
}

/**
 * What a Pantry Voice Action will do, under its name in Review: an add's
 * Location and expiry (defaults filled in, both editable), the Batches a
 * removal will take, a Batch picker when it needs one, or the Running low
 * outcome.
 */
export function VoiceReviewPantryRow({
  action,
  name,
}: {
  action: VoiceReviewAction;
  name: string;
}) {
  const { t, i18n } = useTranslation(['voice', 'common']);
  const id = useId();

  if (action.op === 'add') {
    const location = effectiveLocation(action);
    const expiry = effectiveExpiry(action);
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{ flex: '1 1 100%', alignItems: 'flex-start' }}
      >
        <TextField
          id={`${id}-location`}
          select
          label={t('voice:review.pantry.location')}
          value={location ?? ''}
          onChange={(event) =>
            voiceNote.edit(action.id, {
              location: (event.target.value || null) as StorageLocation | null,
            })
          }
          slotProps={{ select: { native: true } }}
          sx={{ flex: '1 1 40%', minWidth: 120 }}
        >
          {location === null ? (
            <option value="">{t('voice:review.pantry.chooseLocation')}</option>
          ) : null}
          {LOCATIONS.map((value) => (
            <option key={value} value={value}>
              {t(`common:locations.${value}`)}
            </option>
          ))}
        </TextField>
        <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
          <TextField
            id={`${id}-expiry`}
            type="date"
            label={t('voice:review.pantry.expires')}
            value={expiry ?? ''}
            onChange={(event) =>
              event.target.value === ''
                ? voiceNote.edit(action.id, { noExpiry: true, expiresOn: null })
                : voiceNote.edit(action.id, {
                    noExpiry: false,
                    expiresOn: event.target.value,
                  })
            }
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <Button
            variant="ghost"
            aria-pressed={action.noExpiry}
            onClick={() =>
              voiceNote.edit(action.id, {
                noExpiry: !action.noExpiry,
                expiresOn: null,
              })
            }
          >
            {t('voice:review.pantry.noExpiry')}
          </Button>
        </Box>
      </Stack>
    );
  }

  const batches = action.rows.batches ?? [];

  if (action.op === 'runningLow') {
    return (
      <Box sx={{ flex: '1 1 100%' }}>
        <Typography variant="caption" sx={{ color: tokens.color.muted }}>
          {action.rows.shoppingFallback
            ? t('voice:review.pantry.shoppingFallback', { name })
            : t('voice:review.pantry.runningLow', { name })}
        </Typography>
      </Box>
    );
  }

  if (action.op !== 'remove' || batches.length === 0) return null;

  if (action.status === 'needsBatch') {
    return (
      <Box sx={{ flex: '1 1 100%' }}>
        <TextField
          id={`${id}-batch`}
          select
          label={t('voice:review.pantry.pickLabel', { name })}
          value={action.batchId ?? ''}
          onChange={(event) =>
            voiceNote.edit(action.id, { batchId: event.target.value || null })
          }
          slotProps={{ select: { native: true } }}
          fullWidth
        >
          <option value="">{t('voice:review.pantry.pickPrompt')}</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batchLine(batch, t, i18n.language)} · {takeLabel(batch, t)}
            </option>
          ))}
        </TextField>
        {action.batchId ? null : (
          <Typography variant="caption">
            {t('voice:review.pantry.pickNeeded')}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      component="ul"
      aria-label={name}
      sx={{ flex: '1 1 100%', listStyle: 'none', m: 0, p: 0 }}
    >
      {batches.map((batch) => (
        <Typography
          key={batch.id}
          component="li"
          variant="caption"
          sx={{ display: 'block', color: tokens.color.muted }}
        >
          {batchLine(batch, t, i18n.language)}
          {' · '}
          {takeLabel(batch, t)}
        </Typography>
      ))}
    </Box>
  );
}
