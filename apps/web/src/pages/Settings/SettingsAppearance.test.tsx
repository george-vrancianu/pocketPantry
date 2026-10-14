import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApplyMemberTheme } from '../../components/ApplyMemberTheme';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubSystemScheme } from '../../test/viewport';
import { SettingsPage } from './SettingsPage';

type Stored = { theme: string; matchSystem: boolean };

function store(appearance: Stored) {
  localStorage.setItem('pp.appearance', JSON.stringify(appearance));
}

const stored = (): Stored =>
  JSON.parse(localStorage.getItem('pp.appearance') ?? 'null');

const rootTheme = () => document.documentElement.dataset.theme;

/** The API with this Member's saved preferences; a save echoes the merged result. */
function stubPreferences(
  saved: { locale: string | null; theme: string | null },
  /** While `online` is false, saves fail as they do offline. */
  network = { online: true },
) {
  let current = { ...saved };
  const { fetchMock, calls } = stubApi({
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    'GET /api/settings/categories': () => Response.json({ parents: [] }),
    'GET /api/auth/get-session': () => Response.json(null),
    'GET /api/settings/preferences': () => Response.json(current),
    'PUT /api/settings/preferences': () => Response.json(current),
  });
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'PUT' && !network.online) {
      calls.push({
        key: 'PUT /api/settings/preferences (failed)',
        search: '',
        body: JSON.parse(String(init.body)),
      });
      return Promise.reject(new TypeError('Failed to fetch'));
    }
    if (init?.method === 'PUT' && typeof init.body === 'string') {
      current = { ...current, ...JSON.parse(init.body) };
    }
    return fetchMock(input, init);
  });
  return calls;
}

function renderSettings() {
  return renderWithProviders(
    <>
      <ApplyMemberTheme />
      <SettingsPage />
    </>,
  );
}

const themeTiles = async () =>
  within(await screen.findByRole('radiogroup', { name: 'Appearance' }));

