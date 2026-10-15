import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  healthTodos,
  pantryHealth,
  type HealthInput,
  type HealthTodo,
  type PantryHealth,
} from './health';
import {
  localIso,
  useBatches,
  useDeleteBatches,
  useRunningLow,
  type Batch,
} from './pantry';
import { useFamilySettings, useStaleThresholdDays } from './settings';
import { useShoppingList } from './shopping';
import { useStaples, type Staple } from './staples';
import { useSuggestions } from './suggestions';
import { useDeferredRemoval } from './useDeferredRemoval';
import { useToday } from './useToday';

export type PantryHealthState = {
  isPending: boolean;
  error: Error | null;
  /** The number of Batches in the Pantry, scored or not. */
  batchCount: number;
  health: PantryHealth;
  todos: HealthTodo[];
  /** What the Health To-dos' item ids point at. */
  batches: Batch[];
  staples: Staple[];
  staleThresholdDays: number;
  /**
   * Remove Batches from the Pantry with one Undo toast (ADR 0009). They leave the Health To-dos and the score
   * at once. `message` is the toast text, already translated; the new score is added to it when there is one.
   */
  removeBatches: (ids: string[], message: string) => void;
};

/** The Family's Pantry Health and Health To-dos, from the Pantry, Staples, Shopping List, Suggestions (dismissed ids) and Stale Threshold reads. */
export function usePantryHealth(): PantryHealthState {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const today = localIso(useToday());
  const batches = useBatches(locale);
  const runningLow = useRunningLow(locale);
  const staples = useStaples(locale);
  const shopping = useShoppingList(locale);
  const suggestions = useSuggestions(locale, today);
  const settings = useFamilySettings(locale);
  const staleThresholdDays = useStaleThresholdDays(locale);

  const { mutateAsync: sendDeleteMany } = useDeleteBatches();
  const removal = useDeferredRemoval(
    ['pantry'],
    (id: string) => sendDeleteMany([id]),
    sendDeleteMany,
  );
  const { hiddenIds } = removal;
  const stocked = useMemo(
    () => (batches.data ?? []).filter((batch) => !hiddenIds.has(batch.id)),
    [batches.data, hiddenIds],
  );

  const input = useMemo<HealthInput>(
    () => ({
      today,
      staleThresholdDays,
      batches: stocked,
      staples: staples.data ?? [],
      runningLow: runningLow.data ?? new Set(),
      onShoppingList: new Set(
        (shopping.data?.groups ?? [])
          .flatMap((group) => group.items)
          .flatMap((item) => (item.ingredientId ? [item.ingredientId] : [])),
      ),
      dismissed: new Set(suggestions.data?.dismissed),
    }),
    [
      today,
      staleThresholdDays,
      stocked,
      staples.data,
      runningLow.data,
      shopping.data,
      suggestions.data,
    ],
  );
  const health = useMemo(() => pantryHealth(input), [input]);
  const todos = useMemo(() => healthTodos(input), [input]);

  const removeBatches: PantryHealthState['removeBatches'] = (ids, message) => {
    const gone = new Set(ids);
    const after = pantryHealth({
      ...input,
      batches: input.batches.filter((batch) => !gone.has(batch.id)),
    });
    removal.removeMany(
      ids,
      after.scored
        ? t('dashboard:health.toast.withScore', {
            message,
            score: after.total,
          })
        : message,
    );
  };

  return {
    isPending:
      batches.isPending ||
      staples.isPending ||
      shopping.isPending ||
      runningLow.isPending ||
      suggestions.isPending ||
      settings.isPending,
    error:
      batches.error ??
      staples.error ??
      shopping.error ??
      runningLow.error ??
      suggestions.error,
    removeBatches,
    batchCount: input.batches.length,
    health,
    todos,
    batches: stocked,
    staples: staples.data ?? [],
    staleThresholdDays,
  };
}
