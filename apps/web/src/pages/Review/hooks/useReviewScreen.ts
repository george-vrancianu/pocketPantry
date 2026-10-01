import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useCatalogParents,
  type CatalogSearchResult,
} from '../../../lib/catalog';
import {
  clearReview,
  isLineValid,
  toNewBatch,
  toReviewLine,
  useReviewDraft,
  withMatch,
  type ReviewLine,
} from '../../../lib/review';
import { useAddBatches } from '../../../lib/scan';

/**
 * Review screen state. The Member's edits live here, in client state, until
 * Save. Batch Scan Modes (Product, Receipt, Ingredients) save through the bulk
 * Batch endpoint; a mode that saves elsewhere (Plate adds Shopping Items)
 * branches on `draft.mode` at `save`.
 */
export function useReviewScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const draft = useReviewDraft();
  // Captured once: clearing the draft on save must not bounce the page to /scan.
  const [hadDraft] = useState(draft !== null);
  const [lines, setLines] = useState<ReviewLine[]>(() => {
    const today = new Date();
    return (draft?.lines ?? []).map((line, index) =>
      toReviewLine(line, `line-${index}`, today),
    );
  });
  const addBatches = useAddBatches(i18n.language);
  // Only Unmatched lines choose a category, so only fetch the list when one is on screen.
  const parents = useCatalogParents(
    i18n.language,
    lines.some((line) => line.match === null),
  );

  const change = (key: string, patch: Partial<ReviewLine>) =>
    setLines((all) =>
      all.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  const changeMatch = (key: string, match: CatalogSearchResult) =>
    setLines((all) =>
      all.map((line) =>
        line.key === key ? withMatch(line, match, new Date()) : line,
      ),
    );
  const drop = (key: string) =>
    setLines((all) => all.filter((line) => line.key !== key));

  const save = () => {
    const mode = draft?.mode;
    const source = mode && mode !== 'plate' ? mode : undefined;
    addBatches.mutate(
      lines.map(toNewBatch).map((batch) =>
        // The queue only records the source of Unmatched names.
        batch.rawName && source ? { ...batch, source } : batch,
      ),
      {
        onSuccess: () => {
          clearReview();
          navigate('/pantry');
        },
      },
    );
  };
  const discard = () => {
    clearReview();
    navigate('/scan');
  };

  return {
    hadDraft,
    lines,
    parents: parents.data ?? [],
    canSave:
      lines.length > 0 && lines.every(isLineValid) && !addBatches.isPending,
    saving: addBatches.isPending,
    error: addBatches.error ? translateApiError(t, addBatches.error) : null,
    change,
    changeMatch,
    drop,
    save,
    discard,
  };
}
