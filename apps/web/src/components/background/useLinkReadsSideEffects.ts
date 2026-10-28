import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { haptic } from '../../lib/haptic';
import { linkReads } from '../../lib/linkReads';
import { recipeDraftsListKey } from '../../lib/recipeDrafts';

/**
 * What a finished link read does whichever page the Member is on: tells the Recipe Drafts list that a
 * draft was kept (so "Drafts (N)" counts it without a refresh) and buzzes once. Mounted once, by the
 * app layout, which outlives the Dock pages and the strip.
 */
export function useLinkReadsSideEffects() {
  const queryClient = useQueryClient();
  useEffect(
    () =>
      linkReads.onDraftKept(() => {
        haptic(14);
        void queryClient.invalidateQueries({ queryKey: recipeDraftsListKey });
      }),
    [queryClient],
  );
}
