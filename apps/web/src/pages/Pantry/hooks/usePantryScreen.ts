import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  countByLocation,
  groupByLocation,
  matchesSearch,
  rollUp,
  useBatches,
  useDeleteBatch,
  type PantryFilter,
  type RollUp,
} from '../../../lib/pantry';
import { useDeferredRemoval } from '../../../lib/useDeferredRemoval';

/**
 * A roll-up row as shown. `gone`: every Batch of it is pending removal. The row stays (empty, so Undo
 * brings it back as it was, expanded) until the delete has been sent, and then it collapses away.
 */
export type PantryRow = RollUp & { gone: boolean };

export function usePantryScreen() {
  const { t, i18n } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const batches = useBatches(i18n.language, today);
  const queryClient = useQueryClient();
  const { mutateAsync: sendDelete } = useDeleteBatch();
  const removal = useDeferredRemoval(
    useCallback(
      async (id: string) => {
        // A refetch already in flight would carry the Batch back in.
        await queryClient.cancelQueries({ queryKey: ['pantry'] });
        return sendDelete(id);
      },
      [queryClient, sendDelete],
    ),
  );
  const { hiddenIds } = removal;
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PantryFilter>('all');

  const all = batches.data ?? [];
  // Chip counts follow the search, so they always say how many Batches the chip would show.
  const searched = all.filter((batch) => matchesSearch(batch, query));
  const live = (batch: { id: string }) => !hiddenIds.has(batch.id);
  const shown =
    filter === 'all'
      ? searched
      : searched.filter((batch) => batch.location === filter);

  return {
    sections: groupByLocation(shown).map((group) => ({
      location: group.location,
      batchCount: group.batches.filter(live).length,
      rows: rollUp(group.batches).map((row): PantryRow => {
        const remaining = row.batches.filter(live);
        if (remaining.length === row.batches.length) {
          return { ...row, gone: false };
        }
        if (remaining.length === 0) return { ...row, gone: true };
        return { ...rollUp(remaining)[0], gone: false };
      }),
    })),
    counts: countByLocation(searched.filter(live)),
    query,
    setQuery,
    filter,
    setFilter,
    isLoading: batches.isPending,
    isEmpty: batches.isSuccess && all.length === 0,
    noMatches: batches.isSuccess && all.length > 0 && shown.length === 0,
    error: batches.error ? translateApiError(t, batches.error) : null,
    today,
    adding,
    startAdding: () => setAdding(true),
    stopAdding: () => setAdding(false),
    removeBatch: removal.remove,
    retry: () => void batches.refetch(),
  };
}
