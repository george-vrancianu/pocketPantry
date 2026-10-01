import { screen } from '@testing-library/react';
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

const catalogItem = (id: string, name: string): CatalogSearchResult => ({
  id,
  name,
  defaultUnit: 'pcs',
  leafCategory: { id: `${id}-leaf`, name },
  parentCategory: { id: 'produce', name: 'Produce', aisle: 'Produce' },
  defaults: { expiryDays: 7, location: 'fridge' },
});

const line = (id: string, name: string): ProposedLine => ({
  name,
  match: catalogItem(id, name),
  matchConfidence: 0.9,
  unmatched: false,
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: null,
  productDescription: null,
});

function renderIngredients(routes: Record<string, () => Response>) {
  const { fetchMock, calls } = stubApi(routes);
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewPage />} />
    </Routes>,
    { route: '/scan?mode=ingredients' },
  );
  return calls;
}

describe('Ingredients Scan on the Scan screen', () => {
  beforeEach(() => clearReview());
  afterEach(() => vi.unstubAllGlobals());

  it('is wired: the shutter is enabled and no coming-soon notice shows', () => {
    renderIngredients({});
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it('sends the photo to the Ingredients endpoint and reviews one card per item', async () => {
    const calls = renderIngredients({
      'POST /api/scan/ingredients': () =>
        Response.json({
          lines: [line('tomato', 'Tomato'), line('onion', 'Onion')],
        }),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Take photo' }));
    expect(
      await screen.findByRole('region', { name: 'Tomato' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Onion' })).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'POST /api/scan/ingredients')?.body,
    ).toEqual({ ingredientsImage: IMAGE });
  });

  it('tells the Member when nothing was recognised, and stays on the Scan screen', async () => {
    renderIngredients({
      'POST /api/scan/ingredients': () => Response.json({ lines: [] }),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Take photo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not spot any ingredients',
    );
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeEnabled();
  });

  it('tells the Member when there were too many items, with the limit', async () => {
    renderIngredients({
      'POST /api/scan/ingredients': () =>
        Response.json(
          { code: 'scan.too_many_items', params: { max: 100 } },
          { status: 422 },
        ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Take photo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'more than 100 items',
    );
  });
});
