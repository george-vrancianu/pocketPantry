import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CompactAllergyWarning } from '../lib/recipes';
import { renderWithProviders } from '../test/render';
import { AllergenIndicator } from './AllergenIndicator';

const warning = (
  over: Partial<CompactAllergyWarning>,
): CompactAllergyWarning => ({
  severity: 'strong',
  allergens: [],
  uncheckedCount: 0,
  ...over,
});

describe('AllergenIndicator', () => {
  it('names required Allergens first, then optional ones, then the Unchecked lines', () => {
    renderWithProviders(
      <AllergenIndicator
        warning={warning({
          allergens: [
            { id: 'milk', name: 'Milk', tier: 'yours', severity: 'soft' },
            { id: 'pn', name: 'Peanuts', tier: 'members', severity: 'strong' },
          ],
          uncheckedCount: 1,
        })}
      />,
    );
    const indicator = screen.getByRole('img');
    expect(indicator).toHaveAccessibleName(
      "Contains Peanuts. Optional: contains Milk. 1 ingredient couldn't be checked for allergens",
    );
    expect(indicator).toHaveAttribute('data-severity', 'strong');
  });

  it('renders nothing without a warning', () => {
    renderWithProviders(<AllergenIndicator warning={null} />);
    expect(screen.queryByRole('img')).toBeNull();
  });
});
