import {
  Alert,
  Button,
  SegmentedControl,
  Spinner,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import type { AdminCatalog } from '../../../lib/admin';
import {
  useDismissUnmatched,
  useUndismissUnmatched,
  useUnmatchedQueue,
  type UnmatchedEntry,
  type UnmatchedStatus,
} from '../../../lib/unmatched';
import { UnmatchedResolver } from './UnmatchedResolver';

type Props = { catalog: AdminCatalog };

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

/**
 * The Admin queue of Unmatched names: one line per distinct normalised name
 * with how many Batches and Shopping Items carry it. Resolve opens the
 * resolver for that name; Dismiss sets it aside (the rows stay Unmatched) and
 * Restore, in the dismissed tab, puts it back. More pages load on demand.
 */
export function UnmatchedQueue({ catalog }: Props) {
  const { t } = useTranslation(['admin', 'errors', 'common']);
  const [status, setStatus] = useState<UnmatchedStatus>('open');
  const [resolving, setResolving] = useState<UnmatchedEntry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const queue = useUnmatchedQueue(status);
  const dismiss = useDismissUnmatched();
  const undismiss = useUndismissUnmatched();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  // Where focus goes when the resolver closes: back to the row's Resolve
  // button on Cancel, to the result message on Done (the row is gone).
  // Index of the first row a Load more brings in, until focus has moved there.
  const [focusFrom, setFocusFrom] = useState<number | null>(null);
  const [restoreFocus, setRestoreFocus] = useState<
    { to: 'row'; name: string } | { to: 'notice' } | null
  >(null);

  useEffect(() => {
    if (resolving || !restoreFocus) return;
    if (restoreFocus.to === 'notice') {
      noticeRef.current?.focus();
    } else {
      const buttons =
        listRef.current?.querySelectorAll<HTMLElement>('[data-resolve-for]');
      const button = [...(buttons ?? [])].find(
        (candidate) => candidate.dataset.resolveFor === restoreFocus.name,
      );
      // The row can be gone (refetched, resolved by someone else): the heading is always there.
      (button ?? headingRef.current)?.focus();
    }
    setRestoreFocus(null);
  }, [resolving, restoreFocus, queue.data]);

  useEffect(() => {
    if (focusFrom === null || queue.isFetchingNextPage) return;
    const buttons =
      listRef.current?.querySelectorAll<HTMLElement>('[data-resolve-for]');
    (buttons?.[focusFrom] ?? headingRef.current)?.focus();
    setFocusFrom(null);
  }, [focusFrom, queue.isFetchingNextPage]);

  if (resolving) {
    return (
      <UnmatchedResolver
        entry={resolving}
        catalog={catalog}
        onDone={(message) => {
          setResolving(null);
          setNotice(message);
          setRestoreFocus({ to: 'notice' });
        }}
        onCancel={() => {
          setRestoreFocus({ to: 'row', name: resolving.normalizedName });
          setResolving(null);
        }}
      />
    );
  }

  const entries = queue.data ?? [];
  // The row is gone after Dismiss or Restore; keep focus on the page.
  const focusHeading = () => headingRef.current?.focus();
  const error = queue.error ?? dismiss.error ?? undismiss.error;
  return (
    <Stack spacing={2}>
      {/* Visually hidden: the focus target when a row or the Load more button goes away. */}
      <Typography
        component="h2"
        ref={headingRef}
        tabIndex={-1}
        sx={visuallyHidden}
      >
        {t('admin:unmatched.title')}
      </Typography>
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
      <div role="status" ref={noticeRef} tabIndex={-1}>
        {notice ? <Typography variant="body2">{notice}</Typography> : null}
      </div>
      {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
      {queue.isPending ? <Spinner label={t('common:loading')} /> : null}
      {queue.isSuccess && entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:unmatched.empty')}
        </Typography>
      ) : null}
      <Stack
        component="ul"
        ref={listRef}
        spacing={2}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {entries.map((entry) => (
          <li key={entry.normalizedName}>
            <QueueRow
              entry={entry}
              canDismiss={status === 'open'}
              busy={dismiss.isPending || undismiss.isPending}
              onResolve={() => {
                setNotice(null);
                setResolving(entry);
              }}
              onDismiss={() =>
                dismiss.mutate(entry.normalizedName, {
                  onSuccess: focusHeading,
                })
              }
              onRestore={() =>
                undismiss.mutate(entry.normalizedName, {
                  onSuccess: focusHeading,
                })
              }
            />
          </li>
        ))}
      </Stack>
      {queue.hasNextPage ? (
        <Button
          variant="secondary"
          aria-disabled={queue.isFetchingNextPage}
          onClick={() => {
            if (queue.isFetchingNextPage) return;
            setFocusFrom(entries.length);
            void queue.fetchNextPage();
          }}
        >
          {t('admin:unmatched.loadMore')}
        </Button>
      ) : null}
    </Stack>
  );
}

type RowProps = {
  entry: UnmatchedEntry;
  canDismiss: boolean;
  busy: boolean;
  onResolve: () => void;
  onDismiss: () => void;
  onRestore: () => void;
};

function QueueRow({
  entry,
  canDismiss,
  busy,
  onResolve,
  onDismiss,
  onRestore,
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
      {entry.sourceText ? (
        <Typography variant="body2">
          {entry.sourceLanguage
            ? t('unmatched.printedIn', {
                text: entry.sourceText,
                language: t(`locales.${entry.sourceLanguage}`),
              })
            : t('unmatched.printed', { text: entry.sourceText })}
        </Typography>
      ) : null}
      <Typography variant="body2" color="text.secondary">
        {t('unmatched.rows', { count: entry.count })} · {sources} · {locales}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          aria-label={t('unmatched.resolveName', { name: entry.rawName })}
          data-resolve-for={entry.normalizedName}
          onClick={onResolve}
        >
          {t('unmatched.resolve')}
        </Button>
        <Button
          variant="text"
          disabled={busy}
          aria-label={t(
            canDismiss ? 'unmatched.dismissName' : 'unmatched.restoreName',
            { name: entry.rawName },
          )}
          onClick={canDismiss ? onDismiss : onRestore}
        >
          {t(canDismiss ? 'unmatched.dismiss' : 'unmatched.restore')}
        </Button>
      </Stack>
    </Stack>
  );
}
