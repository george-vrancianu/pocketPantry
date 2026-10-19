import {
  Box,
  Button,
  Chip,
  SearchIcon,
  Typography,
  tokens,
  radius,
  focusRing,
} from '@pocket-pantry/ui';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpiryTag } from '../ExpiryTag';
import { CatalogSearch } from '../catalogSearch/CatalogSearch';
import { ExpirySheet } from '../ExpiryPicker';
import { QuickPicks } from '../ExpiryPicker/QuickPicks';
import {
  LOCATIONS,
  UNITS,
  type CatalogSearchResult,
  type StorageLocation,
} from '../../lib/catalog';
import {
  dateAndRelativeDay,
  defaultExpiryDate,
  fullDate,
  useExpiryTags,
} from '../../lib/pantry';
import { useToday } from '../../lib/useToday';
import type { VoiceBatchRow, VoiceReviewAction } from '../../lib/voice';
import { voiceNote } from '../../lib/voiceNoteStore';
import {
  canChangeIngredient,
  displayName,
  effectiveExpiry,
  effectiveLocation,
  hasAmount,
  soonestFirst,
} from './reviewModel';
import { useVoiceActionText } from './voiceActionText';

const eyebrow = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  color: tokens.color.muted,
  mb: '6px',
} as const;

const note = { fontSize: 12.5, color: tokens.color.muted, mt: '6px' } as const;

/**
 * What a Pantry add falls back to for a Match: its Catalog Location and Default
 * Expiry. Catalog search already applies the Family's expiry overrides to
 * `expiryDays`, so this agrees with the server's `addDefaults`.
 */
