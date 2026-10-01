import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { groupByLocation, useBatches } from '../../../lib/pantry';

export function usePantryScreen() {
  const { t, i18n } = useTranslation();
  const batches = useBatches(i18n.language);
  // The Scan screen's manual-add button lands here with `?add=1`: open the form straight away.
  const [params] = useSearchParams();
  const [adding, setAdding] = useState(params.get('add') === '1');

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
