import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubViewport } from '../../test/viewport';
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

  it.each([
    [390, 'repeat(2, minmax(0, 1fr))'],
    [768, 'repeat(3, minmax(0, 1fr))'],
    [1280, 'repeat(4, minmax(0, 1fr))'],
  ])(
    'lays Widgets out in the right columns at %ipx',
    async (width, columns) => {
      stubViewport(width);
      stub({ widgets: [{ id: 'a', type: 'budget', size: 'small' }] });

      renderWithProviders(<DashboardPage />);

      const widget = await screen.findByRole('region', { name: 'Budget' });
      const grid = widget.parentElement as HTMLElement;
      expect(getComputedStyle(grid).gridTemplateColumns).toBe(columns);
    },
  );

  it('shows a tall Widget two rows high only from 900px, and keeps its saved size', async () => {
    stub({ widgets: [{ id: 'a', type: 'meal-plan', size: 'tall' }] });

    stubViewport(1280);
    const wide = renderWithProviders(<DashboardPage />);
    let card = await screen.findByRole('region', { name: 'Meal plan' });
    expect(getComputedStyle(card).gridRow).toBe('span 2');
    expect(getComputedStyle(card).gridColumn).toBe('span 2');
    wide.unmount();

    stubViewport(768);
    renderWithProviders(<DashboardPage />);
    card = await screen.findByRole('region', { name: 'Meal plan' });
    expect(getComputedStyle(card).gridRow).not.toBe('span 2');
    expect(getComputedStyle(card).gridColumn).toBe('span 2');
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
