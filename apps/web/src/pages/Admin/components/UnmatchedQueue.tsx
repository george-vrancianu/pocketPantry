import {
  Alert,
  Button,
  SegmentedControl,
  Spinner,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import type { AdminCatalog } from '../../../lib/admin';
import {
  useDismissUnmatched,
  useUnmatchedQueue,
  type UnmatchedEntry,
  type UnmatchedStatus,
} from '../../../lib/unmatched';
import { UnmatchedResolver } from './UnmatchedResolver';

type Props = { catalog: AdminCatalog };

/**
 * The Admin queue of Unmatched names: one line per distinct normalised name
 * with how many Batches and Shopping Items carry it. Resolve opens the
 * resolver for that name; Dismiss sets it aside (the rows stay Unmatched).
 */
export function UnmatchedQueue({ catalog }: Props) {
  const { t } = useTranslation(['admin', 'errors', 'common']);
  const [status, setStatus] = useState<UnmatchedStatus>('open');
  const [resolving, setResolving] = useState<UnmatchedEntry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const queue = useUnmatchedQueue(status);
  const dismiss = useDismissUnmatched();

  if (resolving) {
    return (
      <UnmatchedResolver
        entry={resolving}
        catalog={catalog}
        onDone={(message) => {
          setResolving(null);
          setNotice(message);
        }}
        onCancel={() => setResolving(null)}
      />
    );
  }

  const entries = queue.data ?? [];
  const error = queue.error ?? dismiss.error;
  return (
    <Stack spacing={2}>
      <SegmentedControl
        label={t('admin:unmatched.statusLabel')}
        value={status}
        onChange={(next) => {
          setStatus(next);
          setNotice(null);
        }}
        options={[
          { value: 'open', label: t('admin:unmatched.status.open') },
          { value: 'dismissed', label: t('admin:unmatched.status.dismissed') },
        ]}
      />
      {/* A polite live region so the result of a resolve is announced. */}
      <div role="status">
        {notice ? <Typography variant="body2">{notice}</Typography> : null}
      </div>
      {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
      {queue.isPending ? <Spinner label={t('common:loading')} /> : null}
      {queue.isSuccess && entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:unmatched.empty')}
        </Typography>
      ) : null}
      <Stack component="ul" spacing={2} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {entries.map((entry) => (
          <li key={entry.normalizedName}>
            <QueueRow
              entry={entry}
              canDismiss={status === 'open'}
              dismissing={dismiss.isPending}
              onResolve={() => {
                setNotice(null);
                setResolving(entry);
              }}
              onDismiss={() => dismiss.mutate(entry.normalizedName)}
            />
          </li>
        ))}
      </Stack>
    </Stack>
  );
}

type RowProps = {
  entry: UnmatchedEntry;
  canDismiss: boolean;
  dismissing: boolean;
  onResolve: () => void;
  onDismiss: () => void;
};

function QueueRow({
  entry,
  canDismiss,
  dismissing,
  onResolve,
  onDismiss,
}: RowProps) {
  const { t, i18n } = useTranslation('admin');
  const sources = entry.sources
    .map((source) => t(`unmatched.sources.${source}`))
    .sort((a, b) => a.localeCompare(b, i18n.language))
    .join(', ');
  const locales = entry.locales
    .map((locale) => t(`locales.${locale}`))
    .join(', ');
  return (
    <Stack spacing={1}>
      <Typography component="h3" variant="subtitle1">
        {entry.rawName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('unmatched.rows', { count: entry.count })} · {sources} · {locales}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          aria-label={t('unmatched.resolveName', { name: entry.rawName })}
          onClick={onResolve}
        >
          {t('unmatched.resolve')}
        </Button>
        {canDismiss ? (
          <Button
            variant="text"
            disabled={dismissing}
            aria-label={t('unmatched.dismissName', { name: entry.rawName })}
            onClick={onDismiss}
          >
            {t('unmatched.dismiss')}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
