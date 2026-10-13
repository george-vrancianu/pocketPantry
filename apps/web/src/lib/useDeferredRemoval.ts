import { useToast } from '@pocket-pantry/ui';
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
 * removed record back. A record stays hidden until its delete has settled; if
 * the delete fails it comes back with an error toast. Only the latest removal
 * can be undone.
 */
export function useDeferredRemoval(send: (id: string) => Promise<unknown>) {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());
  // The one removal still waiting on its Undo.
  const waiting = useRef<string | null>(null);

  const unhide = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const flush = useCallback(
    (id: string) => {
      if (waiting.current !== id) return;
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

  // Leaving the page, by route change or closing the tab, sends it too.
  const flushWaiting = useRef(() => {});
  flushWaiting.current = () => {
    if (waiting.current !== null) flush(waiting.current);
  };
  useEffect(() => {
    const onPageHide = () => flushWaiting.current();
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      flushWaiting.current();
    };
  }, []);

  const remove = (id: string, name: string) => {
    setHiddenIds((prev) => new Set(prev).add(id));
    // Showing a toast sends the previous removal; this one takes its place.
    toast.show(t('row.removed', { name }), {
      duration: UNDO_WINDOW_MS,
      action: {
        label: t('row.undo'),
        onClick: () => {
          waiting.current = null;
          unhide(id);
        },
      },
      onClose: () => flush(id),
    });
    waiting.current = id;
  };

  return { hiddenIds, remove };
}
