import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { renderWithProviders, stubApi } from './test/render';

const member = () =>
  Response.json({ user: { id: '1', name: 'Ana', email: 'ana@example.com' } });

function stubSession(signedIn: boolean) {
  const { fetchMock } = stubApi({
    'GET /api/auth/get-session': () =>
      signedIn ? member() : new Response('null'),
  });
  vi.stubGlobal('fetch', fetchMock);
}

describe('App shell', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends signed-out visitors to sign in', async () => {
    stubSession(false);
    renderWithProviders(<App />, { route: '/pantry' });
    expect(
      await screen.findByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
  });

  it('shows signed-in Members the dashboard with the Dock in the handoff order', async () => {
    stubSession(true);
    renderWithProviders(<App />, { route: '/' });

    const dock = await screen.findByRole('navigation', { name: 'Main' });
    const links = within(dock).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Shopping',
      'Pantry',
      'Recipes',
      'Scan',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/shopping',
      '/pantry',
      '/recipes',
      '/scan',
    ]);
    expect(
      screen.getByRole('link', { name: 'Customise dashboard' }),
    ).toHaveAttribute('href', '/customise');
  });

  it('marks the current section in the Dock', async () => {
    stubSession(true);
    renderWithProviders(<App />, { route: '/pantry' });

    const dock = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(dock).getByRole('link', { name: 'Pantry' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('heading', { name: 'Pantry', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('has no Dock while customising the dashboard', async () => {
    stubSession(true);
    renderWithProviders(<App />, { route: '/customise' });
    expect(
      await screen.findByRole('heading', { name: 'Customise' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Main' }),
    ).not.toBeInTheDocument();
  });

  it.each(['/shopping', '/scan', '/recipes', '/settings', '/family', '/admin'])(
    'renders %s as a screen with a header',
    async (route) => {
      stubSession(true);
      renderWithProviders(<App />, { route });
      expect(
        await screen.findByRole('heading', { level: 1 }),
      ).toBeInTheDocument();
    },
  );

  it('translates the Dock when the locale is Romanian', async () => {
    stubSession(true);
    renderWithProviders(<App />, { route: '/', locale: 'ro' });
    const dock = await screen.findByRole('navigation', { name: 'Principal' });
    expect(
      within(dock).getByRole('link', { name: 'Cămară' }),
    ).toBeInTheDocument();
  });
});
