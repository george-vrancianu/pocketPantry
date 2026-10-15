import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { Batch } from '../../lib/pantry';
import type { ProposedLine } from '../../lib/scan';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

// jsdom has no camera or canvas: the camera hook and image preparation are the seams.
const camera = vi.hoisted(() => ({ status: 'ready' as string }));
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: camera.status,
    torchSupported: false,
    capture: () => Promise.resolve(new Blob(['frame'])),
    setTorch: () => Promise.resolve(true),
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

const line = (overrides: Partial<ProposedLine> = {}): ProposedLine => ({
  name: 'Greek yogurt',
  sourceText: 'Greek yogurt 500 g',
  match: yogurt,
  lowConfidence: false,
  quantity: 500,
  unit: 'g',
  expiryDate: '2026-12-24',
  productDescription: 'Greek yogurt 500 g',
  ...overrides,
});

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

/** The Product Scan answers when `release` is called with its response. */
function stubProductScan(respond: () => Response | Promise<Response>) {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': () =>
      Response.json({ batches: [milkBatch], runningLow: [] }),
    'GET /api/staples': () => Response.json({ staples: [] }),
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    'GET /api/catalog/search': () => Response.json({ results: [yogurt, milk] }),
    'GET /api/pantry/recently-stocked': () =>
      Response.json({ ingredients: [] }),
    'POST /api/scan/product': async () => {
      await gate;
      return respond();
    },
    'POST /api/pantry/batches': () => Response.json(milkBatch, { status: 201 }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls, release };
}

const scanCalls = (calls: ReturnType<typeof stubApi>['calls']) =>
  calls.filter((call) => call.key === 'POST /api/scan/product');

function Where() {
  const location = useLocation();
  return (
    <output data-testid="where">{location.pathname + location.search}</output>
  );
}

async function openForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Add batch' }));
}

const cameraButton = () =>
  screen.getByRole('button', { name: 'Fill from a photo' });

async function shoot(user: ReturnType<typeof userEvent.setup>) {
  await user.click(cameraButton());
  screen.getByTestId('scan-guide').focus();
  await user.keyboard('{Enter}');
}

