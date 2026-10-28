import { screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const floor = vi.hoisted(() => vi.fn());
vi.mock('@pocket-pantry/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@pocket-pantry/ui')>()),
  // Records each registration and its release, as the real hook does.
  useToastFloor: (bottom: number | string | null) =>
    useEffect(() => {
      if (bottom === null) return;
      floor(bottom);
      return () => floor(null);
    }, [bottom]),
}));
import { linkReads } from '../../lib/linkReads';
import { renderWithProviders } from '../../test/render';
import { BackgroundHost } from './BackgroundHost';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  floor.mockClear();
});

const holdARead = () => {
  vi.stubGlobal('fetch', () => new Promise<Response>(() => {}));
  linkReads.submit({ kind: 'link', url: 'https://example.com/soup' }, 'source');
};

describe('BackgroundHost link reads', () => {
  it('leaves link reads to a host that asks for them (the Intro hosts Voice Notes only)', () => {
    holdARead();
    renderWithProviders(<BackgroundHost />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText(/recipe link/i)).not.toBeInTheDocument();
  });

  it('shows them when the host asks', () => {
    holdARead();
    renderWithProviders(<BackgroundHost linkReads />);
    expect(screen.getByText(/Reading a recipe link/)).toBeInTheDocument();
  });
});

describe('BackgroundHost toast floor', () => {
  it('registers the strip top edge while it is up and clears it when it goes', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: window.innerHeight - 66,
    } as DOMRect);
    holdARead();
    const { unmount } = renderWithProviders(<BackgroundHost linkReads />);
    expect(floor).toHaveBeenLastCalledWith(66);
    unmount();
    expect(floor).toHaveBeenLastCalledWith(null);
  });

  it('registers no floor with nothing in the background', () => {
    renderWithProviders(<BackgroundHost />);
    expect(floor).not.toHaveBeenCalledWith(expect.any(Number));
  });
});
