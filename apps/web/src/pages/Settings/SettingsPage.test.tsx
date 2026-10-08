import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CategoryOptions, FamilySettings } from '../../lib/settings';
import { renderWithProviders, stubApi } from '../../test/render';
import { ApplyMemberLocale } from '../../components/ApplyMemberLocale';
import { SettingsPage } from './SettingsPage';

const categories: CategoryOptions = {
  parents: [
    {
      id: 'dairy',
      name: 'Dairy',
      leaves: [{ id: 'hard-cheese', name: 'Hard cheese' }],
    },
  ],
};

function stubSettings(
  family: FamilySettings,
  savedLocale: string | null = null,
  role = 'member',
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/settings/family': () => Response.json(family),
    'GET /api/settings/categories': () => Response.json(categories),
    'PATCH /api/settings/family': () => Response.json({}),
    'PUT /api/settings/family/expiry-overrides/hard-cheese': () =>
      Response.json({}),
    'DELETE /api/settings/family/expiry-overrides/hard-cheese': () =>
      Response.json({}),
    'PUT /api/settings/preferences': () => Response.json({ locale: 'ro' }),
    'GET /api/settings/preferences': () =>
      Response.json({ locale: savedLocale }),
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

describe('SettingsPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows Family Settings and Member Preferences in English', async () => {
    stubSettings({
      staleThresholdDays: 4,
      expiryOverrides: [
        {
          categoryId: 'hard-cheese',
          name: 'Hard cheese',
          days: 14,
        },
      ],
    });
    renderWithProviders(<SettingsPage />);

    expect(
      await screen.findByRole('heading', { name: 'Family Settings' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Member Preferences')).toBeInTheDocument();
    expect(await screen.findByLabelText('Stale Threshold (days)')).toHaveValue(
      4,
    );
    expect(await screen.findByText('Hard cheese: 14 days')).toBeInTheDocument();
  });

  it('shows the same screen in Romanian', async () => {
    stubSettings({
      staleThresholdDays: 3,
      expiryOverrides: [
        {
          categoryId: 'hard-cheese',
          name: 'Brânză tare',
          days: 1,
        },
      ],
    });
    renderWithProviders(<SettingsPage />, { locale: 'ro' });

    expect(
      await screen.findByRole('heading', { name: 'Setările familiei' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Preferințe de membru')).toBeInTheDocument();
    expect(await screen.findByLabelText('Prag de expirare (zile)')).toHaveValue(
      3,
    );
    expect(await screen.findByText('Brânză tare: 1 zi')).toBeInTheDocument();
  });

  it('saves the Stale Threshold', async () => {
    const calls = stubSettings({ staleThresholdDays: 3, expiryOverrides: [] });
    renderWithProviders(<SettingsPage />);

    const input = await screen.findByLabelText('Stale Threshold (days)');
    await screen.findByDisplayValue('3');
    await userEvent.clear(input);
    await userEvent.type(input, '5');
    await userEvent.click(
      screen.getByRole('button', { name: 'Save threshold' }),
    );

    await vi.waitFor(() =>
      expect(calls).toContainEqual(
        expect.objectContaining({
          key: 'PATCH /api/settings/family',
          body: { staleThresholdDays: 5 },
        }),
      ),
    );
  });

  it('adds and removes a Default Expiry override for a Category', async () => {
    const calls = stubSettings({
      staleThresholdDays: 3,
      expiryOverrides: [
        {
          categoryId: 'hard-cheese',
          name: 'Hard cheese',
          days: 14,
        },
      ],
    });
    renderWithProviders(<SettingsPage />);

    await userEvent.selectOptions(
      await screen.findByLabelText('Category'),
      await screen.findByRole('option', { name: 'Hard cheese' }),
    );
    await userEvent.type(screen.getByLabelText('Days until expiry'), '9');
    await userEvent.click(
      screen.getByRole('button', { name: 'Save override' }),
    );
    await vi.waitFor(() =>
      expect(calls).toContainEqual(
        expect.objectContaining({
          key: 'PUT /api/settings/family/expiry-overrides/hard-cheese',
          body: { days: 9 },
        }),
      ),
    );

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Remove override for Hard cheese',
      }),
    );
    await vi.waitFor(() =>
      expect(calls.map((c) => c.key)).toContain(
        'DELETE /api/settings/family/expiry-overrides/hard-cheese',
      ),
    );
  });

  it('saves the Member locale when the language is switched', async () => {
    const calls = stubSettings({ staleThresholdDays: 3, expiryOverrides: [] });
    renderWithProviders(<SettingsPage />);

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

  it('offers Dansk and saves da as the Member locale', async () => {
    const calls = stubSettings({ staleThresholdDays: 3, expiryOverrides: [] });
    renderWithProviders(<SettingsPage />);

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
      await screen.findByRole('heading', { name: 'Familieindstillinger' }),
    ).toBeInTheDocument();
  });

  it('applies the locale saved on the Member when the app loads', async () => {
    stubSettings({ staleThresholdDays: 3, expiryOverrides: [] }, 'ro');
    renderWithProviders(
      <>
        <ApplyMemberLocale />
        <SettingsPage />
      </>,
    );
    expect(
      await screen.findByRole('heading', { name: 'Setările familiei' }),
    ).toBeInTheDocument();
  });

  it('labels the Admin block as a Catalog region with a heading for Admins', async () => {
    stubSettings({ staleThresholdDays: 3, expiryOverrides: [] }, null, 'admin');
    renderWithProviders(<SettingsPage />);

    const heading = await screen.findByRole('heading', { name: 'Catalog' });
    const region = screen.getByRole('region', { name: 'Catalog' });
    expect(region).toContainElement(heading);
    expect(region).toContainElement(
      screen.getByRole('link', { name: /curate the catalog/i }),
    );
  });
});