describe('Prefill the add-Batch form from a Product Scan', () => {
  beforeEach(() => {
    localStorage.clear();
    camera.status = 'ready';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens a camera overlay with only Product (no dial), and cancelling keeps the form', async () => {
    const user = userEvent.setup();
    const { calls } = stubProductScan(() => Response.json({ lines: [line()] }));
    renderWithProviders(
      <>
        <PantryPage />
        <Where />
      </>,
      { route: '/pantry?mode=receipt&tab=x' },
    );
    await openForm(user);
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'yog',
    );
    await user.click(await screen.findByRole('option', { name: /Yogurt/ }));
    await user.type(screen.getByLabelText('Product description'), 'Mine');

    await user.click(cameraButton());
    expect(screen.getByTestId('camera-overlay')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Reading as')).toBeInTheDocument();
    // The host page's URL is left alone.
    expect(screen.getByTestId('where')).toHaveTextContent(
      '/pantry?mode=receipt&tab=x',
    );

    await user.click(screen.getByRole('button', { name: 'Close scanner' }));
    expect(screen.queryByTestId('camera-overlay')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Product description')).toHaveValue('Mine');
    expect(scanCalls(calls)).toHaveLength(0);
  });

  it('closes on Escape, focuses into the dialog, and returns focus to the camera button', async () => {
    const user = userEvent.setup();
    stubProductScan(() => Response.json({ lines: [line()] }));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    expect(screen.getByTestId('camera-overlay')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('camera-overlay')).not.toBeInTheDocument();
    expect(cameraButton()).toHaveFocus();
  });

  it("leaves the Scan page's remembered mode alone", async () => {
    const user = userEvent.setup();
    localStorage.setItem('pocket-pantry.scan-mode', 'receipt');
    const { release } = stubProductScan(() =>
      Response.json({ lines: [line()] }),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await shoot(user);
    release();
    await screen.findByTestId('prefilled-ingredient');
    expect(localStorage.getItem('pocket-pantry.scan-mode')).toBe('receipt');
  });

  it('fills a fractional amount in the locale notation', async () => {
    const user = userEvent.setup();
    const { release } = stubProductScan(() =>
      Response.json({ lines: [line({ quantity: 0.5, unit: 'l' })] }),
    );
    renderWithProviders(<PantryPage />, { locale: 'ro' });
    await user.click(await screen.findByRole('button', { name: /^Adaugă/ }));
    await user.click(screen.getByRole('button', { name: /poză/ }));
    screen.getByTestId('scan-guide').focus();
    await user.keyboard('{Enter}');
    release();
    expect(await screen.findByDisplayValue('0,5')).toBeInTheDocument();
  });

  it('shows a clear message when the camera is denied', async () => {
    camera.status = 'unavailable';
    const user = userEvent.setup();
    stubProductScan(() => Response.json({ lines: [line()] }));
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    expect(
      screen.getByText(/camera is not available.*permission/i),
    ).toBeInTheDocument();
  });

  it('closes on a shot, shows reading, lets the Member edit, and reads in the shared Scan Language', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'pocket-pantry.scan-language',
      JSON.stringify({ locale: 'en', language: 'ro' }),
    );
    const { calls, release } = stubProductScan(() =>
      Response.json({ lines: [line()] }),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.click(cameraButton());
    expect(screen.getByLabelText('Reading as')).toHaveValue('ro');
    await user.selectOptions(screen.getByLabelText('Reading as'), 'da');
    screen.getByTestId('scan-guide').focus();
    await user.keyboard('{Enter}');

    expect(screen.queryByTestId('camera-overlay')).not.toBeInTheDocument();
    expect(await screen.findByText(/Reading the product photo/)).toBeVisible();
    expect(cameraButton()).toHaveAttribute('aria-disabled', 'true');
    // Edits made while the photo is read.
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'mil',
    );
    await user.click(await screen.findByRole('option', { name: /Milk/ }));
    await user.type(screen.getByLabelText('Product description'), 'Fresh');
    release();
    await waitFor(() =>
      expect(screen.queryByText(/Reading the product photo/)).toBeNull(),
    );
    // They are kept and unmarked; the untouched fields still fill.
    expect(
      screen.getByRole('combobox', {
        name: 'Ingredient: Milk. Press Backspace to change',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: /Ingredient: Yogurt/ }),
    ).toBeNull();
    expect(screen.queryByTestId('prefilled-ingredient')).toBeNull();
    expect(screen.getByLabelText('Product description')).toHaveValue('Fresh');
    expect(screen.queryByTestId('prefilled-description')).toBeNull();
    expect(screen.getByRole('textbox', { name: /Amount of Milk/ })).toHaveValue(
      '500',
    );
    expect(await screen.findByTestId('prefilled-expiry')).toBeInTheDocument();
    const [post] = scanCalls(calls);
    expect(post.search).toContain('scanLanguage=da');
    expect(post.body).toEqual({ productImage: 'data:image/jpeg;base64,AAAA' });
    // The choice is the Scan page's remembered one too.
    expect(
      JSON.parse(localStorage.getItem('pocket-pantry.scan-language')!),
    ).toMatchObject({ language: 'da' });
  });

  it('fills every untouched field, marks them, and saves what was read', async () => {
    const user = userEvent.setup();
    const { calls, release } = stubProductScan(() =>
      Response.json({ lines: [line()] }),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await shoot(user);
    release();

    expect(
      await screen.findByRole('combobox', {
        name: 'Ingredient: Yogurt. Press Backspace to change',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /Amount of Yogurt/ }),
    ).toHaveValue('500');
    expect(screen.getByRole('button', { name: 'Unit: g' })).toBeInTheDocument();
    expect(screen.getByLabelText('Product description')).toHaveValue(
      'Greek yogurt 500 g',
    );
    expect(
      screen.getByRole('button', { name: /^Expires, .*December 24/ }),
    ).toBeInTheDocument();
    for (const field of ['ingredient', 'amount', 'expiry', 'description'])
      expect(screen.getByTestId(`prefilled-${field}`)).toHaveTextContent(
        'Filled from your photo',
      );
    expect(screen.queryByText(/Low confidence/)).not.toBeInTheDocument();

    // Editing a field drops its mark.
    await user.type(screen.getByLabelText('Product description'), '!');
    expect(screen.queryByTestId('prefilled-description')).toBeNull();
    expect(screen.getByTestId('prefilled-amount')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add to Pantry' }));
    const post = calls.find((c) => c.key === 'POST /api/pantry/batches');
    expect(post?.body).toEqual({
      ingredientId: 'yogurt-id',
      quantity: 500,
      unit: 'g',
      location: 'fridge',
      expiryDate: '2026-12-24',
      productDescription: 'Greek yogurt 500 g!',
    });
  });

  it('fills only the fields the Member has not touched', async () => {
    const user = userEvent.setup();
    const { release } = stubProductScan(() =>
      Response.json({ lines: [line()] }),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'mil',
    );
    await user.click(await screen.findByRole('option', { name: /Milk/ }));
    await user.type(
      screen.getByRole('textbox', { name: /Amount of Milk/ }),
      '2',
    );
    await user.type(screen.getByLabelText('Product description'), 'Fresh');
    await shoot(user);
    release();
    await waitFor(() =>
      expect(screen.queryByText(/Reading the product photo/)).toBeNull(),
    );

    expect(
      screen.getByRole('combobox', {
        name: 'Ingredient: Milk. Press Backspace to change',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Amount of Milk/ })).toHaveValue(
      '2',
    );
    expect(screen.getByLabelText('Product description')).toHaveValue('Fresh');
    // Expiry was not touched: it takes the date from the photo.
    expect(await screen.findByTestId('prefilled-expiry')).toBeInTheDocument();
    expect(screen.queryByTestId('prefilled-ingredient')).toBeNull();
    expect(screen.queryByTestId('prefilled-amount')).toBeNull();
    expect(screen.queryByTestId('prefilled-description')).toBeNull();
  });

  it('keeps the Ingredient the form was opened from and fills the rest', async () => {
    const user = userEvent.setup();
    const { release } = stubProductScan(() =>
      Response.json({ lines: [line({ expiryDate: null })] }),
    );
    renderWithProviders(<PantryPage />);
    await user.click(await screen.findByRole('button', { name: /^Milk/ }));
    await user.click(
      screen.getByRole('button', { name: 'Add a batch of Milk' }),
    );
    await screen.findByRole('combobox', {
      name: 'Ingredient: Milk. Press Backspace to change',
    });
    await shoot(user);
    release();

    await waitFor(() =>
      expect(screen.getByLabelText('Product description')).toHaveValue(
        'Greek yogurt 500 g',
      ),
    );
    expect(
      screen.getByRole('combobox', {
        name: 'Ingredient: Milk. Press Backspace to change',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('prefilled-ingredient')).toBeNull();
    // Milk's own Catalog default expiry stays.
    expect(
      screen.getByRole('button', { name: /^Expires, .*, in 7 days$/ }),
    ).toBeInTheDocument();
  });

  it('marks a low-confidence match with "check this" and leaves Save enabled', async () => {
    const user = userEvent.setup();
    const { release } = stubProductScan(() =>
      Response.json({ lines: [line({ lowConfidence: true })] }),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await shoot(user);
    release();
    expect(
      await screen.findByText(/Low confidence: check the match/),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add to Pantry' })).toBeEnabled();
  });

  it('prefills an unmatched read as a typed name', async () => {
    const user = userEvent.setup();
    const { release } = stubProductScan(() =>
      Response.json({
        lines: [
          line({ match: null, name: 'Zorblax', quantity: null, unit: null }),
        ],
      }),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await shoot(user);
    release();
    expect(
      await screen.findByText(/"Zorblax" will be saved as Unmatched/),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add to Pantry' })).toBeEnabled();
  });

  it('shows the Scan Cap alert inline and keeps what was typed', async () => {
    const user = userEvent.setup();
    const { release } = stubProductScan(() =>
      Response.json(
        { code: 'scan.cap_reached', params: { cap: 30 } },
        { status: 429 },
      ),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'mil',
    );
    await user.click(await screen.findByRole('option', { name: /Milk/ }));
    await user.type(screen.getByLabelText('Product description'), 'Fresh');
    await shoot(user);
    release();
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/by hand/)).toBeVisible();
    expect(screen.getByLabelText('Product description')).toHaveValue('Fresh');
    expect(screen.getByRole('button', { name: 'Add to Pantry' })).toBeEnabled();
  });

  it('shows a short error for any other failure and keeps what was typed', async () => {
    const user = userEvent.setup();
    const { release } = stubProductScan(() =>
      Response.json(
        { code: 'scan.provider_incomplete', params: {} },
        { status: 502 },
      ),
    );
    renderWithProviders(<PantryPage />);
    await openForm(user);
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'mil',
    );
    await user.click(await screen.findByRole('option', { name: /Milk/ }));
    await user.type(screen.getByLabelText('Product description'), 'Fresh');
    await shoot(user);
    release();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The scan did not finish. Please try again.',
    );
    expect(screen.getByLabelText('Product description')).toHaveValue('Fresh');
  });
});
