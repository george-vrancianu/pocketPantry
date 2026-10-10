import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { ProposedLine } from '../../lib/scan';
import { resetReads } from '../../lib/scanReads';
import { resetScanSession } from '../../lib/scanSession';
import { renderWithProviders, stubApi } from '../../test/render';
import { findReviewRow } from '../../test/review';
import { scanViaGuide } from '../../test/scan';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
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
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
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

const lines: ProposedLine[] = [
  {
    name: 'Milk',
    match: milk,
    lowConfidence: false,
    quantity: 200,
    unit: 'ml',
    expiryDate: null,
    sourceText: null,
    productDescription: null,
  },
  {
    name: 'Pixie dust',
    match: null,
    lowConfidence: false,
    quantity: 2,
    unit: 'pcs',
    expiryDate: null,
    sourceText: null,
    productDescription: null,
  },
];

const dishes = (token: string) => ({
  token,
  dishes: [
    { title: 'Pancakes', confidence: 0.72 },
    { title: 'Crepes', confidence: 0.2 },
  ],
});

const expired = () =>
  Response.json(
    { code: 'scan.plate_token_invalid', params: {} },
    { status: 400 },
  );

function renderPlate(extra: Record<string, () => Response> = {}) {
  let reads = 0;
  const { fetchMock, calls } = stubApi({
    'POST /api/scan/plate': () => Response.json(dishes(`token-${++reads}`)),
    'POST /api/scan/plate/ingredients': () => Response.json({ lines }),
    'POST /api/shopping-list/items/bulk': () =>
      Response.json({ id: 'l', groups: [], summary: {} }),
    ...extra,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewOverviewPage />} />
      <Route path="/scan/review/:scanId" element={<ReviewPage />} />
      <Route path="/shopping" element={<p>shopping screen</p>} />
    </Routes>,
    { route: '/scan?mode=plate' },
  );
  return calls;
}

const scanThenDone = async () => {
  scanViaGuide();
  await userEvent.click(await screen.findByRole('button', { name: /^Done/ }));
};
const picker = () => screen.findByRole('group', { name: 'Pick the dish' });
const pick = async (title: RegExp) =>
  userEvent.click(within(await picker()).getByRole('button', { name: title }));

describe('Plate Scan in the Scan Session', () => {
  beforeEach(() => {
    resetReads();
    resetScanSession();
    localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('queues like the other modes: stays on the camera, no picker there', async () => {
    const calls = renderPlate();
    scanViaGuide();
    expect(await screen.findAllByTestId('scan-thumbnail')).toHaveLength(1);
    expect(screen.getByTestId('scan-guide')).toBeInTheDocument();
    await waitFor(() =>
      expect(calls.map((c) => c.key)).toContain('POST /api/scan/plate'),
    );
    const read = calls.find((c) => c.key === 'POST /api/scan/plate');
    expect(read?.body).toEqual({ plateImage: IMAGE });
    expect(new URLSearchParams(read?.search).has('scanLanguage')).toBe(false);
    expect(screen.queryByRole('group', { name: 'Pick the dish' })).toBeNull();
  });

  it('shows "Pick the dish" on the card, with each guess and its confidence', async () => {
    renderPlate();
    await scanThenDone();
    const options = within(await picker()).getAllByRole('button');
    expect(options.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Pancakes, 72% likely',
      'Crepes, 20% likely',
    ]);
    expect(within(screen.getByTestId('review-card')).getByRole('group')).toBe(
      screen.getByRole('group', { name: 'Pick the dish' }),
    );
  });

  it('picking a dish fetches its ingredients into the card', async () => {
    const calls = renderPlate();
    await scanThenDone();
    await pick(/Pancakes/);
    const result = await screen.findByTestId('card-result');
    expect(result).toHaveTextContent('2 items');
    expect(
      calls.find((c) => c.key === 'POST /api/scan/plate/ingredients')?.body,
    ).toEqual({ dishTitle: 'Pancakes', plateToken: 'token-1' });
    expect(screen.queryByRole('group', { name: 'Pick the dish' })).toBeNull();
    expect(
      within(screen.getByTestId('review-card'))
        .getAllByTestId('card-chip')
        .map((chip) => chip.textContent),
    ).toEqual(expect.arrayContaining(['Milk', 'Pixie dust']));
  });

  it('Add all saves a picked Plate card to the Shopping List and leaves an unpicked one', async () => {
    const calls = renderPlate();
    scanViaGuide();
    await userEvent.click(await screen.findByRole('button', { name: /^Done/ }));
    await pick(/Pancakes/);
    await screen.findByTestId('card-result');
    expect(screen.getByRole('button', { name: /^Add all/ })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: /^Add all/ }));
    await waitFor(() =>
      expect(calls.map((c) => c.key)).toContain(
        'POST /api/shopping-list/items/bulk',
      ),
    );
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/pantry/batches/bulk',
    );
  });

  it('Add all does not save a Plate card that is still waiting for a dish', async () => {
    const calls = renderPlate();
    await scanThenDone();
    await picker();
    expect(screen.getByRole('button', { name: /^Add all/ })).toBeDisabled();
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/shopping-list/items/bulk',
    );
  });

  it('opens the ingredients for editing and adds them to the Shopping List, then drops the card', async () => {
    const calls = renderPlate();
    await scanThenDone();
    await pick(/Pancakes/);
    await userEvent.click(await screen.findByTestId('card-result'));
    await userEvent.click(await findReviewRow('Milk'));
    const milkCard = screen.getByRole('group', { name: 'Milk' });
    expect(within(milkCard).getByLabelText('Quantity')).toHaveValue(200);
    expect(within(milkCard).queryByLabelText('Expiry date')).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add 2 items to shopping list' }),
    );
    // The only card is saved, so the Member lands on the Shopping List.
    expect(await screen.findByText('shopping screen')).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'POST /api/shopping-list/items/bulk')?.body,
    ).toEqual({
      items: [
        { ingredientId: 'milk-id', quantity: 200, unit: 'ml' },
        { name: 'Pixie dust', source: 'plate', quantity: 2, unit: 'pcs' },
      ],
    });
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/pantry/batches/bulk',
    );
  });

  it('offers "Read again" when the token has expired, and reading again costs a new Plate request', async () => {
    const calls = renderPlate({
      'POST /api/scan/plate/ingredients': expired,
    });
    await scanThenDone();
    await pick(/Pancakes/);
    const again = await screen.findByRole('button', { name: 'Read again' });
    expect(screen.queryByRole('group', { name: 'Pick the dish' })).toBeNull();
    expect(screen.queryByTestId('card-result')).toBeNull();

    await userEvent.click(again);
    const plateReads = () =>
      calls.filter((c) => c.key === 'POST /api/scan/plate');
    await waitFor(() => expect(plateReads()).toHaveLength(2));
    expect(plateReads()[1].body).toEqual({ plateImage: IMAGE });
    // The new guesses carry the new token.
    expect(await picker()).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Read again' })).toBeNull();
    expect(screen.getAllByTestId('review-card')).toHaveLength(1);
  });

  it('keeps the dish guesses when picking fails for another reason', async () => {
    renderPlate({
      'POST /api/scan/plate/ingredients': () =>
        Response.json({ code: 'internal', params: {} }, { status: 500 }),
    });
    await scanThenDone();
    await pick(/Pancakes/);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await picker()).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Read again' })).toBeNull();
  });
});
