import { screen } from '@testing-library/react';
import { expect, vi } from 'vitest';

/** The To review result message, found by what it says: an open sheet has live regions of its own. */
export async function resultNotice(
  text: string | RegExp,
): Promise<HTMLElement> {
  const region = (await screen.findByText(text)).closest('[role="status"]');
  if (!(region instanceof HTMLElement)) throw new Error('no status region');
  return region;
}

/** Opening a sheet moves focus into it: the dialog of this name holds the focused element. */
export async function expectFocusInDialog(name: string): Promise<void> {
  await vi.waitFor(() => {
    const dialog = screen.getByRole('dialog', { name });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });
}
