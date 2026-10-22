import { screen, waitFor, within } from '@testing-library/react';
import {
  resetVoiceEnvironment,
  stubVoiceFetch,
  talkButton,
} from '../test/voice';
import { pressDown } from '../test/voiceHold';
import { VOICE_LAYER } from '../lib/voicePlacement';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { paintedColour } from '@pocket-pantry/ui/test/colour';
import { renderWithProviders, stubApi } from '../test/render';
import { AppLayout } from './AppLayout';

function renderAt(route: string) {
  return renderAtView(route);
}

function renderAtView(route: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<p>home</p>} />
        <Route path="/customise" element={<p>customise</p>} />
        <Route path="/scan" element={<p>camera</p>} />
        <Route path="/pantry" element={<p>pantry</p>} />
        <Route path="/recipes" element={<p>recipes</p>} />
        <Route path="/shopping" element={<p>shopping</p>} />
        <Route path="/shopping/staples" element={<p>staples</p>} />
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

  it('shows no Dock on /customise', () => {
    renderAt('/customise');
    expect(screen.getByText('customise')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows five slots: Home, Shopping, the camera, Pantry and Recipes, in that order', () => {
    renderAt('/recipes');
    const dock = within(screen.getByRole('navigation'));
    expect(
      dock.getAllByRole('link').map((l) => l.getAttribute('href')),
    ).toEqual(['/', '/shopping', '/scan', '/pantry', '/recipes']);
    expect(dock.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(dock.queryByRole('link', { name: 'Scan' })).toBeNull();
  });

  it.each([
    ['/', 'Home'],
    ['/shopping', 'Shopping'],
    ['/pantry', 'Pantry'],
    ['/recipes', 'Recipes'],
  ])('announces the current page on %s as %s', (route, name) => {
    renderAt(route);
    const current = screen
      .getAllByRole('link', { current: 'page' })
      .map((l) => l.textContent);
    expect(current).toEqual([name]);
  });

  it('highlights the section tab on its nested screens', () => {
    renderAt('/shopping/staples');
    // Staples sits under the Shopping section.
    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent(
      'Shopping',
    );
  });

  it('opens the camera from the camera half', () => {
    renderAt('/recipes');
    expect(screen.getByRole('link', { name: 'Camera' })).toHaveAttribute(
      'href',
      '/scan',
    );
  });

  it('leaves 132px at the bottom of every page for the Dock and its capsule', () => {
    const bottomPadding = () =>
      getComputedStyle(screen.getByRole('main').parentElement as HTMLElement)
        .paddingBottom;
    const { unmount } = renderAtView('/pantry');
    expect(bottomPadding()).toBe('132px');
    unmount();
    renderAtView('/recipes');
    expect(bottomPadding()).toBe('132px');
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

  it.each(['/recipes', '/scan', '/customise', '/shopping/staples'])(
    'shows no mic on %s, once the voice config has loaded',
    async (route) => {
      const { queryClient } = renderAt(route);
      await waitFor(() =>
        expect(queryClient.getQueryState(['voice', 'config'])?.status).toBe(
          'success',
        ),
      );
      expect(
        screen.queryByRole('button', { name: /hold to record a voice note/i }),
      ).toBeNull();
    },
  );

  it.each(['/shopping', '/pantry'])(
    'puts the mic in the Dock, under the camera, on %s',
    async (route) => {
      renderAt(route);
      const mic = await talkButton();
      const dock = screen.getByRole('navigation');
      expect(dock).toContainElement(mic);
      const camera = within(dock).getByRole('link', { name: 'Camera' });
      expect(
        camera.compareDocumentPosition(mic) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    },
  );

  it('lifts the Dock above the scrim while the mic is held, so the mic is not dimmed', async () => {
    renderAt('/shopping');
    const dock = screen.getByRole('navigation');
    expect(getComputedStyle(dock).zIndex).toBe('10');
    pressDown(await talkButton());
    await screen.findByText('Listening');
    expect(Number(getComputedStyle(dock).zIndex)).toBeGreaterThan(
      VOICE_LAYER.scrim,
    );
  });

  it('keeps the camera, with no mic, where the Dock has no Default List', async () => {
    const { queryClient } = renderAt('/recipes');
    await waitFor(() =>
      expect(queryClient.getQueryState(['voice', 'config'])?.status).toBe(
        'success',
      ),
    );
    expect(screen.getByRole('link', { name: 'Camera' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /hold to record a voice note/i }),
    ).toBeNull();
  });
});

describe('AppLayout Dock when voice is not configured', () => {
  beforeEach(() => {
    resetVoiceEnvironment();
    const { fetchMock } = stubApi({
      'GET /api/voice/config': () => Response.json({ configured: false }),
    });
    stubVoiceFetch(fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['/shopping', '/pantry'])(
    'shows only the camera on %s',
    async (route) => {
      const { queryClient } = renderAt(route);
      await waitFor(() =>
        expect(queryClient.getQueryState(['voice', 'config'])?.status).toBe(
          'success',
        ),
      );
      expect(screen.getByRole('link', { name: 'Camera' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /hold to record a voice note/i }),
      ).toBeNull();
    },
  );
});
