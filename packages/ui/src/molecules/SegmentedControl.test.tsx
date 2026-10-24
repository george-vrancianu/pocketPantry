import { cleanup, fireEvent, screen, within } from '@testing-library/react';
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

  it('keeps its usual padding and minimum width without dense', () => {
    render(
      <SegmentedControl
        label="Add from"
        options={[...options]}
        value="ingredients"
        onChange={() => undefined}
      />,
    );
    const style = getComputedStyle(
      screen.getByRole('button', { name: 'Templates' }),
    );
    expect(style.paddingLeft).toBe('16px');
    expect(style.minWidth).toBe('56px');
    expect(style.fontSize).toBe('14px');
  });

  it('packs the segments tighter when dense, sharing the width by label length', () => {
    render(
      <SegmentedControl
        label="Location"
        options={[...options]}
        value="ingredients"
        onChange={() => undefined}
        fullWidth
        dense
      />,
    );
    const style = getComputedStyle(
      screen.getByRole('button', { name: 'Templates' }),
    );
    expect(style.paddingLeft).toBe('4px');
    expect(style.paddingRight).toBe('4px');
    expect(style.minWidth).toBe('0px');
    expect(style.fontSize).toBe('12px');
    expect(style.flexBasis).toBe('auto');
    expect(style.flexGrow).toBe('1');
  });

  it('draws an option icon above its label and names a shortened label in full', () => {
    render(
      <SegmentedControl
        label="Location"
        options={[
          {
            value: 'freezer',
            label: 'Congel',
            accessibleLabel: 'Congelator',
            icon: <svg data-testid="snowflake" />,
          },
          { value: 'fridge', label: 'Frigider' },
        ]}
        value="freezer"
        onChange={() => undefined}
      />,
    );
    const freezer = screen.getByRole('button', { name: 'Congelator' });
    expect(freezer.textContent).toBe('Congel');
    expect(freezer.getAttribute('aria-pressed')).toBe('true');
    expect(within(freezer).getByTestId('snowflake')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Frigider' })).toBeTruthy();
  });
});
