import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { clearReview } from '../../lib/review';
import type { ProposedLine } from '../../lib/scan';
import { renderWithProviders, stubApi } from '../../test/render';
import { ReviewPage } from '../Review/ReviewPage';
import { ScanPage } from './ScanPage';

const IMAGE = 'data:image/jpeg;base64,YQ==';

vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: true,
    capture: () => Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
    setTorch: () => Promise.resolve(true),
  }),
}));
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
}));

const milk: CatalogSearchResult = {
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'ml',
  leafCategory: { id: 'milk', name: 'Milk' },
  parentCategory: { id: 'dairy', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 7, location: 'fridge' },
};
const flour: CatalogSearchResult = {
  ...milk,
  id: 'flour-id',
  name: 'Flour',
  defaultUnit: 'g',
};

const line = (overrides: Partial<ProposedLine>): ProposedLine => ({
  name: 'Milk',
  match: milk,
  matchConfidence: 0.9,
  unmatched: false,
  lowConfidence: false,
  quantity: 200,
  unit: 'ml',
  expiryDate: null,
  productDescription: null,
  ...overrides,
});

const dishes = {
  token: 'signed-token',
  dishes: [
    { title: 'Pancakes', confidence: 0.72 },
    { title: 'Crepes', confidence: 0.2 },
  ],
};
const lines = [
  line({}),
  line({
    name: 'Pixie dust',
    match: null,
    unmatched: true,
    matchConfidence: 0,
    quantity: 2,
    unit: 'pcs',
  }),
];

function renderPlate(extra: Record<string, () => Response> = {}) {
  const { fetchMock, calls } = stubApi({
    'POST /api/scan/plate': () => Response.json(dishes),
    'POST /api/scan/plate/ingredients': () => Response.json({ lines }),
    'GET /api/catalog/search': () => Response.json({ results: [flour] }),
    'POST /api/shopping-list/items/bulk': () =>
      Response.json({ id: 'l', groups: [], summary: {} }),
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewPage />} />
      <Route path="/shopping" element={<p>shopping screen</p>} />
    </Routes>,
    { route: '/scan?mode=plate' },
  );
  return calls;
}

const shoot = () =>
  userEvent.click(screen.getByRole('button', { name: 'Take photo' }));

describe('Plate Scan', () => {
  beforeEach(() => clearReview());
  afterEach(() => vi.unstubAllGlobals());

  it('is wired: Plate can scan, and says it adds to the shopping list', () => {
    renderPlate();
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
    expect(screen.getByRole('status')).not.toHaveTextContent(/coming soon/i);
    expect(screen.getByText(/shopping list/i)).toBeInTheDocument();
  });

  it('shows the dish guesses with confidence, then loads the picked dish into Review', async () => {
    const calls = renderPlate();
    await shoot();

    const picker = await screen.findByRole('group', {
      name: 'Which dish is it?',
    });
    expect(calls.find((c) => c.key === 'POST /api/scan/plate')?.body).toEqual({
      plateImage: IMAGE,
    });
    const options = within(picker).getAllByRole('button');
    expect(options.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Pancakes, 72% likely',
      'Crepes, 20% likely',
    ]);

    await userEvent.click(options[0]);
    expect(
      await screen.findByRole('region', { name: 'Milk' }),
    ).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'POST /api/scan/plate/ingredients')?.body,
    ).toEqual({ dishTitle: 'Pancakes', plateToken: 'signed-token' });
    expect(screen.getByRole('region', { name: 'Pixie dust' })).toBeVisible();
  });

  it('lets the Member retake the photo instead of picking', async () => {
    renderPlate();
    await shoot();
    await screen.findByRole('group', { name: 'Which dish is it?' });
    await userEvent.click(screen.getByRole('button', { name: 'Retake photo' }));
    expect(
      screen.queryByRole('group', { name: 'Which dish is it?' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
  });

  it('goes back to the scan step with a message when the token is rejected', async () => {
    renderPlate({
      'POST /api/scan/plate/ingredients': () =>
        Response.json(
          { code: 'scan.plate_token_invalid', params: {} },
          { status: 400 },
        ),
    });
    await shoot();
    await userEvent.click(
      await screen.findByRole('button', { name: /Pancakes/ }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That dish list has expired. Take the photo again.',
    );
    expect(
      screen.queryByRole('group', { name: 'Which dish is it?' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
  });

  it('shows a localised message when the Scan Cap is reached', async () => {
    renderPlate({
      'POST /api/scan/plate': () =>
        Response.json(
          { code: 'scan.cap_reached', params: { cap: 30 } },
          { status: 429 },
        ),
    });
    await shoot();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You have used all 30 scans for today',
    );
  });

  it('Review for a dish edits quantity, unit, Match and drops lines, with no pantry-only fields', async () => {
    renderPlate();
    await shoot();
    await userEvent.click(
      await screen.findByRole('button', { name: /Pancakes/ }),
    );
    const milkCard = await screen.findByRole('region', { name: 'Milk' });
    expect(within(milkCard).queryByLabelText('Expiry date')).toBeNull();
    expect(within(milkCard).queryByLabelText('Location')).toBeNull();
    expect(within(milkCard).queryByLabelText('Category')).toBeNull();
    expect(within(milkCard).getByLabelText('Quantity')).toHaveValue(200);

    await userEvent.clear(within(milkCard).getByLabelText('Quantity'));
    await userEvent.type(within(milkCard).getByLabelText('Quantity'), '250');
    await userEvent.click(
      screen.getByRole('button', { name: 'Drop Pixie dust' }),
    );
    expect(screen.queryByRole('region', { name: 'Pixie dust' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Add 1 item to shopping list' }),
    ).toBeEnabled();
  });

  it('does not load the Parent Category list for Plate lines, even Unmatched ones', async () => {
    const calls = renderPlate();
    await shoot();
    await userEvent.click(
      await screen.findByRole('button', { name: /Pancakes/ }),
    );
    expect(
      await screen.findByRole('region', { name: 'Pixie dust' }),
    ).toBeVisible();
    expect(calls.map((c) => c.key)).not.toContain('GET /api/catalog/parents');
  });

  it('confirm adds the lines to the Shopping List: matched by id, Unmatched by name', async () => {
    const calls = renderPlate();
    await shoot();
    await userEvent.click(
      await screen.findByRole('button', { name: /Pancakes/ }),
    );
    await screen.findByRole('region', { name: 'Milk' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Add 2 items to shopping list' }),
    );
    expect(await screen.findByText('shopping screen')).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'POST /api/shopping-list/items/bulk')?.body,
    ).toEqual({
      items: [
        { ingredientId: 'milk-id', quantity: 200, unit: 'ml' },
        { name: 'Pixie dust', quantity: 2, unit: 'pcs' },
      ],
    });
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/pantry/batches/bulk',
    );
  });

  it('keeps the lines on screen when adding fails, with a localised error', async () => {
    renderPlate({
      'POST /api/shopping-list/items/bulk': () =>
        Response.json(
          { code: 'shopping.ingredient_not_found', params: {} },
          { status: 404 },
        ),
    });
    await shoot();
    await userEvent.click(
      await screen.findByRole('button', { name: /Pancakes/ }),
    );
    await screen.findByRole('region', { name: 'Milk' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Add 2 items to shopping list' }),
    );
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Milk' })).toBeInTheDocument();
  });
});
