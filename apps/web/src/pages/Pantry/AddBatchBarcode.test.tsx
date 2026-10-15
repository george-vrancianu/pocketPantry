import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { Batch } from '../../lib/pantry';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

// jsdom has no camera: the camera module is the seam, and it now also yields decoded barcodes.
const camera = vi.hoisted(() => ({
  /** Hands a decoded barcode to the overlay that is watching. */
  emit: null as null | ((code: string) => void),
  watching: 0,
}));
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: false,
    capture: () => Promise.resolve(new Blob(['frame'])),
    setTorch: () => Promise.resolve(true),
    watchBarcodes: (onCode: (code: string) => void) => {
      camera.watching += 1;
      camera.emit = onCode;
      return () => {
        camera.watching -= 1;
      };
    },
  }),
}));
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,AAAA'),
}));

const result = (id: string, name: string, unit: 'g' | 'l', days: number) =>
  ({
    owner: 'catalog',
    amountScale: 'medium',
    id,
    name,
    defaultUnit: unit,
    leafCategory: { id: 'leaf', name: 'Leaf' },
    parentCategory: {
      id: 'dairy',
      name: 'Dairy',
      aisle: { id: 'aisle', name: 'Dairy & eggs' },
    },
    defaults: { expiryDays: days, location: 'fridge' },
  }) satisfies CatalogSearchResult;

const yogurt = result('yogurt-id', 'Yogurt', 'g', 10);
const milk = result('milk-id', 'Milk', 'l', 7);
const CODE = '5941234567890';

const milkBatch: Batch = {
  id: 'milk-1',
  name: 'Milk',
  ingredientId: 'milk-id',
  unmatched: false,
  aisle: null,
  amountScale: null,
  defaultUnit: null,
  defaultExpiryDays: null,
  quantity: 1,
  unit: 'l',
  location: 'fridge',
  expiryDate: null,
  productDescription: null,
  createdAt: '2026-10-01T00:00:00Z',
};

const found = (overrides: object = {}) => ({
  found: true,
  source: 'open_food_facts',
  match: yogurt,
  lowConfidence: false,
  productDescription: 'Greek yogurt',
  quantity: 400,
  unit: 'g',
  ...overrides,
});

