import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { paintedColour } from '../../../test/colour';
import { renderWithProviders } from '../../../test/render';
import { PantryFilters } from './PantryFilters';

/** The handoff's chip `on` pair: accent-on-tint text on the accent tint. */
const CHIP_ON = {
  warm: { text: '#4A5722', fill: '#E6EAD2' },
  minimal: { text: '#176040', fill: '#E1F2E8' },
  dark: { text: '#A9EDBD', fill: '#1F3A2A' },
} as const;

describe('PantryFilters', () => {
  it.each(Object.keys(CHIP_ON) as (keyof typeof CHIP_ON)[])(
    'paints the chosen Location chip in the %s Theme',
    (theme) => {
      localStorage.setItem(
        'pp.appearance',
        JSON.stringify({ theme, matchSystem: false }),
      );
      renderWithProviders(
        <PantryFilters
          query=""
          onQueryChange={() => {}}
          filter="fridge"
          onFilterChange={() => {}}
          counts={{ all: 3, fridge: 2, freezer: 1, cupboard: 0, spices: 0 }}
        />,
      );
      const chip = screen.getByRole('button', {
        name: /Fridge/,
        pressed: true,
      });
      expect(paintedColour(chip, 'color')).toBe(CHIP_ON[theme].text);
      expect(paintedColour(chip, 'background-color')).toBe(CHIP_ON[theme].fill);
    },
  );
});
