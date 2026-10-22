import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PageLayout } from '../index';

describe('PageLayout', () => {
  afterEach(cleanup);

  const bottom = (container: HTMLElement) =>
    getComputedStyle(container.firstElementChild as HTMLElement).paddingBottom;

  it('clears the Dock and the capsule above it by default', () => {
    const { container } = render(<PageLayout>Page</PageLayout>);
    expect(bottom(container)).toBe('132px');
  });

  it('reserves the given clearance instead when a row hangs above the Dock', () => {
    const { container } = render(
      <PageLayout dockClearance="calc(200px + env(safe-area-inset-bottom, 0px))">
        Page
      </PageLayout>,
    );
    expect(bottom(container)).toContain('200px');
    expect(bottom(container)).toContain('safe-area-inset-bottom');
  });

  it('reserves little room without the Dock', () => {
    const { container } = render(
      <PageLayout withDock={false}>Page</PageLayout>,
    );
    expect(bottom(container)).toBe('24px');
  });
});
