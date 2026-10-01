import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { groupByLocation, useBatches } from '../../../lib/pantry';

export function usePantryScreen() {
  const { t, i18n } = useTranslation();
  const batches = useBatches(i18n.language);
  const [adding, setAdding] = useState(false);

  return {
    sections: groupByLocation(batches.data ?? []),
    isLoading: batches.isPending,
    isEmpty: batches.isSuccess && batches.data.length === 0,
    error: batches.error ? translateApiError(t, batches.error) : null,
    today: new Date(),
    adding,
    startAdding: () => setAdding(true),
    stopAdding: () => setAdding(false),
    retry: () => void batches.refetch(),
  };
}
