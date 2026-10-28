import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TagChip } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

describe('TagChip', () => {
  afterEach(cleanup);

  const paint = (name: string) => [
    paintedColour(screen.getByText(name).parentElement!, 'background-color'),
    paintedColour(screen.getByText(name).parentElement!, 'color'),
  ];

  it('paints a Catalog Tag with the neutral chip and a Family Tag with butter', () => {
    render(
      <div data-theme="minimal">
        <TagChip kind="catalog">Dinner</TagChip>
        <TagChip kind="family">Meal prep</TagChip>
      </div>,
    );
    expect(paint('Dinner')).toEqual(['#EEF0EB', '#141614']);
    expect(paint('Meal prep')).toEqual(['#F5E1A4', '#5A4200']);
  });

  it('follows the Theme: the same Family Tag in dark is the dark butter pair', () => {
    render(
      <div data-theme="dark">
        <TagChip kind="family">Meal prep</TagChip>
      </div>,
    );
    expect(paint('Meal prep')).toEqual(['#3D3418', '#F2CF72']);
  });

  it('is 21 high and 11.5 semibold on a row, 28 high on a page', () => {
    render(
      <>
        <TagChip kind="catalog">Row</TagChip>
        <TagChip kind="catalog" size="medium">
          Page
        </TagChip>
      </>,
    );
    const row = getComputedStyle(screen.getByText('Row').parentElement!);
    expect(row.height).toBe('21px');
    expect(row.fontSize).toBe('11.5px');
    expect(row.fontWeight).toBe('600');
    expect(row.borderRadius).toBe('var(--pp-r-chip)');
    expect(
      getComputedStyle(screen.getByText('Page').parentElement!).height,
    ).toBe('28px');
  });

  it('truncates a long name with an ellipsis inside its row', () => {
    render(
      <TagChip kind="catalog">A very long Tag name that cannot fit</TagChip>,
    );
    const chip = screen.getByText(
      'A very long Tag name that cannot fit',
    ).parentElement!;
    expect(getComputedStyle(chip).maxWidth).toBe('100%');
    expect(getComputedStyle(chip).textOverflow).toBe('ellipsis');
    expect(getComputedStyle(chip).overflow).toBe('hidden');
  });

  it('marks a Tag that matches the filter with the accent tint, bold, and an inset ring', () => {
    render(
      <div data-theme="minimal">
        <TagChip kind="catalog" matched>
          Keto
        </TagChip>
      </div>,
    );
    const chip = screen.getByText('Keto').parentElement!;
    expect(getComputedStyle(chip).fontWeight).toBe('700');
    expect(getComputedStyle(chip).boxShadow).toMatch(
      /inset 0(px)? 0(px)? 0(px)? 1px/,
    );
  });
});
