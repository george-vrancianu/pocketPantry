import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithTheme as render } from '../test/render';
import {
  LinkReadingArt,
  PhotoReadingArt,
  ReceiptReadingArt,
} from './ReadingArt';

describe('reading art', () => {
  afterEach(cleanup);

  it.each([
    ['link', LinkReadingArt],
    ['receipt', ReceiptReadingArt],
    ['photo', PhotoReadingArt],
  ])('%s art is a decorative svg at the size asked for', (_kind, Art) => {
    const { container } = render(<Art size={32} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
    const svg = wrapper.querySelector('svg')!;
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBeNull();
    expect(container.querySelector('title')).toBeNull();
    expect(getComputedStyle(wrapper).width).toBe('32px');
  });

  it('defaults to the 44 px strip slot', () => {
    const { container } = render(<LinkReadingArt />);
    expect(getComputedStyle(container.firstElementChild!).width).toBe('44px');
  });
});
