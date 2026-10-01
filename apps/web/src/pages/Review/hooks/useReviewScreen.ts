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
import { toNewShoppingItem, useAddShoppingItems } from '../../../lib/plate';
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
  const addShoppingItems = useAddShoppingItems(i18n.language);
  // Plate lines are things to buy, not things in the Pantry.
  const shopping = draft?.mode === 'plate';
  const saveMutation = shopping ? addShoppingItems : addBatches;
  // Only Unmatched Pantry lines choose a category; Plate lines go to the Shopping List, which has no category picker.
  const parents = useCatalogParents(
    i18n.language,
    !shopping && lines.some((line) => line.match === null),
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
    const done = (to: string) => ({
      onSuccess: () => {
        clearReview();
        navigate(to);
      },
    });
    if (shopping) {
      addShoppingItems.mutate(lines.map(toNewShoppingItem), done('/shopping'));
    } else {
      const mode = draft?.mode;
      const source = mode && mode !== 'plate' ? mode : undefined;
      addBatches.mutate(
        lines.map(toNewBatch).map((batch) =>
          // The queue only records the source of Unmatched names.
          batch.rawName && source ? { ...batch, source } : batch,
        ),
        done('/pantry'),
      );
    }
  };
  const discard = () => {
    clearReview();
    navigate('/scan');
  };

  return {
    hadDraft,
    shopping,
    lines,
    parents: parents.data ?? [],
    canSave:
      lines.length > 0 && lines.every(isLineValid) && !saveMutation.isPending,
    saving: saveMutation.isPending,
    error: saveMutation.error ? translateApiError(t, saveMutation.error) : null,
    change,
    changeMatch,
    drop,
    save,
    discard,
  };
}
