import { ListRow, ListRowItem } from '@pocket-pantry/ui';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';

describe('ListRow', () => {
  it('renders each slot inside its list item', () => {
    renderWithProviders(
      <ul>
        <ListRowItem>
          <ListRow
            leading={<span>tick</span>}
            title="Milk"
            meta="2 l"
            tags={<span>new</span>}
            trailing={<button type="button">star</button>}
            below={<p>fields</p>}
          />
        </ListRowItem>
      </ul>,
    );
    const row = screen.getByRole('listitem');
    for (const text of ['tick', 'Milk', '2 l', 'new', 'fields']) {
      expect(within(row).getByText(text)).toBeInTheDocument();
    }
    expect(within(row).getByRole('button', { name: 'star' })).toBeVisible();
  });

  it('renders without optional slots', () => {
    renderWithProviders(
      <ul>
        <ListRowItem>
          <ListRow title="Milk" />
        </ListRowItem>
      </ul>,
    );
    expect(screen.getByRole('listitem')).toHaveTextContent('Milk');
  });

  it('lets the caller wrap the main area in a button spanning the row height', () => {
    renderWithProviders(
      <ul>
        <ListRowItem>
          <ListRow
            title="Milk"
            meta="2 l"
            wrapMain={(main) => <button type="button">{main}</button>}
            trailing={<span>end</span>}
          />
        </ListRowItem>
      </ul>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Milk');
    expect(button).toHaveTextContent('2 l');
    expect(button).not.toHaveTextContent('end');
    const line = button.parentElement as HTMLElement;
    expect(getComputedStyle(line).alignItems).toBe('stretch');
    expect(getComputedStyle(line).minHeight).toBe('56px');
  });
});
