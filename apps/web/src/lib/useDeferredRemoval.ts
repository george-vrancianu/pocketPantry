import { useToast, type ToastHandle } from '@pocket-pantry/ui';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
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
 * newer `mutate` runs. The hook cancels in-flight refetches of `queryKey`
 * (the list's query key) before it calls `mutateAsync`, so a poll cannot
 * resurrect the row.
 *
 * `discard` drops a waiting removal without sending it, for when the record is
 * written again before its Undo window ends.
 *
 * `removeMany` removes several records as one removal: one Undo window, one toast, and one call to
 * `mutateManyAsync` with all the ids when the window ends. Undo brings all of them back. It is still
 * the latest removal, of one record or many, that can be undone.
 *
 * The error toast replaces a newer Undo toast and so sends that delete early;
 * that is intended (ADR 0009: a new toast sends any pending delete).
 */
export function useDeferredRemoval<Id extends string | number>(
  queryKey: QueryKey,
  mutateAsync: (id: Id) => Promise<unknown>,
  mutateManyAsync?: (ids: Id[]) => Promise<unknown>,
) {
  const { t } = useTranslation('common');
  const toast = useToast();
  const queryClient = useQueryClient();
  // Held by key value, so a new array each render does not change `send`.
  const keyRef = useRef(queryKey);
  keyRef.current = queryKey;
  const send = useCallback(
    async (ids: Id[], many: boolean) => {
      await queryClient.cancelQueries({ queryKey: keyRef.current });
      if (!many) return mutateAsync(ids[0]);
      // Without a bulk call, every record of the removal gets its own delete.
      return mutateManyAsync
        ? mutateManyAsync(ids)
        : Promise.all(ids.map((id) => mutateAsync(id)));
    },
    [queryClient, mutateAsync, mutateManyAsync],
  );
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<Id>>(new Set());
  // The one removal still waiting on its Undo, and its toast. One removal may hold several records.
  const waiting = useRef<{
    ids: Id[];
    many: boolean;
    toast: ToastHandle;
  } | null>(null);

  const unhide = useCallback((ids: Id[]) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);

  const flush = useCallback(
    (ids: Id[]) => {
      const pending = waiting.current;
      if (pending?.ids !== ids) return;
      waiting.current = null;
      send(ids, pending.many).then(
        () => unhide(ids),
        (error: unknown) => {
          unhide(ids);
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
    flush(pending.ids);
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

  const start = (ids: Id[], many: boolean, message: string) => {
    setHiddenIds((prev) => new Set([...prev, ...ids]));
    // Showing a toast sends the previous removal; this one takes its place.
    const handle = toast.show(message, {
      duration: UNDO_WINDOW_MS,
      action: {
        label: t('row.undo'),
        onClick: () => {
          // Too late once the delete has been sent.
          if (waiting.current?.ids !== ids) return;
          waiting.current = null;
          unhide(ids);
        },
      },
      onClose: () => flush(ids),
    });
    waiting.current = { ids, many, toast: handle };
  };

  /** `message` replaces the default "Removed {name}" toast text, already translated. */
  const remove = (id: Id, name: string, message?: string) =>
    start([id], false, message ?? t('row.removed', { name }));

  /** Several records as one removal; `message` is the toast text, already translated. Sends one `mutateManyAsync` call, or one `mutateAsync` per record without it. */
  const removeMany = (ids: Id[], message: string) => start(ids, true, message);

  /**
   * Drop the removal that holds `id` and is still waiting on its Undo, without sending it: its toast closes and
   * all of its records show again. Call it before writing the record back, so the delete cannot follow.
   */
  const discard = (id: Id) => {
    const pending = waiting.current;
    if (!pending?.ids.includes(id)) return;
    waiting.current = null;
    unhide(pending.ids);
    pending.toast.close();
  };

  return { hiddenIds, remove, removeMany, discard };
}
