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
import { AmountField } from './AmountField';
import { MatchDialog } from './MatchDialog';
import {
  pantryActionIncomplete,
  VoiceReviewPantryRow,
} from './VoiceReviewPantryRow';
import { useScanLanguage } from '../pages/Scan/hooks/useScanLanguage';
import { translateApiError } from '../i18n/translateApiError';
import type { CatalogSearchResult } from '../lib/catalog';
import { defaultExpiryDate, parseAmountText } from '../lib/pantry';
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

/** The Review label of a Shopping op; plain adds carry none. */
const opLabelKey = (action: VoiceReviewAction) => {
  if (action.target !== 'shopping') return null;
  if (action.op === 'check') {
    return action.rows.shoppingItem ? 'check' : 'addAndCheck';
  }
  return action.op === 'setQuantity' ||
    action.op === 'uncheck' ||
    action.op === 'remove'
    ? action.op
    : null;
};
/** Ops that never carry an amount. */
const hasNoAmount = (action: VoiceReviewAction) =>
  action.target === 'shopping' &&
  (action.op === 'uncheck' || action.op === 'remove');

const quantityText = (action: VoiceReviewAction) =>
  action.quantity === null ? '' : String(action.quantity);

/**
 * Review for a Voice Note: a sheet over the current page with a collapsed "What
 * I heard", the Voice Actions grouped by list, and Discard and Apply. It reads
 * the shared Voice Note store, so any page can host it.
 */
export function VoiceReview() {
  const { t } = useTranslation(['voice', 'common']);
  const { proposal: note } = useVoiceNoteState();
  const { locale } = useScanLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [heardOpen, setHeardOpen] = useState(false);
  const [matching, setMatching] = useState<VoiceReviewAction | null>(null);

  // What the Member typed in each quantity field; the store only takes valid amounts.
  const [typed, setTyped] = useState<Record<string, string>>({});

  const actions = note?.actions ?? [];
  const applicable = actions.filter(
    (a) => a.status === 'ready' || (a.status === 'needsBatch' && a.batchId),
  );
  // A Pantry add with no Location, or a removal whose Batch is not picked, holds Apply back.
  const incomplete = actions.filter(pantryActionIncomplete);
  const invalid = new Set(
    applicable
      .filter((a) => !parseAmountText(typed[a.id] ?? quantityText(a)).valid)
      .map((a) => a.id),
  );

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
        open={note !== undefined}
        onClose={close}
        label={t('voice:review.title')}
        size="content"
        footer={
          <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={close}>
              {t('voice:review.discard')}
            </Button>
            <Button
              disabled={
                applicable.length === 0 ||
                invalid.size > 0 ||
                incomplete.length > 0 ||
                apply.isPending
              }
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
                      quantity={typed[action.id] ?? quantityText(action)}
                      invalid={invalid.has(action.id)}
                      onQuantityChange={(text) => {
                        setTyped((current) => ({
                          ...current,
                          [action.id]: text,
                        }));
                        const parsed = parseAmountText(text);
                        if (parsed.valid) {
                          voiceNote.edit(action.id, { quantity: parsed.value });
                        }
                      }}
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
        defaultQuery={
          matching
            ? (matching.ingredient?.name ?? matching.name ?? undefined)
            : undefined
        }
        onClose={() => setMatching(null)}
        onSelect={(ingredient) => {
          if (matching) {
            voiceNote.edit(matching.id, {
              ingredient,
              name: null,
              // A Pantry add's Location and Default Expiry follow the new Match.
              ...(matching.target === 'pantry'
                ? { defaults: defaultsOf(ingredient) }
                : {}),
            });
          }
          setMatching(null);
        }}
      />
    </>
  );
}

/**
 * What a Pantry add falls back to for a Match: its Catalog Location and Default
 * Expiry. Catalog search already applies the Family's expiry overrides to
 * `expiryDays`, so this agrees with the server's `addDefaults`.
 */
function defaultsOf(ingredient: CatalogSearchResult) {
  const { location, expiryDays } = ingredient.defaults;
  return {
    ...(location ? { location } : {}),
    ...(expiryDays === null
      ? {}
      : { expiresOn: defaultExpiryDate(expiryDays, new Date()) }),
  };
}

function ActionRow({
  action,
  quantity,
  invalid,
  onQuantityChange,
  onChangeMatch,
}: {
  action: VoiceReviewAction;
  quantity: string;
  invalid: boolean;
  onQuantityChange: (text: string) => void;
  onChangeMatch: () => void;
}) {
  const { t } = useTranslation(['voice', 'common']);
  const name = displayName(action);
  const readOnly = action.status !== 'ready';
  const pantry = action.target === 'pantry';
  // A Pantry removal or Running low is tied to the Batches of its Match.
  const canChangeMatch = !pantry || action.op === 'add';

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
        {opLabelKey(action) && action.status === 'ready' ? (
          <Typography variant="caption" sx={{ display: 'block' }}>
            {t(`voice:review.ops.${opLabelKey(action)}`)}
          </Typography>
        ) : null}
        {action.status === 'notFound' ? (
          <Typography variant="caption">
            {t('voice:review.notFound', { name })}
          </Typography>
        ) : null}
      </Box>
      {readOnly ||
      hasNoAmount(action) ||
      (pantry && action.op !== 'add') ? null : (
        <>
          <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
            <AmountField
              name={name}
              quantity={quantity}
              unit={action.unit ?? ''}
              onQuantityChange={(text, typedUnit) => {
                onQuantityChange(text);
                if (typedUnit !== undefined) {
                  voiceNote.edit(action.id, { unit: typedUnit || null });
                }
              }}
              onUnitChange={(unit) =>
                voiceNote.edit(action.id, { unit: unit || null })
              }
              error={invalid ? t('common:amount.invalid') : null}
              onSubmit={() => undefined}
            />
          </Box>
          {canChangeMatch ? (
            <Button
              variant="ghost"
              aria-label={t('voice:review.changeMatch', { name })}
              onClick={onChangeMatch}
            >
              {t('voice:review.change')}
            </Button>
          ) : null}
        </>
      )}
      {!readOnly && hasNoAmount(action) ? (
        <Button
          variant="ghost"
          aria-label={t('voice:review.changeMatch', { name })}
          onClick={onChangeMatch}
        >
          {t('voice:review.change')}
        </Button>
      ) : null}
      <IconButton
        label={t('voice:review.remove', { name })}
        onClick={() => voiceNote.remove(action.id)}
      >
        <CloseIcon />
      </IconButton>
      {pantry && action.status !== 'notFound' ? (
        <VoiceReviewPantryRow action={action} name={name} />
      ) : null}
    </Box>
  );
}
