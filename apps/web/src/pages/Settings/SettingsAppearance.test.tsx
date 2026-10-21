import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  /** The signed-in Member; the session answers with it. */
  member: { id: string } | null = null,
) {
  let current = { ...saved };
  const { fetchMock, calls } = stubApi({
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    'GET /api/settings/categories': () => Response.json({ parents: [] }),
    'GET /api/auth/get-session': () =>
      Response.json(
        member && {
          user: { id: member.id, name: member.id, email: `${member.id}@x.io` },
        },
      ),
    'POST /api/auth/sign-out': () => Response.json({ success: true }),
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

/** Sign out is a two-step inline confirm: ask, then confirm. */
async function signOutInline() {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Sign out' }),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
}

const themeTiles = async () =>
  within(await screen.findByRole('radiogroup', { name: 'Appearance' }));

/** Lets timers (React Query hands results to observers on one) and their follow-up renders run. */
const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

describe('Settings Appearance', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
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
      'AaWarm editorial',
      'AaMinimal crisp',
      'AaDark-first',
    ]);
    expect(tiles.getByRole('radio', { name: 'Minimal crisp' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      tiles.getByRole('radio', { name: 'Warm editorial' }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it.each([
    { theme: 'minimal', matchSystem: false, systemDark: true, root: 'minimal' },
    { theme: 'dark', matchSystem: false, systemDark: false, root: 'dark' },
    { theme: 'minimal', matchSystem: true, systemDark: true, root: 'dark' },
    { theme: 'minimal', matchSystem: true, systemDark: false, root: 'minimal' },
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

  describe('the Theme and Match system rules', () => {
    it('applies a light Theme picked with Match system on in a dark phone as a toast only, changing nothing visible', async () => {
      stubSystemScheme(true);
      store({ theme: 'warm', matchSystem: true });
      stubPreferences({ locale: null, theme: 'warm' });
      renderSettings();

      await userEvent.click(
        (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
      );

      expect(
        await screen.findByText(
          'Minimal crisp shows when the phone is in light mode.',
        ),
      ).toBeInTheDocument();
      expect(rootTheme()).toBe('dark');
      expect(stored()).toEqual({ theme: 'minimal', matchSystem: true });
    });

    it('turns Match system off when Dark-first is picked with it on, and says so', async () => {
      stubSystemScheme(false);
      store({ theme: 'warm', matchSystem: true });
      const calls = stubPreferences({ locale: null, theme: 'warm' });
      renderSettings();

      await userEvent.click(
        (await themeTiles()).getByRole('radio', { name: 'Dark-first' }),
      );

      expect(
        await screen.findByText('Dark-first everywhere. Match system is off.'),
      ).toBeInTheDocument();
      expect(stored()).toEqual({ theme: 'dark', matchSystem: false });
      expect(rootTheme()).toBe('dark');
      expect(
        screen.getByRole('switch', { name: 'Match system' }),
      ).toHaveAttribute('aria-checked', 'false');
      await vi.waitFor(() =>
        expect(calls).toContainEqual(
          expect.objectContaining({ body: { theme: 'dark' } }),
        ),
      );
    });

    it('switches the Theme to Warm editorial when Match system is turned on while Dark-first is chosen', async () => {
      stubSystemScheme(false);
      store({ theme: 'dark', matchSystem: false });
      const calls = stubPreferences({ locale: null, theme: 'dark' });
      renderSettings();

      await userEvent.click(
        await screen.findByRole('switch', { name: 'Match system' }),
      );

      expect(stored()).toEqual({ theme: 'warm', matchSystem: true });
      expect(rootTheme()).toBe('warm');
      expect(
        (await themeTiles()).getByRole('radio', { name: 'Warm editorial' }),
      ).toHaveAttribute('aria-checked', 'true');
      await vi.waitFor(() =>
        expect(calls).toContainEqual(
          expect.objectContaining({ body: { theme: 'warm' } }),
        ),
      );
    });

    it('marks the light Theme in use as used in light mode while Match system is on', async () => {
      stubSystemScheme(false);
      store({ theme: 'minimal', matchSystem: true });
      stubPreferences({ locale: null, theme: 'minimal' });
      renderSettings();

      const tiles = await themeTiles();
      expect(
        tiles.getByRole('radio', { name: 'Minimal crisp' }),
      ).toHaveAccessibleDescription('Used in light mode');
    });

    it('shows a sync toast and keeps the chosen Theme on screen when the save fails', async () => {
      stubSystemScheme(false);
      store({ theme: 'warm', matchSystem: false });
      stubPreferences({ locale: null, theme: 'warm' }, { online: false });
      renderSettings();

      await userEvent.click(
        (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
      );

      expect(
        await screen.findByText(
          "Theme saved on this phone. We'll sync it when you're online.",
        ),
      ).toBeInTheDocument();
      expect(
        (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
      ).toHaveAttribute('aria-checked', 'true');
      expect(rootTheme()).toBe('minimal');
    });
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
      await advance(50);
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

    it('does not carry an unsynced Theme over to the next Member after sign-out', async () => {
      stubSystemScheme(false);
      store({ theme: 'warm', matchSystem: false });
      const network = { online: false };
      const calls = stubPreferences({ locale: null, theme: 'warm' }, network, {
        id: 'member-a',
      });
      const first = renderSettings();
      await userEvent.click(
        (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
      );
      await vi.waitFor(() =>
        expect(calls.map((c) => c.key)).toContain(
          'PUT /api/settings/preferences (failed)',
        ),
      );
      await signOutInline();
      await vi.waitFor(() =>
        expect(calls.map((c) => c.key)).toContain('POST /api/auth/sign-out'),
      );
      first.unmount();

      network.online = true;
      const second = stubPreferences({ locale: null, theme: 'dark' }, network, {
        id: 'member-b',
      });
      renderSettings();
      await vi.waitFor(() => expect(rootTheme()).toBe('dark'));
      await advance(50);
      expect(saves(second)).toEqual([]);
      expect(stored()).toEqual({ theme: 'dark', matchSystem: false });
    });

    it('ignores an unsynced Theme that another Member chose on this device', async () => {
      stubSystemScheme(false);
      store({ theme: 'minimal', matchSystem: false });
      localStorage.setItem(
        'pp.appearance.unsynced',
        JSON.stringify({ memberId: 'member-a', theme: 'minimal' }),
      );
      const calls = stubPreferences(
        { locale: null, theme: 'dark' },
        { online: true },
        { id: 'member-b' },
      );
      renderSettings();

      await vi.waitFor(() => expect(rootTheme()).toBe('dark'));
      await advance(50);
      expect(saves(calls)).toEqual([]);
    });

    it('sends a newer choice made while a failing save was in flight', async () => {
      stubSystemScheme(false);
      store({ theme: 'warm', matchSystem: false });
      const calls = stubPreferences({ locale: null, theme: 'warm' });
      const stubbed = globalThis.fetch;
      let puts = 0;
      let failFirst = () => {};
      vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method !== 'PUT') return stubbed(input, init);
        puts += 1;
        if (puts > 1) return stubbed(input, init);
        return new Promise<Response>((_, reject) => {
          failFirst = () => reject(new TypeError('Server error'));
        });
      });
      renderSettings();

      const tiles = await themeTiles();
      await userEvent.click(
        tiles.getByRole('radio', { name: 'Minimal crisp' }),
      );
      await vi.waitFor(() => expect(puts).toBe(1));
      await userEvent.click(tiles.getByRole('radio', { name: 'Dark-first' }));
      await act(async () => failFirst());

      await vi.waitFor(() =>
        expect(saves(calls)).toContainEqual(
          expect.objectContaining({ body: { theme: 'dark' } }),
        ),
      );
    });

    it('drops a save that settles after sign-out instead of writing it to the next session', async () => {
      stubSystemScheme(false);
      store({ theme: 'warm', matchSystem: false });
      const calls = stubPreferences(
        { locale: null, theme: 'warm' },
        undefined,
        {
          id: 'member-a',
        },
      );
      const stubbed = globalThis.fetch;
      let settlePut = () => {};
      vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method !== 'PUT') return stubbed(input, init);
        return new Promise<Response>((resolve) => {
          settlePut = () =>
            resolve(Response.json({ locale: 'ro', theme: 'minimal' }));
        });
      });
      const { queryClient, i18n } = renderSettings();

      await userEvent.click(
        (await themeTiles()).getByRole('radio', { name: 'Minimal crisp' }),
      );
      await signOutInline();
      await vi.waitFor(() =>
        expect(calls.map((c) => c.key)).toContain('POST /api/auth/sign-out'),
      );
      // Member B signs in on the device and picks the same Theme before A's save settles.
      localStorage.setItem(
        'pp.appearance.unsynced',
        JSON.stringify({ memberId: 'member-b', theme: 'minimal' }),
      );
      queryClient.setQueryData(['session'], {
        user: { id: 'member-b', name: 'b', email: 'b@x.io' },
      });
      await act(async () => {
        settlePut();
        await vi.advanceTimersByTimeAsync(50);
      });

      // The mounted You tab may read preferences again for the new session; A's answer is not it.
      expect(
        queryClient.getQueryData(['settings', 'preferences']),
      ).not.toMatchObject({ locale: 'ro', theme: 'minimal' });
      expect(i18n.language).not.toBe('ro');
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
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(rootTheme()).toBe('minimal');
      expect(stored()).toEqual({ theme: 'minimal', matchSystem: false });
    });
  });
});
