import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ClockIcon, PlusIcon } from '../index';

describe('icons', () => {
  afterEach(cleanup);

  it('are decorative by default, hidden from assistive technology', () => {
    const { container } = render(<PlusIcon />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('draw the handoff glyph in currentColor on its 24 px grid with a 2 px round stroke', () => {
    const { container } = render(<PlusIcon />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke-width')).toBe('2');
    expect(svg.getAttribute('stroke-linecap')).toBe('round');
    expect(svg.getAttribute('stroke-linejoin')).toBe('round');
    expect(svg.querySelector('path')!.getAttribute('d')).toBe(
      'M12 5v14M5 12h14',
    );
  });

  it('expose a given title as their accessible name', () => {
    render(<PlusIcon title="Add" />);
    const svg = screen.getByRole('img', { name: 'Add' });
    expect(svg.getAttribute('aria-hidden')).toBeNull();
  });

  it('give icons still drawn by lucide the same accessibility and stroke', () => {
    const { container } = render(<ClockIcon />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('stroke-width')).toBe('2');
    cleanup();

    render(<ClockIcon title="Expires soon" />);
    expect(screen.getByRole('img', { name: 'Expires soon' })).toBeTruthy();
  });

  it('let the call site set size and stroke', () => {
    const { container } = render(<PlusIcon size={16} strokeWidth={2.4} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('stroke-width')).toBe('2.4');
  });
});