function defaultsOf(ingredient: CatalogSearchResult, today: Date) {
  const { location, expiryDays } = ingredient.defaults;
  return {
    ...(location ? { location } : {}),
    ...(expiryDays === null
      ? {}
      : { expiresOn: defaultExpiryDate(expiryDays, today) }),
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box role="group" aria-label={label}>
      <Typography component="div" sx={eyebrow}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function AmountEditor({
  action,
  typed,
  invalid,
  onTyped,
}: {
  action: VoiceReviewAction;
  typed: string;
  invalid: boolean;
  onTyped: (text: string) => void;
}) {
  const { t } = useTranslation(['voice', 'common']);
  const name = displayName(action);
  const errorId = useId();
  return (
    <Field label={t('voice:review.edit.amount')}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Box
          component="input"
          type="text"
          inputMode="decimal"
          value={typed}
          placeholder="–"
          aria-label={t('voice:review.edit.amountOf', { name })}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onTyped(event.target.value)
          }
          sx={{
            width: 80,
            height: 40,
            boxSizing: 'border-box',
            px: '10px',
            font: 'inherit',
            fontSize: 16,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: tokens.color.ink,
            backgroundColor: tokens.color.surface,
            border: `1.5px solid ${invalid ? tokens.color.urgentFg : tokens.color.line}`,
            borderRadius: radius.control,
            ...focusRing,
          }}
        />
        <Box
          role="group"
          aria-label={t('voice:review.edit.unitOf', { name })}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
        >
          {UNITS.map((unit) => (
            <Chip
              key={unit}
              label={t(`common:units.${unit}`)}
              selected={action.unit === unit}
              onClick={() => voiceNote.edit(action.id, { unit })}
            />
          ))}
        </Box>
      </Box>
      {invalid ? (
        <Typography id={errorId} sx={{ ...note, color: tokens.color.urgentFg }}>
          {t('common:amount.invalid')}
        </Typography>
      ) : null}
    </Field>
  );
}

function ExpiresEditor({
  action,
  spokenExpiry,
}: {
  action: VoiceReviewAction;
  /** The expiry the server heard, to tell it from one picked here. */
  spokenExpiry: string | null;
}) {
  const { t, i18n } = useTranslation(['voice', 'common']);
  const today = useToday();
  const { tagFor } = useExpiryTags(today);
  const [picking, setPicking] = useState(false);
  const expiry = effectiveExpiry(action);
  const usualDays = action.ingredient?.defaults.expiryDays ?? null;
  const name = displayName(action);

  const set = (iso: string | null) =>
    voiceNote.edit(
      action.id,
      iso === null
        ? { noExpiry: true, expiresOn: null }
        : { noExpiry: false, expiresOn: iso },
    );

  let source: string | null = null;
  if (expiry !== null) {
    const when = dateAndRelativeDay(expiry, today, i18n.language).date;
    if (action.expiresOn === null) {
      source = `${when} · ${t('voice:review.edit.defaultExpiry')}`;
    } else if (action.expiresOn === spokenExpiry) {
      source = `${when} · ${t('voice:review.edit.fromSpeech')}`;
    } else {
      source = when;
    }
  }

  return (
    <Field label={t('voice:review.edit.expires')}>
      <QuickPicks
        value={expiry}
        usualDays={usualDays}
        today={today}
        onPick={(iso) => set(iso)}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Chip
          label={t('voice:review.edit.noExpiry')}
          selected={action.noExpiry}
          onClick={() => set(null)}
        />
        <Button variant="ghost" size="sm" onClick={() => setPicking(true)}>
          {t('voice:review.edit.pickDate')}
        </Button>
        {expiry !== null ? <ExpiryTag tag={tagFor(expiry)} /> : null}
      </Box>
      {source ? <Typography sx={note}>{source}</Typography> : null}
      <ExpirySheet
        open={picking}
        onClose={() => setPicking(false)}
        value={expiry}
        onChange={set}
        usualDays={usualDays}
        context={name}
        title={t('voice:review.edit.expiryTitle')}
      />
    </Field>
  );
}

function LocationEditor({ action }: { action: VoiceReviewAction }) {
  const { t } = useTranslation(['voice', 'common']);
  const location = effectiveLocation(action);
  return (
    <Field label={t('voice:review.edit.location')}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {LOCATIONS.map((value: StorageLocation, index) => (
          <Chip
            key={value}
            label={t(`common:locations.${value}`)}
            selected={location === value}
            data-voice-picker={index === 0 ? action.id : undefined}
            onClick={() => voiceNote.edit(action.id, { location: value })}
          />
        ))}
      </Box>
      {action.location === null && action.defaults.location ? (
        <Typography sx={note}>
          {t('voice:review.edit.locationDefault')}
        </Typography>
      ) : null}
    </Field>
  );
}

function BatchEditor({ action }: { action: VoiceReviewAction }) {
  const { t, i18n } = useTranslation(['voice', 'common']);
  const today = useToday();
  const { tagFor } = useExpiryTags(today);
  const { amountOf } = useVoiceActionText();
  const name = useId();
  const batches = soonestFirst(action.rows.batches ?? []);
  const label = t('voice:review.edit.whichBatch');
  const pickedIndex = batches.findIndex((batch) => batch.id === action.batchId);

  return (
    <Box>
      <Typography component="div" id={`${name}-label`} sx={eyebrow}>
        {label}
      </Typography>
      <Box
        role="radiogroup"
        aria-labelledby={`${name}-label`}
        sx={{
          backgroundColor: tokens.color.surface,
          border: `1px solid ${pickedIndex < 0 ? tokens.color.soonBorder : tokens.color.line}`,
          borderRadius: radius.control,
          overflow: 'hidden',
        }}
      >
        {batches.map((batch: VoiceBatchRow, index) => {
          const amount = amountOf(batch) ?? t('voice:review.detail.noAmount');
          const date =
            batch.expiresOn === null
              ? t('voice:review.detail.noDate')
              : fullDate(batch.expiresOn, today, i18n.language);
          return (
            <Box
              component="label"
              key={batch.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minHeight: 50,
                px: '12px',
                py: '7px',
                cursor: 'pointer',
                borderTop:
                  index === 0 ? 0 : `1px solid ${tokens.color.divider}`,
              }}
            >
              <input
                type="radio"
                name={name}
                value={batch.id}
                checked={action.batchId === batch.id}
                data-voice-picker={index === 0 ? action.id : undefined}
                onChange={() =>
                  voiceNote.edit(action.id, { batchId: batch.id })
                }
                style={{ width: 20, height: 20, accentColor: 'currentColor' }}
              />
              <Box
                component="span"
                aria-hidden
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: tokens.color.chipNeutral,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </Box>
              <Box component="span" sx={{ flex: 1, minWidth: 0, fontSize: 14 }}>
                <Box component="b">{amount}</Box>
                <Box component="span" sx={{ color: tokens.color.muted }}>
                  {' · '}
                  {date}
                </Box>
              </Box>
              <ExpiryTag tag={tagFor(batch.expiresOn)} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function IngredientEditor({ action }: { action: VoiceReviewAction }) {
  const { t } = useTranslation(['voice', 'common']);
  const [searching, setSearching] = useState(false);
  const today = useToday();
  const refocus = useRef(false);
  const name = displayName(action);

  // Leaving the search with Escape puts focus back on "Change".
  useEffect(() => {
    if (searching || !refocus.current) return;
    refocus.current = false;
    document
      .querySelector<HTMLElement>(`[data-voice-change="${action.id}"]`)
      ?.focus();
  }, [searching, action.id]);

  if (searching) {
    return (
      <Box
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          // Escape belongs to the search, never to the Sheet behind it.
          event.stopPropagation();
          const open = event.currentTarget
            .querySelector('[role="combobox"]')
            ?.getAttribute('aria-expanded');
          if (open === 'true') return;
          setSearching(false);
          refocus.current = true;
        }}
      >
        <Typography component="div" sx={eyebrow}>
          {t('voice:review.edit.ingredient')}
        </Typography>
        <CatalogSearch
          autoFocus
          showUnit={false}
          defaultQuery={action.ingredient?.name ?? action.name ?? undefined}
          label={t('voice:review.edit.searchLabel', { name })}
          onSelect={(ingredient) => {
            voiceNote.edit(action.id, {
              ingredient,
              name: null,
              // A Pantry add's Location and Default Expiry follow the new Match.
              ...(action.target === 'pantry'
                ? { defaults: defaultsOf(ingredient, today) }
                : {}),
            });
            setSearching(false);
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <Typography
        component="span"
        sx={{ fontSize: 13, color: tokens.color.muted }}
      >
        {t('voice:review.edit.ingredient')}
      </Typography>
      <Typography component="span" sx={{ fontSize: 14, fontWeight: 700 }}>
        {name}
      </Typography>
      {action.ingredient ? null : (
        <Box
          component="span"
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            px: '8px',
            py: '2px',
            borderRadius: '999px',
            backgroundColor: tokens.color.soonBg,
            color: tokens.color.soonFg,
          }}
        >
          {t('voice:review.edit.unmatched')}
        </Box>
      )}
      {canChangeIngredient(action) ? (
        <Button
          variant="ghost"
          size="sm"
          data-voice-change={action.id}
          startIcon={<SearchIcon size={15} />}
          aria-label={t('voice:review.edit.changeIngredient', { name })}
          onClick={() => setSearching(true)}
        >
          {t('voice:review.edit.change')}
        </Button>
      ) : null}
    </Box>
  );
}

/** The open row's editor: what was heard, then the fields that apply to this Voice Action. */
export function ActionEditor({
  action,
  typed,
  invalid,
  spokenExpiry,
  onTyped,
  onDone,
}: {
  action: VoiceReviewAction;
  typed: string;
  invalid: boolean;
  spokenExpiry: string | null;
  onTyped: (text: string) => void;
  onDone: () => void;
}) {
  const { t } = useTranslation(['voice', 'common']);
  const pantryAdd = action.target === 'pantry' && action.op === 'add';
  const batches =
    action.target === 'pantry' &&
    action.op === 'remove' &&
    action.status === 'needsBatch';
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pt: '2px',
        pb: '14px',
        pr: '14px',
        pl: '57px',
      }}
    >
      <Typography sx={{ fontSize: 12.5, color: tokens.color.muted }}>
        {t('voice:review.edit.heard')} “{action.text}”
      </Typography>
      {hasAmount(action) ? (
        <AmountEditor
          action={action}
          typed={typed}
          invalid={invalid}
          onTyped={onTyped}
        />
      ) : null}
      {pantryAdd ? (
        <ExpiresEditor action={action} spokenExpiry={spokenExpiry} />
      ) : null}
      {pantryAdd ? <LocationEditor action={action} /> : null}
      {batches ? <BatchEditor action={action} /> : null}
      <IngredientEditor action={action} />
      <Box>
        <Button variant="tonal" shape="pill" size="sm" onClick={onDone}>
          {t('voice:review.edit.done')}
        </Button>
      </Box>
    </Box>
  );
}
