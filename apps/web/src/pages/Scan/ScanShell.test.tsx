import { tokensAsCssVariables } from '../../../../../packages/ui/src/theme/tokens';
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

describe('camera palette tokens', () => {
  it('exposes the always-dark cam-* colours as CSS variables', () => {
    const vars = tokensAsCssVariables();
    for (const name of [
      '--cam-fg',
      '--cam-dim',
      '--cam-glass',
      '--cam-glass-strong',
      '--cam-accent',
      '--cam-accent-ink',
      '--cam-warn',
    ]) {
      expect(vars[name], name).toBeTruthy();
    }
    expect(vars['--cam-accent']).toBe('#9be38f');
    expect(vars['--cam-warn']).toBe('#ffcf5a');
  });
});
