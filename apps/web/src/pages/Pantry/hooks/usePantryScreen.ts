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
import type { AddBatchStart } from './useAddBatchForm';

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
  const { t } = useTranslation();
  const today = useToday();
  const batches = useBatches();
  // One observer for the screen, so each row reads its flag from props rather than its own query.
  const runningLow = useRunningLow();
  const flagged = runningLow.data ?? new Set<string>();
  const { mutateAsync: sendDelete } = useDeleteBatch();
  const removal = useDeferredRemoval(['pantry'], sendDelete);
  const { hiddenIds } = removal;
  // The Add batch form replaces the list while open; `from` is the row that opened it, if any.
  const [adding, setAdding] = useState<{
    start?: AddBatchStart;
    from?: OpenIngredientKey;
  } | null>(null);
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

  const sections = groupByLocation(shown).map((group) => ({
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
  }));

  // The open key goes with its row: once no row shown has it (filtered, searched or deleted away),
  // nothing is open, so the card does not come back open unprompted when the row returns.
  const openRowShown = sections.some((section) =>
    section.rows.some((row) => row.open),
  );
  const loaded = batches.data !== undefined;
  if (loaded && !openRowShown && openKey !== null) setOpenKey(null);

  return {
    sections,
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
    adding: adding !== null,
    /** What the open Add batch form starts with: nothing (the header "+") or a row's Ingredient. */
    addStart: adding?.start,
    /** The row whose Add batch button opened the form, for focus to go back to. */
    addingFrom: adding?.from,
    startAdding: () => setAdding({}),
    /** Add batch from an open card: its Ingredient picked, or its Unmatched name typed in. */
    startAddingTo: (row: PantryRow) =>
      setAdding({
        start:
          row.ingredientId === null
            ? { unmatchedName: row.name }
            : { ingredient: { id: row.ingredientId, name: row.name } },
        from: row.openKey,
      }),
    stopAdding: () => setAdding(null),
    /** Open the Ingredient, closing any other; or close it if it is the open one. */
    toggleOpen: (key: OpenIngredientKey) =>
      setOpenKey((current) => (current === key ? null : key)),
    removeBatch: removal.remove,
    retry: () => void batches.refetch(),
  };
}