function stubLookup(answer: () => Response | Promise<Response>) {
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': () =>
      Response.json({ batches: [milkBatch], runningLow: [] }),
    'GET /api/staples': () => Response.json({ staples: [] }),
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    'GET /api/catalog/search': () => Response.json({ results: [yogurt, milk] }),
    'GET /api/pantry/recently-stocked': () =>
      Response.json({ ingredients: [] }),
    [`GET /api/barcode-lookup/${CODE}`]: answer,
    'POST /api/scan/product': () => Response.json({ lines: [] }),
    'POST /api/pantry/batches': () => Response.json(milkBatch, { status: 201 }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

async function openForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Add batch' }));
}
const cameraButton = () =>
  screen.getByRole('button', { name: 'Fill from the camera' });

async function decode(code = CODE) {
  await waitFor(() => expect(camera.emit).not.toBeNull());
  act(() => camera.emit?.(code));
}

describe('Prefill the add-Batch form from a Barcode Lookup', () => {
  beforeEach(() => {
    localStorage.clear();
    camera.emit = null;
    camera.watching = 0;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('offers Product and Barcode, starts in Barcode with no Scan Language chip', async () => {
    const user = userEvent.setup();
    stubLookup(() => Response.json(found()));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());

    const dial = screen.getAllByRole('radio');
    expect(dial.map((radio) => radio.getAttribute('aria-label'))).toEqual([
      'Product',
      'Barcode',
    ]);
    expect(screen.getByRole('radio', { name: 'Barcode' })).toBeChecked();
    expect(screen.queryByLabelText('Reading as')).not.toBeInTheDocument();
    expect(camera.watching).toBe(1);

    await user.click(screen.getByRole('radio', { name: 'Product' }));
    expect(screen.getByLabelText('Reading as')).toBeInTheDocument();
    expect(camera.watching).toBe(0);
  });

  it("remembers the last mode apart from the Scan page's", async () => {
    const user = userEvent.setup();
    localStorage.setItem('pocket-pantry.scan-mode', 'plate');
    stubLookup(() => Response.json(found()));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await user.click(screen.getByRole('radio', { name: 'Product' }));
    await user.click(screen.getByRole('button', { name: 'Close scanner' }));

    await user.click(cameraButton());
    expect(screen.getByRole('radio', { name: 'Product' })).toBeChecked();
    expect(localStorage.getItem('pocket-pantry.scan-mode')).toBe('plate');
  });

  it('closes on a decoded barcode, prefills the form and credits Open Food Facts, without a Scan', async () => {
    const user = userEvent.setup();
    const calls = stubLookup(() => Response.json(found()));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await decode();

    expect(screen.queryByTestId('camera-overlay')).not.toBeInTheDocument();
    expect(
      await screen.findByRole('combobox', {
        name: 'Ingredient: Yogurt. Press Backspace to change',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /Amount of Yogurt/ }),
    ).toHaveValue('400');
    expect(screen.getByRole('button', { name: 'Unit: g' })).toBeInTheDocument();
    expect(screen.getByLabelText('Product description')).toHaveValue(
      'Greek yogurt',
    );
    expect(screen.getByTestId('prefilled-description')).toHaveTextContent(
      'Filled from the product',
    );
    expect(screen.getByText('Product data: Open Food Facts')).toBeVisible();
    const lookup = calls.filter((call) =>
      call.key.startsWith('GET /api/barcode'),
    );
    expect(lookup).toHaveLength(1);
    expect(lookup[0].search).toBe('?locale=en');
    expect(calls.some((call) => call.key === 'POST /api/scan/product')).toBe(
      false,
    );
  });

  it('shows a lookup state while the code is looked up', async () => {
    const user = userEvent.setup();
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    stubLookup(async () => {
      await gate;
      return Response.json(found());
    });
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await decode();
    expect(await screen.findByText('Looking up the barcode…')).toBeVisible();
    release();
    await waitFor(() =>
      expect(screen.queryByText('Looking up the barcode…')).toBeNull(),
    );
  });

  it('with no confident match, pre-types the Ingredient search and fills the description', async () => {
    const user = userEvent.setup();
    stubLookup(() =>
      Response.json(
        found({ match: null, productDescription: 'Zorblax Crunch' }),
      ),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await decode();

    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Search ingredients' }),
      ).toHaveValue('Zorblax Crunch'),
    );
    // No Ingredient is picked yet, so the rest of the form waits for one.
    expect(screen.queryByLabelText('Product description')).toBeNull();
    expect(screen.getByText('Product data: Open Food Facts')).toBeVisible();
    await user.clear(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
    );
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'yog',
    );
    await user.click(await screen.findByRole('option', { name: /Yogurt/ }));
    expect(screen.getByLabelText('Product description')).toHaveValue(
      'Zorblax Crunch',
    );
  });

  it('keeps what the Member already set', async () => {
    const user = userEvent.setup();
    stubLookup(() => Response.json(found()));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'mil',
    );
    await user.click(await screen.findByRole('option', { name: /Milk/ }));
    await user.type(screen.getByLabelText('Product description'), 'Mine');
    await user.click(cameraButton());
    await decode();

    await screen.findByText('Product data: Open Food Facts');
    expect(
      screen.getByRole('combobox', {
        name: 'Ingredient: Milk. Press Backspace to change',
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Product description')).toHaveValue('Mine');
    expect(screen.getByRole('textbox', { name: /Amount of Milk/ })).toHaveValue(
      '400',
    );
  });

  it('on not found, reopens the camera in Product mode with a short message', async () => {
    const user = userEvent.setup();
    stubLookup(() => Response.json({ found: false }));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await decode();

    const overlay = await screen.findByTestId('camera-overlay');
    expect(
      within(overlay).getByText(/No product found for that barcode/),
    ).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Product' })).toBeChecked();
    expect(screen.queryByText('Product data: Open Food Facts')).toBeNull();
    // The Member's choice of mode is not overwritten by the switch.
    expect(
      localStorage.getItem('pocket-pantry.camera-overlay-mode'),
    ).toBeNull();
  });

  it('keeps the form and shows a short error when the lookup fails', async () => {
    const user = userEvent.setup();
    stubLookup(() =>
      Response.json(
        { code: 'barcode.provider_unavailable', params: {} },
        { status: 502 },
      ),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await decode();
    expect(
      await screen.findByText(/barcode lookup is unavailable/),
    ).toBeVisible();
    expect(screen.queryByTestId('camera-overlay')).not.toBeInTheDocument();
  });

  it('cancelling keeps the form and ends the watch', async () => {
    const user = userEvent.setup();
    const calls = stubLookup(() => Response.json(found()));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await user.click(screen.getByRole('button', { name: 'Close scanner' }));
    expect(camera.watching).toBe(0);
    expect(calls.some((call) => call.key.startsWith('GET /api/barcode'))).toBe(
      false,
    );
  });

  it('drops the Open Food Facts credit once a Product photo is read after a barcode', async () => {
    const user = userEvent.setup();
    stubLookup(() => Response.json(found()));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await decode();
    await screen.findByText('Product data: Open Food Facts');

    await user.click(cameraButton());
    await user.click(screen.getByRole('radio', { name: 'Product' }));
    screen.getByTestId('scan-guide').focus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(screen.queryByText('Product data: Open Food Facts')).toBeNull(),
    );
  });

  it('with no confident match, drops an earlier untouched pick', async () => {
    const user = userEvent.setup();
    let calls = 0;
    stubLookup(() =>
      Response.json(
        ++calls === 1
          ? found()
          : found({ match: null, productDescription: 'Zorblax' }),
      ),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    await decode();
    await screen.findByRole('combobox', {
      name: 'Ingredient: Yogurt. Press Backspace to change',
    });

    camera.emit = null;
    await user.click(cameraButton());
    await decode();
    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Search ingredients' }),
      ).toHaveValue('Zorblax'),
    );
  });

  it('shows the strings in Romanian and Danish', async () => {
    const user = userEvent.setup();
    stubLookup(() => Response.json(found()));
    renderWithProviders(<PantryPage />, { locale: 'da' });
    await user.click(await screen.findByRole('button', { name: /^Tilføj/ }));
    await user.click(
      screen.getByRole('button', { name: 'Udfyld med kameraet' }),
    );
    expect(screen.getByRole('radio', { name: 'Stregkode' })).toBeChecked();
  });

  it('shows the barcode mode in Romanian', async () => {
    const user = userEvent.setup();
    stubLookup(() => Response.json(found()));
    renderWithProviders(<PantryPage />, { locale: 'ro' });
    await user.click(await screen.findByRole('button', { name: /^Adaugă/ }));
    await user.click(screen.getByRole('button', { name: /camera/ }));
    expect(screen.getByRole('radio', { name: 'Cod de bare' })).toBeChecked();
  });
});
