import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import {
  resetVoiceEnvironment,
  stubVoiceFetch,
  talkButton,
} from '../test/voice';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { paintedColour } from '@pocket-pantry/ui/test/colour';
import { renderWithProviders, stubApi } from '../test/render';
import { AppLayout } from './AppLayout';

function renderAt(route: string) {
  renderAtView(route);
}

function renderAtView(route: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/scan" element={<p>camera</p>} />
        <Route path="/pantry" element={<p>pantry</p>} />
        <Route path="/recipes" element={<p>recipes</p>} />
        <Route path="/shopping" element={<p>shopping</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
});

describe('AppLayout Dock', () => {
  it('renders no Dock navigation or links behind the camera on /scan', () => {
    renderAt('/scan');
    expect(screen.getByText('camera')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('still renders the Dock on other screens', () => {
    renderAt('/pantry');
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('leaves 190px at the bottom of the Pantry for the Voice Note button, and 110px elsewhere', () => {
    const bottomPadding = () =>
      getComputedStyle(screen.getByRole('main').parentElement as HTMLElement)
        .paddingBottom;
    const { unmount } = renderAtView('/pantry');
    expect(bottomPadding()).toBe('190px');
    unmount();
    renderAtView('/recipes');
    expect(bottomPadding()).toBe('110px');
  });

  it('paints the dock and its tabs from the active Theme', () => {
    localStorage.setItem(
      'pp.appearance',
      JSON.stringify({ theme: 'dark', matchSystem: false }),
    );
    renderAt('/pantry');
    const dock = screen.getByRole('navigation');
    expect(paintedColour(dock, 'background-color')).toBe('RGBA(25,33,28,.9)');

    const active = screen.getByRole('link', { current: 'page' });
    expect(paintedColour(active, 'background-color')).toBe('#1F3A2A');
    expect(paintedColour(active, 'color')).toBe('#A9EDBD');

    const inactive = screen.getByRole('link', { name: /shopping/i });
    expect(paintedColour(inactive, 'background-color')).toBe(
      'RGBA(0, 0, 0, 0)',
    );
    expect(paintedColour(inactive, 'color')).toBe('#97A69B');
  });
});

describe('AppLayout Voice Note host', () => {
  beforeEach(() => {
    resetVoiceEnvironment();
    const { fetchMock } = stubApi({
      'GET /api/voice/config': () => Response.json({ configured: true }),
    });
    stubVoiceFetch(fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['/shopping', '/pantry'])(
    'shows the mic once on %s',
    async (route) => {
      renderAt(route);
      expect(await talkButton()).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: /hold to record a voice note/i }),
      ).toHaveLength(1);
    },
  );

  it('shows no mic on other screens', async () => {
    renderAt('/recipes');
    expect(await screen.findByText('recipes')).toBeInTheDocument();
    await Promise.resolve();
    expect(
      screen.queryByRole('button', { name: /hold to record a voice note/i }),
    ).toBeNull();
  });
});
