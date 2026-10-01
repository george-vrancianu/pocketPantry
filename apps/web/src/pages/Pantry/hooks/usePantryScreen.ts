import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  countByLocation,
  groupByLocation,
  matchesSearch,
  rollUp,
  useBatches,
  type PantryFilter,
} from '../../../lib/pantry';

export function usePantryScreen() {
  const { t, i18n } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const batches = useBatches(i18n.language, today);
  // The Scan screen's manual-add button lands here with `?add=1`: open the form straight away.
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(params.get('add') === '1');
  useEffect(() => {
    if (params.get('add') === '1') setParams({}, { replace: true });
  }, [params, setParams]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PantryFilter>('all');

  const all = batches.data ?? [];
  // Chip counts follow the search, so they always say how many Batches the chip would show.
  const searched = all.filter((batch) => matchesSearch(batch, query));
  const shown =
    filter === 'all'
      ? searched
      : searched.filter((batch) => batch.location === filter);

  return {
    sections: groupByLocation(shown).map((group) => ({
      location: group.location,
      batchCount: group.batches.length,
      rows: rollUp(group.batches),
    })),
    counts: countByLocation(searched),
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
    retry: () => void batches.refetch(),
  };
}
