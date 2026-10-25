/** Marks the voice button, so focus can be handed back to it. */
export const VOICE_BUTTON_ATTRIBUTE = 'data-voice-button';
/** Marks the status pill, so closing it can tell whether the Member's focus was inside. */
export const VOICE_PILL_ATTRIBUTE = 'data-voice-pill';

/** Puts focus on the voice button once the page has rendered it enabled again. */
export function focusVoiceButton() {
  setTimeout(() => {
    document.querySelector<HTMLElement>(`[${VOICE_BUTTON_ATTRIBUTE}]`)?.focus();
  }, 0);
}

/** Whether focus is on one of the status pill's buttons. */
export function isInPill() {
  return !!document.activeElement?.closest(`[${VOICE_PILL_ATTRIBUTE}]`);
}

/**
 * Call just before something in the status pill closes it: if focus is on one of the pill's buttons,
 * it would be lost with the button, so it goes back to the voice button. Focus elsewhere stays put.
 */
export function returnFocusFromPill() {
  if (isInPill()) {
    focusVoiceButton();
  }
}
