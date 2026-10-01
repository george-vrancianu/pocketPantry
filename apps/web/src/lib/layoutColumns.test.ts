import { describe, expect, it } from 'vitest';
import { columnsForWidth, sizesAvailableAt, widgetSpan } from './layoutColumns';

describe('columnsForWidth', () => {
  it.each([
    [390, 2],
    [599, 2],
    [600, 3],
    [768, 3],
    [899, 3],
    [900, 4],
    [1280, 4],
  ])('gives %ipx %i columns', (width, columns) => {
    expect(columnsForWidth(width)).toBe(columns);
  });
});

describe('widgetSpan', () => {
  it('spans one cell for small and two columns for wide', () => {
    expect(widgetSpan('small', 4)).toEqual({ columns: 1, rows: 1 });
    expect(widgetSpan('wide', 2)).toEqual({ columns: 2, rows: 1 });
  });

  it('spans two rows for tall only from four columns', () => {
    expect(widgetSpan('tall', 4)).toEqual({ columns: 2, rows: 2 });
    expect(widgetSpan('tall', 3)).toEqual({ columns: 2, rows: 1 });
    expect(widgetSpan('tall', 2)).toEqual({ columns: 2, rows: 1 });
  });
});

describe('sizesAvailableAt', () => {
  it('offers tall only at four columns', () => {
    const sizes = ['small', 'wide', 'tall'] as const;
    expect(sizesAvailableAt([...sizes], 4)).toEqual(['small', 'wide', 'tall']);
    expect(sizesAvailableAt([...sizes], 3)).toEqual(['small', 'wide']);
  });
});
