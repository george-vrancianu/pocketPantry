import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FieldUnit, InputAdornment, TextField } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

describe('TextField', () => {
  afterEach(cleanup);

  /** The painted field around the native input. */
  const field = (name: string) =>
    screen.getByRole('textbox', { name }).parentElement!;

  it('is a 50 high field in the Theme field colour and control radius', () => {
    render(
      <div data-theme="dark">
        <TextField label="Name" />
      </div>,
    );
    const frame = field('Name');
    expect(paintedColour(frame, 'background-color')).toBe('#111915');
    expect(getComputedStyle(frame).borderRadius).toBe('var(--pp-r-ctl)');
    expect(getComputedStyle(frame).minHeight).toBe('50px');
  });

  it('rings the focused field in the accent tint', () => {
    render(<TextField label="Name" />);
    expect(getComputedStyle(field('Name')).boxShadow).toBe('');
    fireEvent.focus(screen.getByRole('textbox', { name: 'Name' }));
    expect(getComputedStyle(field('Name')).boxShadow.toLowerCase()).toBe(
      '0 0 0 3px var(--mui-palette-pp-accenttint)',
    );
  });
});

describe('FieldUnit', () => {
  afterEach(cleanup);

  it('is a chip button inside the field', () => {
    render(
      <div data-theme="minimal">
        <TextField
          label="Amount"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <FieldUnit aria-label="Unit: kg">kg</FieldUnit>
                </InputAdornment>
              ),
            },
          }}
        />
      </div>,
    );
    const unit = screen.getByRole('button', { name: 'Unit: kg' });
    expect(paintedColour(unit, 'background-color')).toBe('#EEF0EB');
    expect(getComputedStyle(unit).borderRadius).toBe(
      'max(2px, calc(var(--pp-r-ctl) - 5px))',
    );
  });
});
