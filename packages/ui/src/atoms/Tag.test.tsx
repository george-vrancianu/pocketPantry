import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Tag } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

describe('Tag', () => {
  afterEach(cleanup);

  it("paints each tone with the Theme's pair", () => {
    render(
      <div data-theme="dark">
        <Tag tone="accent">On list</Tag>
        <Tag tone="ok">In Pantry</Tag>
        <Tag tone="soon">2 days</Tag>
        <Tag tone="urgent">Expired</Tag>
      </div>,
    );
    const pair = (name: string) => [
      paintedColour(screen.getByText(name), 'background-color'),
      paintedColour(screen.getByText(name), 'color'),
    ];
    expect(pair('On list')).toEqual(['#1F3A2A', '#A9EDBD']);
    expect(pair('In Pantry')).toEqual(['#26312A', '#B9C7BC']);
    expect(pair('2 days')).toEqual(['#3A3118', '#F2CF72']);
    expect(pair('Expired')).toEqual(['#3F241B', '#FFA27E']);
  });

  it('is an 11 px bold pill', () => {
    render(<Tag tone="ok">In Pantry</Tag>);
    const style = getComputedStyle(screen.getByText('In Pantry'));
    expect(style.fontSize).toBe('11px');
    expect(style.fontWeight).toBe('700');
    expect(style.borderRadius).toBe('999px');
  });
});
