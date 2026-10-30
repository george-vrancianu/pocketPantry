import { LinkReadingArt, useToast } from '@pocket-pantry/ui';
import { useRef, type ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { ApiError, apiRequest } from '../../lib/api';
import { isOutOfCredits } from '../../lib/credits';
import {
  recipeReads,
  useRecipeReads,
  type LinkRecipeRead,
  type RecipeRead,
} from '../../lib/recipeReads';
import { linkFailureReason, offersPasteText } from '../../lib/linkReadFailure';
import {
  DRAFT_PARAM,
  FROM_TEXT_PARAM,
  FROM_TEXT_PREFILL_STATE,
} from '../../lib/recipeRoutes';
import type {
  BackgroundAction,
  BackgroundItem,
  BackgroundStatus,
} from './backgroundItem';

const statusOf = (read: RecipeRead): BackgroundStatus =>
  read.status === 'waiting' || read.status === 'reading'
    ? 'reading'
    : read.status === 'ready'
      ? 'ready'
      : 'failed';

type Translate = TFunction<['background', 'recipes', 'errors']>;

/**
 * What one kind of read brings to its row: the words and art that differ between kinds. The status,
 * the buttons every row has (Review, Cancel, Discard, Retry) and the limits are the same for all of
 * them, so a new kind supplies only this.
 */
type RecipeReadRow = {
  /** The read as the Member would name it ("example.com"), used in button labels. */
  what: string;
  /** The row's title for the read's status. */
  title: string;
  /** The row's detail line for the read's status. */
  detail: string;
  art: ReactNode;
  /** Shown when Review finds the Recipe Draft gone. */
  gone: string;
  labels: {
    cancelRead: string;
    discardRead: string;
    retryRead: string;
    review: string;
  };
  /** Kind-specific buttons offered on a failed row, before Retry. */
  failedActions: BackgroundAction[];
};

/** The link kind's row: a link or pasted text. */
function linkRow(
  read: LinkRecipeRead,
  t: Translate,
  language: string,
  navigate: NavigateFunction,
): RecipeReadRow {
  const isText = read.source.kind === 'text';
  const what = read.site ?? t('background:link.pastedText');
  const title =
    read.status === 'waiting'
      ? t(isText ? 'background:link.waitingText' : 'background:link.waiting')
      : read.status === 'reading'
        ? t(isText ? 'background:link.readingText' : 'background:link.reading')
        : read.status === 'ready'
          ? t('background:link.ready')
          : read.status === 'capped'
            ? t(
                isOutOfCredits(read.error)
                  ? 'background:link.outOfCredits'
                  : 'background:link.capped',
              )
            : t('background:link.failed');
  const failedActions: BackgroundAction[] = [];
  if (offersPasteText(read) && read.source.kind === 'link') {
    failedActions.push({
      type: 'button',
      tone: 'secondary',
      label: t('recipes:fromText.pasteInstead'),
      ariaLabel: t('background:link.pasteInstead', { what }),
      closesSheet: true,
      // The failed row stays until the pasted text is submitted, so closing the sheet loses nothing.
      onClick: () =>
        navigate(`/recipes?${FROM_TEXT_PARAM}=1`, {
          state: {
            [FROM_TEXT_PREFILL_STATE]: { site: read.site, replaces: read.id },
          },
        }),
    });
  }
  return {
    what,
    title,
    detail:
      read.status === 'failed' || read.status === 'capped'
        ? linkFailureReason(t, language, read)
        : what,
    art: <LinkReadingArt size={28} />,
    gone: t('background:link.gone'),
    labels: {
      cancelRead: t('background:link.cancelRead', { what }),
      discardRead: t('background:link.discardRead', { what }),
      retryRead: t('background:link.retryRead', { what }),
      review: t('background:link.review', { what }),
    },
    failedActions,
  };
}

/** The row of a read, by its kind: the one place a new kind adds its words. */
function rowOf(
  read: RecipeRead,
  t: Translate,
  language: string,
  navigate: NavigateFunction,
): RecipeReadRow {
  switch (read.kind) {
    case 'link':
      return linkRow(read, t, language, navigate);
  }
}

/**
 * The recipe-read holder seen as background items: one per read, its row buttons (Review, Cancel,
 * Discard, Retry) bound to the holder. A view: the holder keeps the rules (what runs, what waits).
 */
export function useRecipeReadBackgroundItems(enabled = true): BackgroundItem[] {
  const { t, i18n } = useTranslation(['background', 'recipes', 'errors']);
  const navigate = useNavigate();
  const toast = useToast();
  const { reads } = useRecipeReads();
  // Review checks the draft first; a second press meanwhile must not open it twice.
  const opening = useRef(new Set<number>());

  const review = async (read: RecipeRead, gone: string) => {
    const draftId = read.recipeDraftId;
    if (draftId === undefined || opening.current.has(read.id)) return;
    opening.current.add(read.id);
    try {
      // The editor fetches the draft again; this one only learns whether it is still kept.
      await apiRequest(`/recipe-drafts/${draftId}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // Discarded elsewhere or expired: nothing to open.
        toast.show(gone, { polite: true });
        recipeReads.discard(read.id);
        return;
      }
      // Any other failure: the editor reports its own, with its own retry.
    } finally {
      opening.current.delete(read.id);
    }
    recipeReads.discard(read.id);
    navigate(`/recipes/new?${DRAFT_PARAM}=${draftId}`);
  };

  // A host that is not the app's shows no recipe reads.
  return (enabled ? reads : []).map((read): BackgroundItem => {
    const row = rowOf(read, t, i18n.language, navigate);
    const ready = read.status === 'ready';

    const actions: BackgroundAction[] = [];
    if (read.status === 'waiting' || read.status === 'reading') {
      actions.push({
        type: 'button',
        tone: 'secondary',
        label: t('background:link.cancel'),
        ariaLabel: row.labels.cancelRead,
        onClick: () => recipeReads.discard(read.id),
      });
    } else if (!ready) {
      actions.push({
        type: 'button',
        tone: 'secondary',
        label: t('background:link.discard'),
        ariaLabel: row.labels.discardRead,
        onClick: () => recipeReads.discard(read.id),
      });
      actions.push(...row.failedActions);
      actions.push({
        type: 'button',
        tone: 'primary',
        label: t('background:link.retry'),
        ariaLabel: row.labels.retryRead,
        onClick: () => recipeReads.retry(read.id),
      });
    }

    return {
      kind: read.kind,
      id: String(read.id),
      title: row.title,
      detail: row.detail,
      status: statusOf(read),
      createdAt: read.order,
      art: row.art,
      open: ready
        ? {
            label: t('background:review'),
            ariaLabel: row.labels.review,
            onClick: () => void review(read, row.gone),
          }
        : undefined,
      actions,
    };
  });
}
