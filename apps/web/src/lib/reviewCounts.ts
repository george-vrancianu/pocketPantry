import { useFamilyIngredientsQueue } from './familyIngredientsQueue';
import { useFamilySynonymsQueue } from './familySynonymsQueue';
import { useUnmatchedQueue } from './unmatched';

/**
 * What waits for the Admin: the totals the queue endpoints report, not the rows
 * loaded. They refetch with their queues, so every action that changes a queue
 * updates them.
 */
export function useReviewCounts() {
  const unmatched = useUnmatchedQueue('open').data?.total ?? 0;
  const family = useFamilyIngredientsQueue(true).data?.total ?? 0;
  const names = useFamilySynonymsQueue(true).data?.total ?? 0;
  return { unmatched, family, names, total: unmatched + family + names };
}
