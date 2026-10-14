import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AddButton, Button } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

describe('Button', () => {
  afterEach(cleanup);

  const button = (name: string) => screen.getByRole('button', { name });

  it('fills primary with the Theme primary: olive in Warm editorial, ink-black in Minimal crisp', () => {
    render(
      <>
        <div data-theme="warm">
          <Button>Warm</Button>
        </div>
        <div data-theme="minimal">
          <Button>Minimal</Button>
        </div>
        <div data-theme="dark">
          <Button>Dark</Button>
        </div>
      </>,
    );
    expect(paintedColour(button('Warm'), 'background-color')).toBe('#5F6F2E');
    expect(paintedColour(button('Minimal'), 'background-color')).toBe(
      '#141614',
    );
    expect(paintedColour(button('Minimal'), 'color')).toBe('#FFFFFF');
    expect(paintedColour(button('Dark'), 'background-color')).toBe('#8FE0A8');
    expect(paintedColour(button('Dark'), 'color')).toBe('#0B1A10');
  });

  it('paints the handoff variants from the Theme', () => {
    render(
      <div data-theme="minimal">
        <Button variant="secondary">Secondary</Button>
        <Button variant="tonal">Tonal</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>,
    );
    expect(paintedColour(button('Secondary'), 'background-color')).toBe(
      '#FFFFFF',
    );
    expect(paintedColour(button('Tonal'), 'background-color')).toBe('#E1F2E8');
    expect(paintedColour(button('Tonal'), 'color')).toBe('#176040');
    expect(paintedColour(button('Ghost'), 'background-color')).toBe(
      'RGBA(0, 0, 0, 0)',
    );
    expect(paintedColour(button('Ghost'), 'color')).toBe('#1E7A4E');
    expect(paintedColour(button('Danger'), 'background-color')).toBe('#FDE8E2');
    expect(paintedColour(button('Danger'), 'color')).toBe('#B33A1E');
  });

  it('takes the Theme control radius, or a pill', () => {
    render(
      <div data-theme="minimal">
        <Button>Save</Button>
        <Button shape="pill">Done</Button>
      </div>,
    );
    expect(getComputedStyle(button('Save')).borderRadius).toBe(
      'var(--pp-r-ctl)',
    );
    expect(getComputedStyle(button('Done')).borderRadius).toBe('999px');
  });

  it('is 46 high, or 36 when small', () => {
    render(
      <>
        <Button>Save</Button>
        <Button size="sm">Undo</Button>
      </>,
    );
    expect(getComputedStyle(button('Save')).height).toBe('46px');
    expect(getComputedStyle(button('Undo')).height).toBe('36px');
  });

  it('fades to .45 when disabled', () => {
    render(<Button disabled>Save</Button>);
    expect(getComputedStyle(button('Save')).opacity).toBe('0.45');
  });
});

describe('AddButton', () => {
  afterEach(cleanup);

  it('is a named 52 x 52 accent button with the Theme Add-button radius', () => {
    render(
      <div data-theme="minimal">
        <AddButton aria-label="Add items" />
      </div>,
    );
    const add = screen.getByRole('button', { name: 'Add items' });
    expect(paintedColour(add, 'background-color')).toBe('#1E7A4E');
    expect(paintedColour(add, 'color')).toBe('#FFFFFF');
    expect(getComputedStyle(add).width).toBe('52px');
    expect(getComputedStyle(add).height).toBe('52px');
    expect(getComputedStyle(add).borderRadius).toBe('var(--pp-r-fab)');
  });
});
