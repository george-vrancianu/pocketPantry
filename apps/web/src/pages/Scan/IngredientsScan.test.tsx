import { screen } from '@testing-library/react';
import { scanGuide, scanViaGuide } from '../../test/scan';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { clearReview } from '../../lib/review';
import type { ProposedLine } from '../../lib/scan';
import { renderWithProviders, stubApi } from '../../test/render';
import { findReviewRow } from '../../test/review';
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
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: null,
  sourceText: null,
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

  it('enables the shutter', () => {
    renderIngredients({});
    expect(scanGuide()).not.toHaveAttribute('aria-disabled');
  });

  it('sends the photo to the Ingredients endpoint and reviews one card per item', async () => {
    const calls = renderIngredients({
      'POST /api/scan/ingredients': () =>
        Response.json({
          lines: [line('tomato', 'Tomato'), line('onion', 'Onion')],
        }),
    });
    scanViaGuide();
    expect(await findReviewRow('Tomato')).toBeInTheDocument();
    expect(await findReviewRow('Onion')).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'POST /api/scan/ingredients')?.body,
    ).toEqual({ ingredientsImage: IMAGE });
  });

  it('tells the Member when nothing was recognised, and stays on the Scan screen', async () => {
    renderIngredients({
      'POST /api/scan/ingredients': () => Response.json({ lines: [] }),
    });
    scanViaGuide();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not spot any ingredients',
    );
    expect(scanGuide()).not.toHaveAttribute('aria-disabled');
  });

  it('tells the Member when there were too many items, with the limit', async () => {
    renderIngredients({
      'POST /api/scan/ingredients': () =>
        Response.json(
          { code: 'scan.too_many_items', params: { max: 50 } },
          { status: 422 },
        ),
    });
    scanViaGuide();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'more than 50 items',
    );
  });
});
