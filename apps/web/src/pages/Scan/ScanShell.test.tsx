import { tokens } from '@pocket-pantry/ui';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders } from '../../test/render';
import { ScanPage } from './ScanPage';

// jsdom has no camera: the camera hook is the seam. `lifecycle` shows whether the stream was
// stopped or restarted (mount/unmount of the hook) while the Info sheet was open.
const camera = vi.hoisted(() => ({
  torchSupported: true,
  starts: 0,
  stops: 0,
}));
vi.mock('../../lib/camera', async () => {
  const { useEffect } = await import('react');
  return {
    useCamera: () => {
      useEffect(() => {
        camera.starts += 1;
        return () => {
          camera.stops += 1;
        };
      }, []);
      return {
        videoRef: { current: null },
        status: 'ready',
        torchSupported: camera.torchSupported,
        capture: () => Promise.resolve(new Blob(['frame'])),
        setTorch: () => Promise.resolve(true),
      };
    },
  };
});

function renderScan() {
  return renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
    </Routes>,
    { route: '/scan' },
  );
}

describe('Scan screen shell', () => {
  beforeEach(() => {
    clearReview();
    camera.torchSupported = true;
    camera.starts = 0;
    camera.stops = 0;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('is a full-screen, non-scrolling surface', () => {
    renderScan();
    const shell = screen.getByTestId('scan-screen');
    const style = getComputedStyle(shell);
    expect(style.position).toBe('fixed');
    expect(style.overflow).toBe('hidden');
  });

  it('stays dark in the light theme', () => {
    renderScan();
    const style = getComputedStyle(screen.getByTestId('scan-screen'));
    expect(style.backgroundColor).not.toBe('');
    // Colour comes from the camera palette, not the themed surface.
    expect(style.backgroundColor).not.toMatch(/255,\s*255,\s*255/);
  });

  it('shows the torch button next to Close when the camera has a torch', () => {
    renderScan();
    const bar = screen.getByRole('button', { name: 'Close scanner' })
      .parentElement as HTMLElement;
    expect(
      within(bar).getByRole('button', { name: 'Toggle flash' }),
    ).toBeInTheDocument();
    expect(
      within(bar).getByRole('button', { name: 'How scanning works' }),
    ).toBeInTheDocument();
  });

  it('hides the torch button when the camera has no torch', () => {
    camera.torchSupported = false;
    renderScan();
    expect(
      screen.queryByRole('button', { name: 'Toggle flash' }),
    ).not.toBeInTheDocument();
  });

  it('opens the Info sheet from Info and dismisses it on a scrim tap', async () => {
    renderScan();
    expect(
      screen.queryByRole('dialog', { name: 'Scanning your pantry' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'How scanning works' }),
    );
    expect(
      screen.getByRole('dialog', { name: 'Scanning your pantry' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('info-scrim'));
    expect(
      screen.queryByRole('dialog', { name: 'Scanning your pantry' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the camera running while the Info sheet is open', async () => {
    renderScan();
    const startsBefore = camera.starts;
    await userEvent.click(
      screen.getByRole('button', { name: 'How scanning works' }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(camera.stops).toBe(0);
    expect(camera.starts).toBe(startsBefore);
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
  });
});

describe('camera feed and overlays', () => {
  const pinned = (el: HTMLElement) => {
    const shell = screen.getByTestId('scan-screen');
    for (let n = el.parentElement; n && n !== shell; n = n.parentElement) {
      if (['absolute', 'fixed'].includes(getComputedStyle(n).position)) {
        return true;
      }
    }
    return ['absolute', 'fixed'].includes(getComputedStyle(el).position);
  };

  it('fills the screen with an aspect-filled feed behind the controls', () => {
    renderScan();
    const feed = screen.getByTestId('scan-feed');
    const style = getComputedStyle(feed);
    expect(feed.tagName).toBe('VIDEO');
    expect(feed.parentElement).toBe(screen.getByTestId('scan-screen'));
    expect(style.objectFit).toBe('cover');
    expect(style.position).toBe('absolute');
    expect(style.width).toBe('100%');
    expect(style.height).toBe('100%');
  });

  it('lays a radial vignette from transparent to 45% black over the feed', () => {
    renderScan();
    const style = getComputedStyle(screen.getByTestId('scan-vignette'));
    expect(style.backgroundImage).toContain('radial-gradient');
    expect(style.backgroundImage).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.45\)/);
    expect(style.pointerEvents).toBe('none');
  });

  it('pins the shutter and the mode dial over the feed so they stay reachable', () => {
    renderScan();
    expect(pinned(screen.getByRole('button', { name: 'Take photo' }))).toBe(
      true,
    );
    expect(pinned(screen.getByRole('radiogroup', { name: 'Scan mode' }))).toBe(
      true,
    );
  });
});

describe('Info sheet accessibility', () => {
  const infoButton = () =>
    screen.getByRole('button', { name: 'How scanning works' });

  it('keeps Tab and Shift+Tab inside the open sheet', async () => {
    renderScan();
    await userEvent.click(infoButton());
    const dialog = screen.getByRole('dialog');
    for (let i = 0; i < 4; i += 1) {
      await userEvent.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    for (let i = 0; i < 4; i += 1) {
      await userEvent.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('returns focus to the Info button when the sheet closes', async () => {
    renderScan();
    await userEvent.click(infoButton());
    await userEvent.click(screen.getByTestId('info-scrim'));
    expect(infoButton()).toHaveFocus();
  });

  it('closes on Escape even when focus is outside the sheet', async () => {
    renderScan();
    await userEvent.click(infoButton());
    (document.activeElement as HTMLElement).blur();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(infoButton()).toHaveFocus();
  });

  it('dims the camera with a 45% scrim', async () => {
    renderScan();
    await userEvent.click(infoButton());
    expect(
      getComputedStyle(screen.getByTestId('info-scrim')).backgroundColor,
    ).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.45\)/);
  });
});

describe('camera palette tokens', () => {
  it('matches the handoff section 9 values exactly', () => {
    expect(tokens.color).toMatchObject({
      camFg: '#f4f4f0',
      camDim: 'rgba(244,244,240,.62)',
      camGlass: 'rgba(20,22,20,.55)',
      camGlassStrong: 'rgba(20,22,20,.82)',
      camAccent: '#9be38f',
      camAccentInk: '#0c1a0f',
      camWarn: '#ffcf5a',
    });
  });
});