describe('Settings Appearance', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    vi.unstubAllGlobals();
  });

  it('offers the three Themes as a radiogroup with the chosen one checked', async () => {
    stubSystemScheme(false);
    store({ theme: 'minimal', matchSystem: false });
    stubPreferences({ locale: null, theme: 'minimal' });
    renderSettings();

    const tiles = await themeTiles();
    expect(tiles.getAllByRole('radio').map((r) => r.textContent)).toEqual([
      'Warm editorial',
      'Minimal crisp',
      'Dark-first',
    ]);
    expect(tiles.getByRole('radio', { name: 'Minimal crisp' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      tiles.getByRole('radio', { name: 'Warm editorial' }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('applies a chosen Theme at once, stores it on the device and saves it on the Member', async () => {
    stubSystemScheme(false);
    store({ theme: 'warm', matchSystem: false });
    const calls = stubPreferences({ locale: 'en', theme: null });
    renderSettings();

    await userEvent.click(
      (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
    );

    expect(rootTheme()).toBe('minimal');
    expect(stored()).toEqual({ theme: 'minimal', matchSystem: false });
    await vi.waitFor(() =>
      expect(calls).toContainEqual(
        expect.objectContaining({
          key: 'PUT /api/settings/preferences',
          body: { theme: 'minimal' },
        }),
      ),
    );
    expect(
      (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it.each([
    { theme: 'minimal', matchSystem: false, systemDark: true, root: 'minimal' },
    { theme: 'dark', matchSystem: false, systemDark: false, root: 'dark' },
    { theme: 'minimal', matchSystem: true, systemDark: true, root: 'dark' },
    { theme: 'minimal', matchSystem: true, systemDark: false, root: 'minimal' },
    { theme: 'dark', matchSystem: true, systemDark: false, root: 'warm' },
    { theme: 'dark', matchSystem: true, systemDark: true, root: 'dark' },
  ])(
    'chosen $theme with Match system $matchSystem in system dark $systemDark resolves to $root',
    async ({ theme, matchSystem, systemDark, root }) => {
      stubSystemScheme(systemDark);
      store({ theme: 'warm', matchSystem: !matchSystem });
      stubPreferences({ locale: null, theme: 'warm' });
      renderSettings();

      await userEvent.click(
        screen.getByRole('switch', { name: 'Match system' }),
      );
      await userEvent.click(
        (await themeTiles()).getByRole('radio', {
          name: { minimal: 'Minimal crisp', dark: 'Dark-first' }[theme],
        }),
      );

      expect(rootTheme()).toBe(root);
      expect(stored()).toEqual({ theme, matchSystem });
    },
  );

  it('keeps showing the chosen light Theme with Match system on, and marks Dark-first as used in dark mode', async () => {
    stubSystemScheme(true);
    store({ theme: 'minimal', matchSystem: false });
    stubPreferences({ locale: null, theme: 'minimal' });
    renderSettings();

    const tiles = await themeTiles();
    expect(screen.queryByText('Used in dark mode')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch', { name: 'Match system' }));

    expect(rootTheme()).toBe('dark');
    expect(tiles.getByRole('radio', { name: 'Minimal crisp' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    const dark = tiles.getByRole('radio', { name: 'Dark-first' });
    expect(dark).toHaveAccessibleDescription('Used in dark mode');
    // The tile itself carries the note (spec #243: the Dark-first tile reads it).
    expect(dark).toContainElement(screen.getByText('Used in dark mode'));
  });

  it('keeps Match system on the device: toggling it saves nothing on the Member', async () => {
    stubSystemScheme(false);
    store({ theme: 'warm', matchSystem: true });
    const calls = stubPreferences({ locale: null, theme: 'warm' });
    renderSettings();

    const toggle = await screen.findByRole('switch', { name: 'Match system' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAccessibleDescription(
      'Dark-first when the phone is in dark mode, your light theme otherwise',
    );
    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(stored()).toEqual({ theme: 'warm', matchSystem: false });
    expect(calls.map((c) => c.key)).not.toContain(
      'PUT /api/settings/preferences',
    );
  });

  it('follows a system dark/light change while open, with Match system on', async () => {
    const system = stubSystemScheme(false);
    store({ theme: 'minimal', matchSystem: true });
    stubPreferences({ locale: null, theme: 'minimal' });
    renderSettings();
    await themeTiles();
    expect(rootTheme()).toBe('minimal');

    act(() => system.setDark(true));
    expect(rootTheme()).toBe('dark');
    act(() => system.setDark(false));
    expect(rootTheme()).toBe('minimal');
  });

  it('moves between Themes with the arrow keys, applying each', async () => {
    stubSystemScheme(false);
    store({ theme: 'warm', matchSystem: false });
    const calls = stubPreferences({ locale: null, theme: 'warm' });
    renderSettings();

    const tiles = await themeTiles();
    const warm = tiles.getByRole('radio', { name: 'Warm editorial' });
    expect(warm).toHaveAttribute('tabindex', '0');
    expect(tiles.getByRole('radio', { name: 'Dark-first' })).toHaveAttribute(
      'tabindex',
      '-1',
    );

    warm.focus();
    await userEvent.keyboard('{ArrowRight}');
    const minimal = tiles.getByRole('radio', { name: 'Minimal crisp' });
    expect(minimal).toHaveFocus();
    expect(minimal).toHaveAttribute('aria-checked', 'true');
    expect(rootTheme()).toBe('minimal');

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    const dark = tiles.getByRole('radio', { name: 'Dark-first' });
    expect(dark).toHaveFocus();
    expect(rootTheme()).toBe('dark');
    await vi.waitFor(() =>
      expect(calls).toContainEqual(
        expect.objectContaining({ body: { theme: 'dark' } }),
      ),
    );
  });

  it('applies each Theme of an arrow-key burst at once but saves only the latest after the save in flight', async () => {
    stubSystemScheme(false);
    store({ theme: 'warm', matchSystem: false });
    const calls = stubPreferences({ locale: null, theme: 'warm' });
    const stubbed = globalThis.fetch;
    const held: Array<() => void> = [];
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method !== 'PUT') return stubbed(input, init);
      return new Promise<Response>((resolve) => {
        held.push(() => resolve(stubbed(input, init)));
      });
    });
    renderSettings();
    const saved = () =>
      calls
        .filter((c) => c.key === 'PUT /api/settings/preferences')
        .map((c) => c.body);

    const tiles = await themeTiles();
    tiles.getByRole('radio', { name: 'Warm editorial' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(rootTheme()).toBe('minimal');
    await userEvent.keyboard('{ArrowRight}');
    expect(rootTheme()).toBe('dark');
    await userEvent.keyboard('{ArrowLeft}');
    expect(rootTheme()).toBe('minimal');
    await userEvent.keyboard('{ArrowRight}');
    expect(rootTheme()).toBe('dark');

    await vi.waitFor(() => expect(held).toHaveLength(1));
    held[0]();
    await vi.waitFor(() => expect(held).toHaveLength(2));
    held[1]();
    await vi.waitFor(() =>
      expect(saved()).toEqual([{ theme: 'minimal' }, { theme: 'dark' }]),
    );
    expect(rootTheme()).toBe('dark');
  });

  it('applies a different Theme saved on the Member when preferences load', async () => {
    stubSystemScheme(false);
    store({ theme: 'warm', matchSystem: false });
    stubPreferences({ locale: null, theme: 'minimal' });
    renderSettings();

    await vi.waitFor(() => expect(rootTheme()).toBe('minimal'));
    expect(stored()).toEqual({ theme: 'minimal', matchSystem: false });
  });

  it('falls back to the default Theme when the Member never chose one', async () => {
    stubSystemScheme(false);
    store({ theme: 'minimal', matchSystem: false });
    stubPreferences({ locale: null, theme: null });
    renderSettings();

    await vi.waitFor(() => expect(rootTheme()).toBe('warm'));
    expect(stored()).toEqual({ theme: 'warm', matchSystem: false });
  });

  describe('a Theme chosen offline or before preferences load', () => {
    const saves = (calls: Array<{ key: string; body: unknown }>) =>
      calls.filter((c) => c.key === 'PUT /api/settings/preferences');

    it('keeps an unsaved device choice over the server value on the next load, and re-sends it', async () => {
      stubSystemScheme(false);
      store({ theme: 'warm', matchSystem: false });
      const network = { online: false };
      const calls = stubPreferences({ locale: null, theme: 'warm' }, network);
      const { unmount } = renderSettings();

      await userEvent.click(
        (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
      );
      await vi.waitFor(() =>
        expect(calls.map((c) => c.key)).toContain(
          'PUT /api/settings/preferences (failed)',
        ),
      );
      expect(rootTheme()).toBe('minimal');
      unmount();
      network.online = true;

      // The next load: the server still says Warm, but the device's unsynced choice wins and is re-sent.
      renderSettings();
      await themeTiles();
      await vi.waitFor(() =>
        expect(saves(calls)).toEqual([
          expect.objectContaining({ body: { theme: 'minimal' } }),
        ]),
      );
      expect(rootTheme()).toBe('minimal');
      expect(stored()).toEqual({ theme: 'minimal', matchSystem: false });
    });

    it('re-sends a failed save when the device comes back online, and then follows the server again', async () => {
      stubSystemScheme(false);
      store({ theme: 'warm', matchSystem: false });
      const network = { online: false };
      const calls = stubPreferences({ locale: null, theme: 'warm' }, network);
      const { unmount } = renderSettings();
      await userEvent.click(
        (await themeTiles()).getByRole('radio', { name: 'Dark-first' }),
      );
      await vi.waitFor(() =>
        expect(calls.map((c) => c.key)).toContain(
          'PUT /api/settings/preferences (failed)',
        ),
      );
      // Let any retry from the preferences read settle while still offline.
      await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
      expect(saves(calls)).toEqual([]);

      network.online = true;
      act(() => {
        window.dispatchEvent(new Event('online'));
      });
      await vi.waitFor(() =>
        expect(saves(calls)).toEqual([
          expect.objectContaining({ body: { theme: 'dark' } }),
        ]),
      );
      unmount();

      // Synced, so the Member's Theme from another device applies on the next load.
      stubPreferences({ locale: null, theme: 'minimal' });
      renderSettings();
      await vi.waitFor(() => expect(rootTheme()).toBe('minimal'));
    });

    it('keeps a Theme chosen before preferences load when they arrive with the old value', async () => {
      stubSystemScheme(false);
      store({ theme: 'warm', matchSystem: false });
      const calls = stubPreferences({ locale: null, theme: 'warm' });
      const stubbed = globalThis.fetch;
      let loadPreferences = () => {};
      vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
        const read =
          String(input).endsWith('/api/settings/preferences') &&
          (init?.method ?? 'GET') === 'GET';
        if (!read) return stubbed(input, init);
        // Answers with what the server held before the save below.
        return new Promise<Response>((resolve) => {
          loadPreferences = () =>
            resolve(Response.json({ locale: null, theme: 'warm' }));
        });
      });
      renderSettings();

      await userEvent.click(
        (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
      );
      await vi.waitFor(() => expect(saves(calls)).toHaveLength(1));
      await act(async () => {
        loadPreferences();
        // React Query hands the result to observers on a timer.
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(rootTheme()).toBe('minimal');
      expect(stored()).toEqual({ theme: 'minimal', matchSystem: false });
    });
  });
});
