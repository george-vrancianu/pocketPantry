import { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useCatalogParents,
  type CatalogSearchResult,
} from '../../../lib/catalog';
import {
  clearReview,
  readReview,
  invalidFields,
  toNewBatch,
  toReviewLine,
  type ReviewLine,
} from '../../../lib/review';
import {
  initReviewState,
  reviewCounts,
  reviewGroups,
  reviewReducer,
} from '../../../lib/reviewState';
import { toNewShoppingItem, useAddShoppingItems } from '../../../lib/plate';
import { useReceiptConfirm, type TickFailures } from '../../../lib/receiptScan';
import { MAX_BULK_BATCHES, useAddBatches } from '../../../lib/scan';
import { fieldId, rowId } from '../components/layout';

/**
 * Review screen state. The Member's edits live here, in client state, until
 * Save. Batch Scan Modes (Product, Receipt, Ingredients) save through the bulk
 * Batch endpoint; a mode that saves elsewhere (Plate adds Shopping Items)
 * branches on `draft.mode` at `save`.
 */
export function useReviewScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  // Read once: clearing the draft on save must not bounce the page to /scan.
  const [draft] = useState(readReview);
  const [state, dispatch] = useReducer(reviewReducer, draft, (d) => {
    const today = new Date();
    return initReviewState(
      (d?.lines ?? []).map((line, index) =>
        toReviewLine(line, `line-${index}`, today),
      ),
    );
  });
  const addBatches = useAddBatches(i18n.language);
  const confirmReceipt = useReceiptConfirm(i18n.language);
  const addShoppingItems = useAddShoppingItems(i18n.language);
  // Plate lines are things to buy, not things in the Pantry.
  const shopping = draft?.mode === 'plate';
  // Each Scan Mode saves through one mutation; Product and Ingredients share the bulk Batch endpoint.
  const savers = {
    product: addBatches,
    ingredients: addBatches,
    receipt: confirmReceipt,
    plate: addShoppingItems,
  };
  const saver = savers[draft?.mode ?? 'product'];
  // Excluded lines (Scan-excluded or removed by the Member) wait outside the list and are never saved.
  const groups = reviewGroups(state);
  const counts = reviewCounts(state);
  const included = state.lines.filter((line) => line.excluded === null);
  // Only Unmatched Pantry lines choose a category; Plate lines go to the Shopping List, which has no category picker.
  const parents = useCatalogParents(
    i18n.language,
    !shopping && included.some((line) => line.match === null),
  );
  // Receipt Scan: ticking Shopping Items happens after the save; if any tick failed, say so here before leaving.
  const [tickFailures, setTickFailures] = useState<TickFailures | null>(null);
  // Focus lands on an element that only exists after the render that opened or restored it.
  const [focusId, setFocusId] = useState<string | null>(null);
  useEffect(() => {
    if (focusId === null) return;
    document.getElementById(focusId)?.focus();
    setFocusId(null);
  }, [focusId, state]);
  const overLimit = shopping
    ? 0
    : Math.max(0, included.length - MAX_BULK_BATCHES);

  const change = (key: string, patch: Partial<ReviewLine>) =>
    dispatch({ type: 'update', key, patch });
  const changeMatch = (key: string, match: CatalogSearchResult) =>
    dispatch({ type: 'changeMatch', key, match, today: new Date() });
  const toggle = (key: string) => dispatch({ type: 'toggle', key });
  const remove = (key: string) => dispatch({ type: 'remove', key });
  const restore = (key: string) => {
    dispatch({ type: 'restore', key });
    setFocusId(rowId(key));
  };
  /** Open the first line with an invalid value and focus that field. Returns whether there was one. */
  const focusInvalid = (candidates: ReviewLine[]) => {
    const line = candidates.find((l) => invalidFields(l).length > 0);
    if (!line) return false;
    dispatch({ type: 'open', key: line.key });
    setFocusId(fieldId(line.key, invalidFields(line)[0]));
    return true;
  };
  // Confirm and Done shut the row; an invalid value keeps it open and takes focus instead.
  const confirm = (key: string) => {
    const line = state.lines.find((l) => l.key === key);
    if (line && focusInvalid([line])) return;
    dispatch({ type: 'confirm', key });
    setFocusId(rowId(key));
  };

  const save = () => {
    // Display order, so the Member lands on the topmost problem.
    if (focusInvalid([...groups.review, ...groups.sure])) return;
    const to = shopping ? '/shopping' : '/pantry';
    const done = {
      onSuccess: (result?: unknown) => {
        clearReview();
        const failures = (result as { tickFailures?: TickFailures } | undefined)
          ?.tickFailures;
        if (
          failures &&
          failures.missing + failures.changed + failures.other > 0
        ) {
          setTickFailures(failures);
          return;
        }
        navigate(to);
      },
    };
    if (shopping) {
      addShoppingItems.mutate(included.map(toNewShoppingItem), done);
      return;
    }
    const mode = draft?.mode;
    const batches = included.map(toNewBatch).map((batch) =>
      // The queue only records the source of Unmatched names.
      batch.rawName && mode && mode !== 'plate'
        ? { ...batch, source: mode }
        : batch,
    );
    if (mode === 'receipt') confirmReceipt.mutate(batches, done);
    else addBatches.mutate(batches, done);
  };
  const discard = () => {
    clearReview();
    navigate('/scan');
  };

  return {
    hadDraft: draft !== null,
    mode: draft?.mode,
    shopping,
    state,
    groups,
    counts,
    parents: parents.data ?? [],
    canSave: included.length > 0 && overLimit === 0 && !saver.isPending,
    overLimit,
    maxItems: MAX_BULK_BATCHES,
    saving: saver.isPending,
    error: saver.error ? translateApiError(t, saver.error) : null,
    tickFailures,
    toPantry: () => navigate('/pantry'),
    toggle,
    change,
    changeMatch,
    remove,
    restore,
    confirm,
    toggleSureGroup: () => dispatch({ type: 'toggleSureGroup' }),
    save,
    discard,
  };
}
