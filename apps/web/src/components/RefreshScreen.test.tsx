import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PantryPage } from '../pages/Pantry/PantryPage';
import { renderInAppLayout, stubApi } from '../test/render';
import { AppScreenHeader } from './AppScreenHeader';

const batch = {
  id: 'b1',
  name: 'Milk',
  ingredientId: 'milk-id',
  unmatched: false,
  aisle: null,
  amountScale: null,
  defaultUnit: null,
  defaultExpiryDays: null,
  quantity: null,
  unit: null,
  location: 'fridge',
  expiryDate: null,
  productDescription: null,
  createdAt: '2026-10-01T00:00:00Z',
};

function stubPantry(pantry: () => Response | Promise<Response>) {
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': pantry,
    'GET /api/voice/config': () => Response.json({ configured: true }),
    'GET /api/staples': () => Response.json({ staples: [] }),
    'GET /api/settings/preferences': () => Response.json({}),
    'GET /api/pantry/recently-stocked': () =>
      Response.json({ ingredients: [] }),
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

const settle = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
const elapse = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const tap = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
const gets = (calls: Array<{ key: string }>) =>
  calls.filter((c) => c.key === 'GET /api/pantry').length;

async function openPantry(locale: 'en' | 'ro' | 'da' = 'en') {
  renderInAppLayout(<PantryPage />, '/pantry', { locale });
  await settle();
}

describe('Refresh mark on a tab root', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('refetches, reports Refreshing then Updated just now, and clears after 2.5 s', async () => {
    const calls = stubPantry(() => Response.json({ batches: [batch] }));
    await openPantry();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    const before = gets(calls);

    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    stubPantry(async () => {
      await gate;
      return Response.json({ batches: [batch] });
    });
    tap();
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing…');
    release();
    await settle();
    expect(screen.getByRole('status')).toHaveTextContent('Updated just now');
    await elapse(2499);
    expect(screen.getByRole('status')).toHaveTextContent('Updated just now');
    await elapse(1);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(before).toBeGreaterThan(0);
  });

  it('repeats the screen requests on a tap', async () => {
    const calls = stubPantry(() => Response.json({ batches: [batch] }));
    await openPantry();
    const before = gets(calls);
    tap();
    await settle();
    expect(gets(calls)).toBe(before + 1);
  });

  it('sends no second round of requests for a tap while busy, and dims the content meanwhile', async () => {
    stubPantry(() => Response.json({ batches: [batch] }));
    await openPantry();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const calls = stubPantry(async () => {
      await gate;
      return Response.json({ batches: [batch] });
    });
    const content = () =>
      getComputedStyle(
        screen.getByRole('status').closest('header')!.nextElementSibling!,
      );
    expect(content().opacity).toBe('1');
    tap();
    tap();
    expect(gets(calls)).toBe(1);
    expect(content().opacity).toBe('0.55');
    release();
    await settle();
    expect(gets(calls)).toBe(1);
    expect(content().opacity).toBe('1');
  });

  it('shows the failure line, keeps the data shown, and clears after 4 s', async () => {
    stubPantry(() => Response.json({ batches: [batch] }));
    await openPantry();
    stubPantry(() =>
      Response.json({ code: 'boom', params: {} }, { status: 500 }),
    );
    tap();
    await settle();
    expect(screen.getByRole('status')).toHaveTextContent(
      "Couldn't refresh · showing what you had",
    );
    expect(screen.getByText('Milk')).toBeInTheDocument();
    await elapse(3999);
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement();
    await elapse(1);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it.each([
    ['ro', 'Reîmprospătează'],
    ['da', 'Opdater'],
  ] as const)('names the button in %s', async (locale, name) => {
    stubPantry(() => Response.json({ batches: [] }));
    await openPantry(locale);
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
});

describe('Refresh mark placement', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['/pantry', true],
    ['/shopping', true],
    ['/recipes', true],
    ['/meal-plans', false],
    ['/settings', false],
    ['/recipes/new', false],
  ])('%s: mark shown is %s', (path, shown) => {
    renderInAppLayout(<AppScreenHeader title="Title" />, path);
    expect(!!screen.queryByRole('button', { name: 'Refresh' })).toBe(shown);
  });
});
