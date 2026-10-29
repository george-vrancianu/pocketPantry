import { act, screen } from '@testing-library/react';
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
import { VoiceHostProvider, VoiceHostSlot } from '../voice/VoiceHost';
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
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(66);
    holdARead();
    const { unmount } = renderWithProviders(<BackgroundHost linkReads />);
    expect(floor).toHaveBeenLastCalledWith(66);
    unmount();
    expect(floor).toHaveBeenLastCalledWith(null);
  });

  it('measures the strip from layout, not its transformed painted box', () => {
    // The entrance transform shifts the painted top edge down; layout does not see it.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: window.innerHeight - 50,
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(60);
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
      const style = real(el, pseudo);
      return new Proxy(style, {
        get: (target, key) => {
          if (key === 'bottom') return '24px';
          const value = Reflect.get(target, key, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    });
    holdARead();
    renderWithProviders(<BackgroundHost linkReads />);
    expect(floor).toHaveBeenLastCalledWith(84);
  });

  it('keeps measuring when the portal host changes from body to the slot', () => {
    // Only nodes still in the document have a layout height.
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.isConnected ? 66 : 0;
      },
    );
    holdARead();
    renderWithProviders(
      <VoiceHostProvider>
        <VoiceHostSlot />
        <BackgroundHost linkReads />
      </VoiceHostProvider>,
    );
    expect(floor).toHaveBeenLastCalledWith(66);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(floor).toHaveBeenLastCalledWith(66);
    expect(floor).not.toHaveBeenCalledWith(0);
  });

  it('observes the border box, so a thicker border re-measures', () => {
    const observe = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = vi.fn();
      },
    );
    holdARead();
    renderWithProviders(<BackgroundHost linkReads />);
    expect(observe).toHaveBeenCalledWith(expect.any(HTMLElement), {
      box: 'border-box',
    });
  });

  it('registers no floor with nothing in the background', () => {
    renderWithProviders(<BackgroundHost />);
    expect(floor).not.toHaveBeenCalledWith(expect.any(Number));
  });
});
