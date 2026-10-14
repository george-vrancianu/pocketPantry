import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chip } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';

describe('Chip', () => {
  afterEach(cleanup);

  it('is a 36 high surface chip with the Theme chip radius', () => {
    render(
      <div data-theme="minimal">
        <Chip label="Eggs" onClick={() => undefined} />
      </div>,
    );
    const chip = screen.getByRole('button', { name: 'Eggs' });
    expect(paintedColour(chip, 'background-color')).toBe('#FFFFFF');
    expect(paintedColour(chip, 'color')).toBe('#141614');
    expect(getComputedStyle(chip).height).toBe('36px');
    expect(getComputedStyle(chip).borderRadius).toBe('var(--pp-r-chip)');
  });

  it('turns accent tint when on, and says it is pressed', () => {
    render(
      <div data-theme="dark">
        <Chip label="Butter" selected onClick={() => undefined} />
        <Chip label="Milk" selected={false} onClick={() => undefined} />
      </div>,
    );
    const on = screen.getByRole('button', { name: 'Butter', pressed: true });
    expect(paintedColour(on, 'background-color')).toBe('#1F3A2A');
    expect(paintedColour(on, 'color')).toBe('#A9EDBD');
    expect(
      screen.getByRole('button', { name: 'Milk', pressed: false }),
    ).toBeTruthy();
  });

  it('reads its meta after the label', () => {
    render(
      <Chip label="Weekly shop" meta="12 items" onClick={() => undefined} />,
    );
    expect(
      screen.getByRole('button', { name: 'Weekly shop 12 items' }),
    ).toBeTruthy();
  });

  it('has a separate dismiss button', () => {
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    render(
      <Chip
        label="Milk"
        onClick={onClick}
        onDismiss={onDismiss}
        dismissLabel="Remove Milk"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove Milk' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Milk' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
