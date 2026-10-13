import { ListRow } from '@pocket-pantry/ui';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';

describe('ListRow', () => {
  it('renders each slot inside one list item', () => {
    renderWithProviders(
      <ul>
        <ListRow
          leading={<span>tick</span>}
          title="Milk"
          meta="2 l"
          tags={<span>new</span>}
          trailing={<button type="button">star</button>}
          below={<p>fields</p>}
        />
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
        <ListRow title="Milk" />
      </ul>,
    );
    expect(screen.getByRole('listitem')).toHaveTextContent('Milk');
  });

  it('lets the caller wrap the main area, e.g. in a toggle button', () => {
    renderWithProviders(
      <ul>
        <ListRow
          title="Milk"
          meta="2 l"
          wrapMain={(main) => <button type="button">{main}</button>}
          trailing={<span>end</span>}
        />
      </ul>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Milk');
    expect(button).toHaveTextContent('2 l');
    expect(button).not.toHaveTextContent('end');
  });
});
