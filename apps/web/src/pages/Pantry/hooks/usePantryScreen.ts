import { useState } from 'react';
import type { StorageLocation } from '../../../lib/catalog';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { useToday } from '../../../lib/useToday';
import {
  countByLocation,
  groupByLocation,
  matchesSearch,
  rollUp,
  useBatches,
  useRunningLow,
  useDeleteBatch,
  type PantryFilter,
  type RollUp,
} from '../../../lib/pantry';
import { useDeferredRemoval } from '../../../lib/useDeferredRemoval';

/**
 * A roll-up row as shown. `gone`: every Batch of it is pending removal. The row stays (empty, so Undo
 * brings it back as it was, expanded) until the delete has been sent, and then it collapses away.
 */
export type PantryRow = RollUp & {
  gone: boolean;
  runningLow: boolean;
  /** This row's key for the page's one open Ingredient. */
  openKey: OpenIngredientKey;
  open: boolean;
};

/**
 * Which Ingredient is open on the page: the Location and the roll-up key. A plain string, so it can
 * later be kept across navigation (issue 261). The same Ingredient in another Location is another row.
 */
export type OpenIngredientKey = string;

export const openIngredientKey = (
  location: StorageLocation,
  rowKey: string,
): OpenIngredientKey => `${location}/${rowKey}`;

export function usePantryScreen() {
  const { t, i18n } = useTranslation();
  const today = useToday();
  const batches = useBatches(i18n.language);
  // One observer for the screen, so each row reads its flag from props rather than its own query.
  const runningLow = useRunningLow(i18n.language);
  const flagged = runningLow.data ?? new Set<string>();
  const { mutateAsync: sendDelete } = useDeleteBatch();
  const removal = useDeferredRemoval(['pantry'], sendDelete);
  const { hiddenIds } = removal;
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PantryFilter>('all');
  // One open Ingredient for the whole page: opening another closes it, in any Location.
  const [openKey, setOpenKey] = useState<OpenIngredientKey | null>(null);

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
        const gone = remaining.length === 0;
        const current =
          remaining.length === row.batches.length || gone
            ? row
            : rollUp(remaining)[0];
        const key = openIngredientKey(group.location, current.key);
        return {
          ...current,
          gone,
          runningLow: flagged.has(current.key),
          openKey: key,
          open: key === openKey,
        };
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
    /** Open the Ingredient, closing any other; or close it if it is the open one. */
    toggleOpen: (key: OpenIngredientKey) =>
      setOpenKey((current) => (current === key ? null : key)),
    removeBatch: removal.remove,
    retry: () => void batches.refetch(),
  };
}
