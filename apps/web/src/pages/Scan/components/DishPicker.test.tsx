import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { DishPicker } from './DishPicker';

const first = [{ title: 'Pancakes', confidence: 0.7 }];
const second = [{ title: 'Crepes', confidence: 0.4 }];

function Harness() {
  const [dishes, setDishes] = useState(first);
  return (
    <>
      <button type="button" onClick={() => setDishes(second)}>
        new guesses
      </button>
      <DishPicker
        dishes={dishes}
        disabled={false}
        onPick={vi.fn()}
        onRetake={vi.fn()}
      />
    </>
  );
}

describe('DishPicker', () => {
  it('moves focus to the heading again when a new set of guesses arrives while mounted', async () => {
    renderWithProviders(<Harness />);
    const heading = screen.getByRole('heading', { name: 'Which dish is it?' });
    expect(heading).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'new guesses' }));
    expect(screen.getByRole('button', { name: /Crepes/ })).toBeInTheDocument();
    expect(heading).toHaveFocus();
  });
});
