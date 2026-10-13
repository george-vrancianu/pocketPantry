import { useToast, type ToastHandle } from '@pocket-pantry/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../i18n/translateApiError';

/** How long a removal can be undone, ms. */
export const UNDO_WINDOW_MS = 5000;

/**
 * Remove a record with Undo (ADR 0009). `remove` hides the record at once and
 * shows an Undo toast; `send` (the real delete) only runs when that toast
 * ends: it times out, is dismissed or replaced by another toast, or the Member
 * leaves the page. Undo just shows the record again and makes no request.
 *
 * Filter `hiddenIds` out of the list you render, so a refetch cannot bring a
 * removed record back. A record stays hidden until `send` has settled; if it
 * rejects the record comes back with an error toast. Only the latest removal
 * can be undone.
 *
 * `send` must resolve only once the cache no longer holds the record (put the
 * response in the cache with `setQueryData` in the mutation's `onSuccess`, or
 * return the `invalidateQueries` promise), otherwise the row flashes back.
 * Pass `mutateAsync`, not `mutate`: per-call callbacks are dropped when a
 * newer `mutate` runs. Cancel in-flight refetches of the list inside `send`
 * so a poll cannot resurrect the row.
 *
 * The error toast replaces a newer Undo toast and so sends that delete early;
 * that is intended (ADR 0009: a new toast sends any pending delete).
 */
export function useDeferredRemoval<Id extends string | number>(
  send: (id: Id) => Promise<unknown>,
) {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<Id>>(new Set());
  // The one removal still waiting on its Undo, and its toast.
  const waiting = useRef<{ id: Id; toast: ToastHandle } | null>(null);

  const unhide = useCallback((id: Id) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const flush = useCallback(
    (id: Id) => {
      if (waiting.current?.id !== id) return;
      waiting.current = null;
      send(id).then(
        () => unhide(id),
        (error: unknown) => {
          unhide(id);
          toast.show(translateApiError(t, error));
        },
      );
    },
    [send, unhide, toast, t],
  );

  // Leaving the page, by route change or closing the tab, sends it too, and
  // takes down the Undo toast, which would otherwise outlive the delete.
  const flushWaiting = useRef(() => {});
  flushWaiting.current = () => {
    const pending = waiting.current;
    if (!pending) return;
    flush(pending.id);
    pending.toast.close();
  };
  useEffect(() => {
    const onPageHide = () => flushWaiting.current();
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      flushWaiting.current();
    };
  }, []);

  const remove = (id: Id, name: string) => {
    setHiddenIds((prev) => new Set(prev).add(id));
    // Showing a toast sends the previous removal; this one takes its place.
    const handle = toast.show(t('row.removed', { name }), {
      duration: UNDO_WINDOW_MS,
      action: {
        label: t('row.undo'),
        onClick: () => {
          // Too late once the delete has been sent.
          if (waiting.current?.id !== id) return;
          waiting.current = null;
          unhide(id);
        },
      },
      onClose: () => flush(id),
    });
    waiting.current = { id, toast: handle };
  };

  return { hiddenIds, remove };
}
