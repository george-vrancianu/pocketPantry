import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

/** Done, then the first card once it is read: the line editor for that Scan. */
export async function openFirstScanCard() {
  await userEvent.click(await screen.findByRole('button', { name: /Done$/ }));
  const [card] = await screen.findAllByTestId('card-result');
  await userEvent.click(card);
}
