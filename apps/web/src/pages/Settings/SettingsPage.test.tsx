import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ApplyMemberLocale } from '../../components/ApplyMemberLocale';
import { renderWithProviders, stubApi } from '../../test/render';
import { SettingsPage } from './SettingsPage';

function stubSettings(savedLocale: string | null = null, role = 'member') {
  const { fetchMock, calls } = stubApi({
    'GET /api/settings/preferences': () =>
      Response.json({ locale: savedLocale, theme: null }),
    'PUT /api/settings/preferences': () =>
      Response.json({ locale: 'ro', theme: null }),
    'GET /api/auth/get-session': () =>
      Response.json(
        role === 'admin'
          ? { user: { id: '1', name: 'Ana', email: 'a@b.c', role } }
          : null,
      ),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

/** Shows where the router is, and lets a test go back a history entry. */
function Harness() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/settings')}>Open settings</button>
      <button onClick={() => navigate(-1)}>Go back</button>
      <output data-testid="location">
        {location.pathname}
        {location.search}
      </output>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </>
  );
}

describe('SettingsPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('opens on the You tab with Appearance first', async () => {
    stubSettings();
    renderWithProviders(<SettingsPage />, { route: '/settings' });

    expect(await screen.findByRole('tab', { name: 'You' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Family' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    const panel = screen.getByRole('tabpanel', { name: 'You' });
    expect(
      within(panel).getByRole('heading', { name: 'Appearance' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Everyone in the family shares these. Any member can change them.',
      ),
    ).toBeNull();
  });

  it('opens on the Family tab for ?tab=family', async () => {
    stubSettings();
    renderWithProviders(<SettingsPage />, { route: '/settings?tab=family' });

    expect(await screen.findByRole('tab', { name: 'Family' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const panel = screen.getByRole('tabpanel', { name: 'Family' });
    expect(
      within(panel).getByText(
        'Everyone in the family shares these. Any member can change them.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Appearance' })).toBeNull();
  });

  it('exposes the tabs as a named tablist with tab and tabpanel roles', async () => {
    stubSettings();
    renderWithProviders(<SettingsPage />, { route: '/settings' });

    const tablist = await screen.findByRole('tablist', {
      name: 'Settings sections',
    });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['You', 'Family']);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('moves between tabs with the arrow keys', async () => {
    stubSettings();
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />, { route: '/settings' });

    const you = await screen.findByRole('tab', { name: 'You' });
    you.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Family' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Family' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'You' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('replaces the history entry when switching tabs, so Back still leaves Settings', async () => {
    stubSettings();
    const user = userEvent.setup();
    renderWithProviders(<Harness />, { route: '/' });

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(await screen.findByRole('tab', { name: 'Family' }));
    expect(screen.getByTestId('location').textContent).toBe(
      '/settings?tab=family',
    );

    await user.click(screen.getByRole('button', { name: 'Go back' }));
    expect(screen.getByTestId('location').textContent).toBe('/');
  });

  it('keeps each tab at its own scroll position while the page is mounted', async () => {
    stubSettings();
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 240,
    });
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />, { route: '/settings' });

    await user.click(await screen.findByRole('tab', { name: 'Family' }));
    expect(scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ top: 0 }),
    );

    window.scrollY = 90;
    await user.click(screen.getByRole('tab', { name: 'You' }));
    expect(scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ top: 240 }),
    );

    await user.click(screen.getByRole('tab', { name: 'Family' }));
    expect(scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ top: 90 }),
    );
  });

  it('saves the Member locale when the language is switched', async () => {
    const calls = stubSettings();
    renderWithProviders(<SettingsPage />, { route: '/settings' });

    await userEvent.click(await screen.findByRole('button', { name: 'RO' }));
    await vi.waitFor(() =>
      expect(calls).toContainEqual(
        expect.objectContaining({
          key: 'PUT /api/settings/preferences',
          body: { locale: 'ro' },
        }),
      ),
    );
  });

  it('shows the tabs in Danish once Dansk is chosen', async () => {
    const calls = stubSettings();
    renderWithProviders(<SettingsPage />, { route: '/settings' });

    await userEvent.click(await screen.findByRole('button', { name: 'DA' }));
    await vi.waitFor(() =>
      expect(calls).toContainEqual(
        expect.objectContaining({
          key: 'PUT /api/settings/preferences',
          body: { locale: 'da' },
        }),
      ),
    );
    expect(
      await screen.findByRole('tab', { name: 'Familie' }),
    ).toBeInTheDocument();
  });

  it('shows the tabs in Romanian', async () => {
    stubSettings();
    renderWithProviders(<SettingsPage />, {
      route: '/settings?tab=family',
      locale: 'ro',
    });

    expect(await screen.findByRole('tab', { name: 'Familie' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByText(
        'Toți din familie împart aceste setări. Orice membru le poate schimba.',
      ),
    ).toBeInTheDocument();
  });

  it('applies the locale saved on the Member when the app loads', async () => {
    stubSettings('ro');
    renderWithProviders(
      <>
        <ApplyMemberLocale />
        <SettingsPage />
      </>,
      { route: '/settings?tab=family' },
    );
    expect(
      await screen.findByRole('tab', { name: 'Familie' }),
    ).toBeInTheDocument();
  });

  it('labels the Admin block as a Catalog region with a heading for Admins', async () => {
    stubSettings(null, 'admin');
    renderWithProviders(<SettingsPage />, { route: '/settings' });

    const heading = await screen.findByRole('heading', { name: 'Catalog' });
    const region = screen.getByRole('region', { name: 'Catalog' });
    expect(region).toContainElement(heading);
    expect(region).toContainElement(
      screen.getByRole('link', { name: /curate the catalog/i }),
    );
  });
});
