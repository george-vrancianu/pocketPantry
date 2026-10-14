import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Sheet } from '../index';
import { paintedColour } from '../test/colour';
import { renderWithTheme as render } from '../test/render';
import { writeAppearance } from '../theme/appearance';

describe('Sheet', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('is a floating bg panel, a step rounder than the Theme card', () => {
    writeAppearance({ theme: 'dark', matchSystem: false });
    render(
      <Sheet open onClose={() => undefined} label="Add items">
        Body
      </Sheet>,
    );
    const sheet = screen.getByRole('dialog', { name: 'Add items' });
    const style = getComputedStyle(sheet);
    expect(paintedColour(sheet, 'background-color')).toBe('#0F1512');
    expect(style.boxShadow).toBe('var(--pp-shadow-float)');
    expect(style.borderRadius).toContain('var(--pp-r-card)');
  });
});
