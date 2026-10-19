import { aboveDock, DOCK_HEIGHT } from '@pocket-pantry/ui';

/** Air between the Dock and the Voice Note button, px. */
const BUTTON_AIR = 8;
/** The round button's size, px. */
export const BUTTON_SIZE = 62;

/** CSS `bottom` of the Voice Note button: above the Dock (76 on phones, 84 wider) plus air. */
export const buttonBottom = {
  xs: `calc(${aboveDock(DOCK_HEIGHT.xs)} + ${BUTTON_AIR}px)`,
  md: `calc(${aboveDock(DOCK_HEIGHT.md)} + ${BUTTON_AIR}px)`,
};

/** CSS `bottom` of something sitting above the button (the Listening card, the tip). */
export const aboveButton = (gap: number) => ({
  xs: `calc(${buttonBottom.xs} + ${BUTTON_SIZE + gap}px)`,
  md: `calc(${buttonBottom.md} + ${BUTTON_SIZE + gap}px)`,
});

/** Where a toast sits so it clears the button and its chip. */
export const toastBottom = aboveButton(10);
