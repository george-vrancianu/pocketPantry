import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { DashboardPage } from './DashboardPage';

afterEach(() => vi.unstubAllGlobals());

function stub(layout: unknown) {
  const { fetchMock } = stubApi({
    'GET /api/dashboard-layout': () => Response.json(layout),
    'GET /api/pantry': () => Response.json({ batches: [] }),
    'GET /api/shopping-list': () =>
      Response.json({
        id: 'l',
        groups: [],
        summary: { remaining: 0, checked: 0 },
      }),
  });
  vi.stubGlobal('fetch', fetchMock);
}

describe('DashboardPage', () => {
  it("renders the Member's Widgets in layout order and skips unknown types", async () => {
    stub({
      widgets: [
        { id: 'a', type: 'quick-scan', size: 'wide' },
        { id: 'b', type: 'from-the-future', size: 'small' },
        { id: 'c', type: 'budget', size: 'small' },
      ],
    });

    renderWithProviders(<DashboardPage />);

    const regions = await screen.findAllByRole('region');
    expect(regions.map((region) => region.getAttribute('aria-label'))).toEqual([
      'Quick scan',
      'Budget',
    ]);
  });

  it('keeps the Customise button in the header', async () => {
    stub({ widgets: [] });

    renderWithProviders(<DashboardPage />);

    expect(
      await screen.findByRole('link', { name: 'Customise dashboard' }),
    ).toHaveAttribute('href', '/customise');
  });

  it('shows an error with a retry when the layout cannot be loaded', async () => {
    const { fetchMock } = stubApi({});
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });
});
