import { LinkReadingArt, useToast } from '@pocket-pantry/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../i18n/translateApiError';
import { ApiError, apiRequest } from '../../lib/api';
import { linkReads, useLinkReads, type LinkRead } from '../../lib/linkReads';
import { recipeDraftsListKey } from '../../lib/recipeDrafts';
import { DRAFT_PARAM } from '../../pages/Recipes/useRecipeDraftRoute';
import type {
  BackgroundAction,
  BackgroundItem,
  BackgroundStatus,
} from './backgroundItem';

const statusOf = (read: LinkRead): BackgroundStatus =>
  read.status === 'waiting' || read.status === 'reading'
    ? 'reading'
    : read.status === 'ready'
      ? 'ready'
      : 'failed';

/**
 * The link-read holder seen as background items: one per link read, its row buttons (Review, Cancel,
 * Discard, Read again) bound to the holder. A view: the holder keeps the rules (what runs, what waits).
 * Also tells the Recipe Drafts list when a read kept a draft, so "Drafts (N)" counts it without a refresh.
 */
export function useLinkReadBackgroundItems(enabled = true): BackgroundItem[] {
  const { t } = useTranslation(['background', 'recipes', 'errors']);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { reads } = useLinkReads();
  // Review checks the draft first; a second press meanwhile must not open it twice.
  const opening = useRef(new Set<number>());

  useEffect(
    () =>
      enabled
        ? linkReads.onDraftKept(() => {
            void queryClient.invalidateQueries({
              queryKey: recipeDraftsListKey,
            });
          })
        : undefined,
    [queryClient, enabled],
  );

  const review = async (read: LinkRead) => {
    const draftId = read.recipeDraftId;
    if (draftId === undefined || opening.current.has(read.id)) return;
    opening.current.add(read.id);
    try {
      // The editor fetches the draft again; this one only learns whether it is still kept.
      await apiRequest(`/recipe-drafts/${draftId}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // Discarded elsewhere or expired: nothing to open.
        toast.show(t('background:link.gone'), { polite: true });
        linkReads.discard(read.id);
        return;
      }
      // Any other failure: the editor reports its own, with its own retry.
    } finally {
      opening.current.delete(read.id);
    }
    linkReads.discard(read.id);
    navigate(`/recipes/new?${DRAFT_PARAM}=${draftId}`);
  };

  // A host that is not the app's shows no link reads.
  return (enabled ? reads : []).map((read): BackgroundItem => {
    const isText = read.source.kind === 'text';
    const what = read.site ?? t('background:link.pastedText');
    const duplicate = read.status === 'ready' && read.duplicateOf !== undefined;
    const ready = read.status === 'ready';

    const title = duplicate
      ? t('recipes:fromLink.duplicate.heading')
      : read.status === 'waiting'
        ? t(isText ? 'background:link.waitingText' : 'background:link.waiting')
        : read.status === 'reading'
          ? t(
              isText
                ? 'background:link.readingText'
                : 'background:link.reading',
            )
          : ready
            ? t('background:link.ready')
            : t('background:link.failed');

    const actions: BackgroundAction[] = [];
    if (read.status === 'waiting' || read.status === 'reading') {
      actions.push({
        type: 'button',
        tone: 'secondary',
        label: t('background:link.cancel'),
        ariaLabel: t('background:link.cancelRead', { what }),
        onClick: () => linkReads.discard(read.id),
      });
    } else if (duplicate) {
      // The strip's own button opens the sheet for it, where all three are offered.
      actions.push(
        {
          type: 'button',
          tone: 'primary',
          label: t('recipes:fromLink.duplicate.open'),
          ariaLabel: t('background:link.openRecipe', { what }),
          onClick: () => {
            linkReads.discard(read.id);
            navigate(`/recipes/${read.duplicateOf}`);
          },
        },
        {
          type: 'button',
          tone: 'secondary',
          label: t('recipes:fromLink.duplicate.readAgain'),
          ariaLabel: t('background:link.readAgain', { what }),
          onClick: () => linkReads.readAgain(read.id),
        },
        {
          type: 'button',
          tone: 'secondary',
          label: t('background:link.discard'),
          ariaLabel: t('background:link.discardRead', { what }),
          onClick: () => linkReads.discard(read.id),
        },
      );
    } else if (!ready) {
      actions.push({
        type: 'button',
        tone: 'secondary',
        label: t('background:link.discard'),
        ariaLabel: t('background:link.discardRead', { what }),
        onClick: () => linkReads.discard(read.id),
      });
    }

    return {
      kind: 'link',
      id: String(read.id),
      title,
      detail:
        read.status === 'failed' ? translateApiError(t, read.error) : what,
      status: statusOf(read),
      createdAt: read.order,
      art: <LinkReadingArt size={28} />,
      open:
        ready && !duplicate
          ? {
              label: t('background:review'),
              ariaLabel: t('background:link.review', { what }),
              onClick: () => void review(read),
            }
          : undefined,
      actions,
    };
  });
}
