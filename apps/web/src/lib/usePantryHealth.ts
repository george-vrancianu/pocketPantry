import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  healthTodos,
  pantryHealth,
  type HealthInput,
  type HealthTodo,
  type PantryHealth,
} from './health';
import { localIso, useBatches, useRunningLow, type Batch } from './pantry';
import { useFamilySettings, useStaleThresholdDays } from './settings';
import { useShoppingList } from './shopping';
import { useStaples, type Staple } from './staples';
import { useSuggestions } from './suggestions';
import { useToday } from './useToday';

export type PantryHealthState = {
  isPending: boolean;
  error: Error | null;
  /** The number of Batches in the Pantry, scored or not. */
  batchCount: number;
  /** What the score and Health To-dos were computed from, for scoring a fix before it lands. */
  input: HealthInput;
  health: PantryHealth;
  todos: HealthTodo[];
  /** What the Health To-dos' item ids point at. */
  batches: Batch[];
  staples: Staple[];
  staleThresholdDays: number;
};

/** The Family's Pantry Health and Health To-dos, from the Pantry, Staples, Shopping List, Suggestions (dismissed ids) and Stale Threshold reads. */
export function usePantryHealth(): PantryHealthState {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const today = localIso(useToday());
  const batches = useBatches(locale);
  const runningLow = useRunningLow(locale);
  const staples = useStaples(locale);
  const shopping = useShoppingList(locale);
  const suggestions = useSuggestions(locale, today);
  const settings = useFamilySettings(locale);
  const staleThresholdDays = useStaleThresholdDays(locale);

  const input = useMemo<HealthInput>(
    () => ({
      today,
      staleThresholdDays,
      batches: batches.data ?? [],
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
      batches.data,
      staples.data,
      runningLow.data,
      shopping.data,
      suggestions.data,
    ],
  );
  const health = useMemo(() => pantryHealth(input), [input]);
  const todos = useMemo(() => healthTodos(input), [input]);

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
    batchCount: input.batches.length,
    input,
    health,
    todos,
    batches: batches.data ?? [],
    staples: staples.data ?? [],
    staleThresholdDays,
  };
}
