import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { InfoSheet } from './InfoSheet';

describe('InfoSheet focus trap', () => {
  it('ignores tabindex="-1" elements when wrapping Tab', async () => {
    renderWithProviders(<InfoSheet onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    const skipped = document.createElement('div');
    skipped.tabIndex = -1;
    dialog.appendChild(skipped);
    const buttons = dialog.querySelectorAll('button');
    const lastButton = buttons[buttons.length - 1];
    lastButton.focus();
    await userEvent.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(document.activeElement).toBe(buttons[0]);
  });
});

describe('InfoSheet mode list', () => {
  it('describes the four Scan Modes in dial order', () => {
    renderWithProviders(<InfoSheet onClose={vi.fn()} />);
    const items = within(
      screen.getByRole('dialog').querySelector('ul') as HTMLElement,
    ).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual([
      expect.stringContaining('Receipt'),
      expect.stringContaining('Product'),
      expect.stringContaining('Ingredients'),
      expect.stringContaining('Plate'),
    ]);
    // One line each, reusing the mode descriptions.
    expect(items[0]).toHaveTextContent(
      'Adds every item from your shop in one go.',
    );
    expect(items[3]).toHaveTextContent('Lists its ingredients');
  });
});
