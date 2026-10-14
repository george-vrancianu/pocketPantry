import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

const options = [
  { value: 'ingredients', label: 'Ingredients' },
  { value: 'templates', label: 'Templates' },
] as const;

describe('SegmentedControl', () => {
  afterEach(cleanup);

  it('presses exactly the chosen option and reports a new choice', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Add from"
        options={[...options]}
        value="ingredients"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('group', { name: 'Add from' })).toBeTruthy();
    const pressed = (name: string) =>
      screen.getByRole('button', { name }).getAttribute('aria-pressed');
    expect(pressed('Ingredients')).toBe('true');
    expect(pressed('Templates')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    expect(onChange).toHaveBeenCalledWith('templates');
  });

  it('sits on the Theme chip track with the selected segment in seg-on', () => {
    render(
      <div data-theme="minimal">
        <SegmentedControl
          label="Add from"
          options={[...options]}
          value="ingredients"
          onChange={() => undefined}
        />
      </div>,
    );
    const track = screen.getByRole('group', { name: 'Add from' });
    expect(paintedColour(track, 'background-color')).toBe('#EEF0EB');
    expect(getComputedStyle(track).borderRadius).toBe('var(--pp-r-ctl)');
    const selected = screen.getByRole('button', { name: 'Ingredients' });
    expect(paintedColour(selected, 'background-color')).toBe('#141614');
    expect(paintedColour(selected, 'color')).toBe('#FFFFFF');
    const other = screen.getByRole('button', { name: 'Templates' });
    expect(paintedColour(other, 'color')).toBe('#6B716B');
  });
});
