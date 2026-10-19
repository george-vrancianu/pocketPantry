import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PageLayout } from '../index';

describe('PageLayout', () => {
  afterEach(cleanup);

  const bottom = (container: HTMLElement) =>
    getComputedStyle(container.firstElementChild as HTMLElement).paddingBottom;

  it('clears the Dock by default', () => {
    const { container } = render(<PageLayout>Page</PageLayout>);
    expect(bottom(container)).toBe('110px');
  });

  it('leaves room for a floating control above the Dock when asked', () => {
    const { container } = render(<PageLayout floatingControl>Page</PageLayout>);
    expect(bottom(container)).toBe('190px');
  });
});
