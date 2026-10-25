import type { MouseEvent } from 'react';

/** A primary-button click with no modifier key: the one a link should handle in-app (the others open a tab or window). */
export const isPlainClick = (event: MouseEvent<HTMLElement>) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;
