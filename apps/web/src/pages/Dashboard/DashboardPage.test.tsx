import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  renderInAppLayout,
  renderWithProviders,
  stubApi,
} from '../../test/render';
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
        { id: 'a', type: 'meal-plan', size: 'wide' },
        { id: 'b', type: 'from-the-future', size: 'small' },
        { id: 'c', type: 'budget', size: 'small' },
      ],
    });

    renderWithProviders(<DashboardPage />);

    const regions = await screen.findAllByRole('region');
    expect(regions.map((region) => region.getAttribute('aria-label'))).toEqual([
      'Meal plan',
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
    stub({ widgets: [{ id: 'a', type: 'use-soon', size: 'tall' }] });

    stubViewport(1280);
    const wide = renderWithProviders(<DashboardPage />);
    let card = await screen.findByRole('region', { name: 'Use soon' });
    expect(getComputedStyle(card).gridRow).toBe('span 2');
    expect(getComputedStyle(card).gridColumn).toBe('span 2');
    wide.unmount();

    stubViewport(768);
    renderWithProviders(<DashboardPage />);
    card = await screen.findByRole('region', { name: 'Use soon' });
    expect(getComputedStyle(card).gridRow).not.toBe('span 2');
    expect(getComputedStyle(card).gridColumn).toBe('span 2');
  });

  it('renders a tall Widget as wide (two columns, one row) at 390px', async () => {
    stubViewport(390);
    stub({ widgets: [{ id: 'a', type: 'use-soon', size: 'tall' }] });

    renderWithProviders(<DashboardPage />);

    const card = await screen.findByRole('region', { name: 'Use soon' });
    expect(getComputedStyle(card).gridColumn).toBe('span 2');
    expect(getComputedStyle(card).gridRow).toBe('span 1');
  });

  it.each([
    [390, ''],
    [768, ''],
    [1280, 'dense'],
  ])(
    'packs the grid densely only on the four-column grid (%ipx)',
    async (width, dense) => {
      stubViewport(width);
      stub({ widgets: [{ id: 'a', type: 'budget', size: 'small' }] });

      renderWithProviders(<DashboardPage />);

      const widget = await screen.findByRole('region', { name: 'Budget' });
      const grid = widget.parentElement as HTMLElement;
      expect(getComputedStyle(grid).gridAutoFlow).toBe(dense || 'row');
    },
  );

  it('keeps the Customise button in the header', async () => {
    stub({ widgets: [] });

    renderWithProviders(<DashboardPage />);

    expect(
      await screen.findByRole('link', { name: 'Customise dashboard' }),
    ).toHaveAttribute('href', '/customise');
  });

  it('puts the Settings gear rightmost, after Customise', async () => {
    stub({ widgets: [] });

    renderWithProviders(<DashboardPage />);

    const header = await screen.findByRole('banner');
    const links = within(header).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'Customise dashboard',
      'Settings',
    ]);
    expect(links[1]).toHaveAttribute('href', '/settings');
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

describe('DashboardPage header', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date(2026, 9, 25, 19, 0));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const settle = () =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
  const elapse = (ms: number) =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });

  function stubDash(layout: () => Response | Promise<Response>) {
    const { fetchMock, calls } = stubApi({
      'GET /api/dashboard-layout': layout,
      'GET /api/pantry': () => Response.json({ batches: [] }),
      'GET /api/shopping-list': () =>
        Response.json({
          id: 'l',
          groups: [],
          summary: { remaining: 0, checked: 0 },
        }),
      'GET /api/voice/config': () => Response.json({ configured: true }),
      'GET /api/staples': () => Response.json({ staples: [] }),
      'GET /api/settings/preferences': () => Response.json({}),
    });
    vi.stubGlobal('fetch', fetchMock);
    return calls;
  }
  const layout = () =>
    Response.json({ widgets: [{ id: 'a', type: 'budget', size: 'small' }] });

  it('shows the Refresh button, the greeting and the date under it, with the actions at the end', async () => {
    stubDash(layout);
    renderInAppLayout(<DashboardPage />, '/');
    await settle();

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Good evening' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Sunday, October 25');
    const header = screen.getByRole('banner');
    const links = within(header).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('aria-label'))).toEqual([
      'Customise dashboard',
      'Settings',
    ]);
  });

  it('refetches on a tap: Refreshing, Updated just now, then the date again', async () => {
    const calls = stubDash(layout);
    renderInAppLayout(<DashboardPage />, '/');
    await settle();
    const count = () =>
      calls.filter((c) => c.key === 'GET /api/dashboard-layout').length;
    const before = count();

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing…');
    await settle();
    expect(screen.getByRole('status')).toHaveTextContent('Updated just now');
    expect(count()).toBeGreaterThan(before);
    await elapse(2500);
    expect(screen.getByRole('status')).toHaveTextContent('Sunday, October 25');
  });

  it('reports a failed refresh, then the date', async () => {
    let fail = false;
    stubDash(() => (fail ? Response.error() : layout()));
    renderInAppLayout(<DashboardPage />, '/');
    await settle();
    fail = true;

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await settle();
    expect(screen.getByRole('status')).toHaveTextContent(
      "Couldn't refresh · showing what you had",
    );
    await elapse(4000);
    expect(screen.getByRole('status')).toHaveTextContent('Sunday, October 25');
  });
});
