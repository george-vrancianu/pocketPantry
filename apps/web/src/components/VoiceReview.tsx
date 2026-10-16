import {
  Alert,
  Box,
  Button,
  CloseIcon,
  IconButton,
  Sheet,
  Stack,
  Typography,
  tokens,
  useToast,
} from '@pocket-pantry/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MatchDialog } from '../pages/Review/components/MatchDialog';
import { useScanLanguage } from '../pages/Scan/hooks/useScanLanguage';
import { translateApiError } from '../i18n/translateApiError';
import { UNITS, type Unit } from '../lib/catalog';
import {
  catalogChangeQueryKeys,
  shoppingListChangeQueryKeys,
} from '../lib/queryKeys';
import {
  applyVoiceActions,
  type VoiceApplyResult,
  type VoiceList,
  type VoiceReviewAction,
} from '../lib/voice';
import { voiceNote, useVoiceNoteState } from '../lib/voiceNoteStore';

const LISTS: VoiceList[] = ['shopping', 'pantry'];

const displayName = (action: VoiceReviewAction) =>
  action.ingredient?.name ?? action.name ?? action.text;

/** Quantity text -> number: empty is none, anything else must be a positive number. */
function parseQuantity(text: string): number | null | undefined {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/**
 * Review for a Voice Note: a sheet over the current page with a collapsed "What
 * I heard", the Voice Actions grouped by list, and Discard and Apply. It reads
 * the shared Voice Note store, so any page can host it.
 */
export function VoiceReview() {
  const { t } = useTranslation(['voice', 'common']);
  const { note } = useVoiceNoteState();
  const { locale } = useScanLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [heardOpen, setHeardOpen] = useState(false);
  const [matching, setMatching] = useState<VoiceReviewAction | null>(null);

  const actions = note?.actions ?? [];
  const applicable = actions.filter((a) => a.status === 'ready');

  const apply = useMutation({
    mutationFn: () => applyVoiceActions(applicable, locale),
    onSuccess: (result: VoiceApplyResult) => {
      const skipped = result.skipped.flatMap(({ id, reason }) => {
        const action = actions.find((a) => a.id === id);
        return action
          ? [
              `${displayName(action)} (${t(`voice:skipReason.${reason}`, {
                defaultValue: t('voice:skipReason.other'),
              })})`,
            ]
          : [];
      });
      voiceNote.discard();
      setHeardOpen(false);
      toast.show(
        [
          t('voice:toast.applied', { count: result.applied.length }),
          skipped.length > 0
            ? t('voice:toast.skipped', { names: skipped.join(', ') })
            : null,
        ]
          .filter(Boolean)
          .join(' '),
      );
      void Promise.all(
        [
          ['shopping-list'],
          ['pantry'],
          ...shoppingListChangeQueryKeys,
          ...catalogChangeQueryKeys.filter(
            (key) => key[0] === 'pantry' || key[0] === 'recipes',
          ),
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
    },
  });

  const close = () => {
    apply.reset();
    setHeardOpen(false);
    voiceNote.discard();
  };

  const understood = actions.filter((a) => a.status !== 'notUnderstood');
  const unclear = actions.filter((a) => a.status === 'notUnderstood');

  return (
    <>
      <Sheet
        open={note !== null}
        onClose={close}
        label={t('voice:review.title')}
        size="content"
        footer={
          <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={close}>
              {t('voice:review.discard')}
            </Button>
            <Button
              disabled={applicable.length === 0 || apply.isPending}
              onClick={() => apply.mutate()}
            >
              {t('voice:review.apply')}
            </Button>
          </Box>
        }
      >
        <Stack spacing={2}>
          <Typography variant="h2">{t('voice:review.title')}</Typography>

          <Box component="section">
            <Box
              component="button"
              type="button"
              aria-expanded={heardOpen}
              aria-controls="voice-heard"
              onClick={() => setHeardOpen((open) => !open)}
              sx={{
                border: 0,
                background: 'none',
                padding: 0,
                font: 'inherit',
                fontWeight: 700,
                color: tokens.color.ink,
                cursor: 'pointer',
              }}
            >
              {t('voice:review.heard')}
            </Box>
            <Box id="voice-heard" hidden={!heardOpen}>
              {heardOpen ? <Typography>{note?.transcript}</Typography> : null}
            </Box>
          </Box>

          {apply.isError ? (
            <Alert>{translateApiError(t, apply.error)}</Alert>
          ) : null}

          {LISTS.map((list) => {
            const rows = understood.filter((a) => a.target === list);
            if (rows.length === 0) return null;
            return (
              <Box
                key={list}
                component="section"
                aria-label={t(`voice:review.lists.${list}`)}
              >
                <Typography variant="h3">
                  {t(`voice:review.lists.${list}`)}
                </Typography>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {rows.map((action) => (
                    <ActionRow
                      key={action.id}
                      action={action}
                      onChangeMatch={() => setMatching(action)}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}

          {unclear.length > 0 ? (
            <Box
              component="section"
              aria-label={t('voice:review.notUnderstood')}
            >
              <Typography variant="h3">
                {t('voice:review.notUnderstood')}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                {unclear.map((action) => (
                  <Box
                    component="li"
                    key={action.id}
                    sx={{ py: '6px', color: tokens.color.muted }}
                  >
                    {action.text}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}
        </Stack>
      </Sheet>

      <MatchDialog
        open={matching !== null}
        name={matching ? displayName(matching) : ''}
        defaultQuery={matching?.name ?? undefined}
        onClose={() => setMatching(null)}
        onSelect={(ingredient) => {
          if (matching) {
            voiceNote.edit(matching.id, { ingredient, name: null });
          }
          setMatching(null);
        }}
      />
    </>
  );
}

function ActionRow({
  action,
  onChangeMatch,
}: {
  action: VoiceReviewAction;
  onChangeMatch: () => void;
}) {
  const { t } = useTranslation(['voice']);
  const name = displayName(action);
  const [quantity, setQuantity] = useState(
    action.quantity === null ? '' : String(action.quantity),
  );
  const readOnly = action.status !== 'ready';

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        py: '8px',
      }}
    >
      <Box sx={{ flex: '1 1 140px', minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
        <Typography variant="caption" sx={{ color: tokens.color.muted }}>
          {action.ingredient
            ? action.text
            : `${action.text} · ${t('voice:review.unmatched')}`}
        </Typography>
        {action.status === 'notFound' ? (
          <Typography variant="caption">
            {t('voice:review.notFound')}
          </Typography>
        ) : null}
      </Box>
      {readOnly ? null : (
        <>
          <Box
            component="input"
            inputMode="decimal"
            aria-label={t('voice:review.quantityOf', { name })}
            value={quantity}
            onChange={(event: { target: { value: string } }) => {
              setQuantity(event.target.value);
              const parsed = parseQuantity(event.target.value);
              if (parsed !== undefined) {
                voiceNote.edit(action.id, { quantity: parsed });
              }
            }}
            sx={{ width: 72, height: 36, font: 'inherit', px: '8px' }}
          />
          <Box
            component="select"
            aria-label={t('voice:review.unitOf', { name })}
            value={action.unit ?? ''}
            onChange={(event: { target: { value: string } }) =>
              voiceNote.edit(action.id, {
                unit: (event.target.value || null) as Unit | null,
              })
            }
            sx={{ height: 36, font: 'inherit' }}
          >
            <option value="">{t('voice:review.noUnit')}</option>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Box>
          <Button
            variant="ghost"
            aria-label={t('voice:review.changeMatch', { name })}
            onClick={onChangeMatch}
          >
            {t('voice:review.change')}
          </Button>
        </>
      )}
      <IconButton
        label={t('voice:review.remove', { name })}
        onClick={() => voiceNote.remove(action.id)}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
}
