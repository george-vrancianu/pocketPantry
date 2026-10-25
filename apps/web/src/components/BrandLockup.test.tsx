import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandLockup } from './BrandLockup';

const motion = (container: HTMLElement) =>
  container.querySelector('img')?.getAttribute('data-motion');

describe('BrandLockup', () => {
  it('hops in on mount by default', () => {
    const { container } = render(<BrandLockup />);
    expect(motion(container)).toBe('entrance');
  });

  it('skips the entrance when asked', () => {
    const { container } = render(<BrandLockup entrance={false} />);
    expect(motion(container)).toBe('idle');
  });
});
