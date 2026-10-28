import {
  Alert,
  Box,
  Card,
  Stack,
  Typography,
  radius,
  tokens,
} from '@pocket-pantry/ui';
import type { TFunction } from 'i18next';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCredits, type CreditHistoryEntry } from '../../../lib/credits';
import { SectionHeading } from './SectionHeading';

/** What a history entry was, worded by its kind (a hand grant's reason is shown as entered). */
function entryTitle(
  t: TFunction<'settings'>,
  entry: CreditHistoryEntry,
  who: string,
): string {
  switch (entry.kind) {
    case 'spend':
      return t(`credits.history.spend.${entry.readKind ?? 'scan'}`);
    case 'grant':
      return entry.reason
        ? t('credits.history.grantWith', { reason: entry.reason })
        : t('credits.history.grant');
    case 'transfer_in':
      return t('credits.history.transfer_in', { who });
    default:
      return t(`credits.history.${entry.kind}`);
  }
}

function HistoryList({ history }: { history: CreditHistoryEntry[] }) {
  const { t, i18n } = useTranslation('settings');
  const format = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  if (history.length === 0)
    return (
      <Typography variant="meta" color="text.secondary">
        {t('credits.history.empty')}
      </Typography>
    );
  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {history.map((entry) => {
        const named = entry.kind === 'spend' || entry.kind === 'transfer_in';
        const who = entry.formerMember
          ? t('credits.formerMember')
          : (entry.memberName ?? '');
        const when = format.format(new Date(entry.createdAt));
        return (
          <Stack
            key={entry.id}
            component="li"
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography>{entryTitle(t, entry, who)}</Typography>
              <Typography variant="meta" color="text.secondary">
                {named && who
                  ? t('credits.history.by', { who, when })
                  : t('credits.history.when', { when })}
              </Typography>
            </Box>
            <Typography
              component="span"
              sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
            >
              {entry.amount > 0 ? `+${entry.amount}` : `\u2212${-entry.amount}`}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

/** The Credits panel: how many Credits the Family has left and where they went, shared by every Member. */
export function CreditsSection() {
  const { t } = useTranslation('settings');
  const id = useId();
  const credits = useCredits();
  const headingId = `${id}-credits`;
  return (
    <Stack component="section" spacing={1} aria-labelledby={headingId}>
      <SectionHeading id={headingId} title={t('credits.title')} />
      <Card>
        <Stack spacing={1.5}>
          {credits.isPending ? (
            <Box
              role="status"
              aria-label={t('loading')}
              sx={{
                height: 44,
                borderRadius: radius.control,
                bgcolor: tokens.color.subtle,
              }}
            />
          ) : null}
          {credits.error ? (
            <Alert>{translateApiError(t, credits.error)}</Alert>
          ) : null}
          {credits.data ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
              <Typography
                component="span"
                aria-live="polite"
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {credits.data.balance}
              </Typography>
              <Typography component="span" color="text.secondary">
                {t('credits.left', { count: credits.data.balance })}
              </Typography>
            </Stack>
          ) : null}
          {credits.data &&
          credits.data.balance <= credits.data.lowBalanceThreshold ? (
            <Alert severity="warning" role="status">
              {t('credits.low')}
            </Alert>
          ) : null}
          <Typography variant="meta" color="text.secondary">
            {t('credits.hint')}
          </Typography>
          {credits.data ? (
            <Stack spacing={1}>
              <Typography component="h3" variant="meta" color="text.secondary">
                {t('credits.history.title')}
              </Typography>
              <HistoryList history={credits.data.history} />
            </Stack>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}
