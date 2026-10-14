import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes, useLocation } from 'react-router-dom';
import { unmatchedQueueQueryKey } from '../../lib/unmatched';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubSystemScheme } from '../../test/viewport';
import { SettingsPage } from './SettingsPage';

type Member = { role: 'admin' | 'member'; name?: string; email?: string };

function stubYou(
  member: Member = { role: 'member' },
  saveLocale: { ok: boolean } = { ok: true },
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/auth/get-session': () =>
      Response.json({
        user: {
          id: 'u1',
          name: member.name ?? 'Ana Pop',
          email: member.email ?? 'ana@example.com',
          role: member.role,
        },
      }),
    'GET /api/settings/preferences': () =>
      Response.json({ locale: null, theme: null }),
    'PUT /api/settings/preferences': (url) => {
      void url;
      return saveLocale.ok
        ? Response.json({ locale: 'ro', theme: null })
        : Response.json({ code: 'server_error', params: {} }, { status: 500 });
    },
    'POST /api/auth/sign-out': () => Response.json({ success: true }),
    'GET /api/admin/unmatched': () =>
      Response.json({ entries: [], nextCursor: null }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

/** Shows where the router is, so a test can see the redirect after sign-out. */
function Where() {
  const location = useLocation();
  return (
    <>
      <output data-testid="location">{location.pathname}</output>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/sign-in" element={<p>Sign in page</p>} />
      </Routes>
    </>
  );
}

describe('Settings You tab', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Language', () => {
    it('shows each language in its own name', async () => {
      stubSystemScheme(false);
      stubYou();
      renderWithProviders(<SettingsPage />, { route: '/settings' });

      const control = await screen.findByRole('group', { name: 'Language' });
      expect(
        within(control).getByRole('button', { name: 'English' }),
      ).toBeInTheDocument();
      expect(
        within(control).getByRole('button', { name: 'Română' }),
      ).toBeInTheDocument();
      expect(
        within(control).getByRole('button', { name: 'Dansk' }),
      ).toBeInTheDocument();
    });

    it('marks each language name with its own language', async () => {
      stubSystemScheme(false);
      stubYou();
      renderWithProviders(<SettingsPage />, { route: '/settings' });

      const control = await screen.findByRole('group', { name: 'Language' });
      expect(
        within(control).getByRole('button', { name: 'Română' }),
      ).toHaveAttribute('lang', 'ro');
      expect(
        within(control).getByRole('button', { name: 'Dansk' }),
      ).toHaveAttribute('lang', 'da');
    });

    it('saves at once and shows "Language saved" in the new language', async () => {
      stubSystemScheme(false);
      const calls = stubYou();
      renderWithProviders(<SettingsPage />, { route: '/settings' });

      await userEvent.click(
        await screen.findByRole('button', { name: 'Română' }),
      );

      await vi.waitFor(() =>
        expect(calls).toContainEqual(
          expect.objectContaining({
            key: 'PUT /api/settings/preferences',
            body: { locale: 'ro' },
          }),
        ),
      );
      expect(
        await screen.findByText('Limba a fost salvată'),
      ).toBeInTheDocument();
    });

    it('shows an error under the control when the language save fails', async () => {
      stubSystemScheme(false);
      stubYou({ role: 'member' }, { ok: false });
      renderWithProviders(<SettingsPage />, { route: '/settings' });

      await userEvent.click(
        await screen.findByRole('button', { name: 'Dansk' }),
      );

      expect(
        await screen.findByText('Dit sprog kunne ikke gemmes. Prøv igen.'),
      ).toBeInTheDocument();
    });
  });

  describe('Catalog', () => {
    it('is absent for a member', async () => {
      stubSystemScheme(false);
      stubYou({ role: 'member' });
      renderWithProviders(<SettingsPage />, { route: '/settings' });

      await screen.findByRole('heading', { name: 'Account' });
      expect(screen.queryByRole('region', { name: 'Catalog' })).toBeNull();
    });

    it('links to the admin catalog page and shows the Admins scope', async () => {
      stubSystemScheme(false);
      stubYou({ role: 'admin' });
      renderWithProviders(<SettingsPage />, { route: '/settings' });

      const region = await screen.findByRole('region', { name: 'Catalog' });
      expect(
        within(region).getByRole('link', { name: /curate the catalog/i }),
      ).toHaveAttribute('href', '/admin');
      expect(within(region).getByText('Admins')).toBeInTheDocument();
    });

    it('shows no unmatched count when the queue has not loaded, and makes no request for it', async () => {
      stubSystemScheme(false);
      const calls = stubYou({ role: 'admin' });
      renderWithProviders(<SettingsPage />, { route: '/settings' });

      const region = await screen.findByRole('region', { name: 'Catalog' });
      expect(within(region).queryByText(/unmatched/)).toBeNull();
      expect(calls.map((c) => c.key)).not.toContain('GET /api/admin/unmatched');
    });

    it('shows the unmatched count when the open queue is already loaded', async () => {
      stubSystemScheme(false);
      stubYou({ role: 'admin' });
      const { queryClient } = renderWithProviders(<SettingsPage />, {
        route: '/settings',
      });
      queryClient.setQueryData(unmatchedQueueQueryKey('open'), {
        pages: [
          {
            entries: [{ normalizedName: 'a' }, { normalizedName: 'b' }],
            nextCursor: null,
          },
        ],
        pageParams: [undefined],
      });

      const region = await screen.findByRole('region', { name: 'Catalog' });
      expect(
        await within(region).findByText('2 unmatched names waiting'),
      ).toBeInTheDocument();
    });
  });

  describe('Account', () => {
    it('shows the avatar initials, name and email', async () => {
      stubSystemScheme(false);
      stubYou({ role: 'member', name: 'Ana Pop', email: 'ana@example.com' });
      renderWithProviders(<SettingsPage />, { route: '/settings' });

      const region = await screen.findByRole('region', { name: 'Account' });
      expect(await within(region).findByText('AP')).toBeInTheDocument();
      expect(within(region).getByText('Ana Pop')).toBeInTheDocument();
      expect(within(region).getByText('ana@example.com')).toBeInTheDocument();
    });

    it('asks for an inline confirm before signing out, with Cancel', async () => {
      stubSystemScheme(false);
      const calls = stubYou();
      renderWithProviders(<Where />, { route: '/settings' });

      await userEvent.click(
        await screen.findByRole('button', { name: 'Sign out' }),
      );
      expect(screen.getByText('Sign out of this phone?')).toBeInTheDocument();
      expect(calls.map((c) => c.key)).not.toContain('POST /api/auth/sign-out');

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByText('Sign out of this phone?')).toBeNull();
      expect(calls.map((c) => c.key)).not.toContain('POST /api/auth/sign-out');
    });

    it('signs out on confirm and replaces history to the sign-in page', async () => {
      stubSystemScheme(false);
      const calls = stubYou();
      renderWithProviders(<Where />, { route: '/settings' });

      await userEvent.click(
        await screen.findByRole('button', { name: 'Sign out' }),
      );
      await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

      await vi.waitFor(() =>
        expect(calls.map((c) => c.key)).toContain('POST /api/auth/sign-out'),
      );
      expect(await screen.findByText('Sign in page')).toBeInTheDocument();
      expect(screen.getByTestId('location').textContent).toBe('/sign-in');
    });
  });
});
