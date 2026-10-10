import { fireEvent, screen } from '@testing-library/react';

/** The Scan guide, which takes a Scan on a double-tap. */
export const scanGuide = () => screen.getByTestId('scan-guide');

/** Double-tap the Scan guide, as a Member takes a Scan. */
export function scanViaGuide() {
  const pointer = {
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
  };
  for (let i = 0; i < 2; i += 1) {
    fireEvent.pointerDown(scanGuide(), pointer);
    fireEvent.pointerUp(scanGuide(), pointer);
  }
}
