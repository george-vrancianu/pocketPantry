import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../App';
import type { CatalogSearchResult } from '../../lib/catalog';
import type { ProposedLine } from '../../lib/scan';
import { preferenceSaves, stubSetupMember, Where } from '../../test/intro';
import { renderWithProviders } from '../../test/render';
import { selected, shutter, takeScan } from '../../test/scan';

vi.mock('../../lib/camera', async () =>
  (await import('../../test/scan')).fakeCameraModule(),
);
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
}));

const catalogItem = (id: string, name: string): CatalogSearchResult => ({
  owner: 'catalog',
  amountScale: 'medium',
  id,
  name,
  defaultUnit: 'pcs',
  leafCategory: { id: `${id}-leaf`, name },
  parentCategory: {
    id: 'produce',
    name: 'Produce',
    aisle: { id: 'aisle', name: 'Produce' },
  },
  defaults: { expiryDays: 7, location: 'fridge' },
});

const line = (
  id: string,
  name: string,
  extra: Partial<ProposedLine> = {},
): ProposedLine => ({
  name,
  match: catalogItem(id, name),
  lowConfidence: false,
  quantity: 2,
  unit: 'pcs',
  expiryDate: null,
  sourceText: null,
  productDescription: null,
  ...extra,
});

/** Three things on the counter, one of them a doubtful read. */
const COUNTER = [
  line('tomato', 'Tomatoes'),
  line('onion', 'Onions'),
  line('courgette', 'Courgette', { lowConfidence: true }),
];

/** Two on the receipt, and a bag the Scan left out. */
const RECEIPT = [
  line('milk', 'Milk'),
  line('eggs', 'Eggs'),
  line('bag', 'SACOSA', { match: null, excluded: { reason: 'other' } }),
];

const SCAN_ROUTES = {
  'POST /api/scan/ingredients': () => Response.json({ lines: COUNTER }),
  'POST /api/scan/receipt': () => Response.json({ lines: RECEIPT }),
  'POST /api/pantry/batches/bulk': () => Response.json({ batches: [] }),
  'POST /api/scan/receipt/confirm': () =>
    Response.json({ batches: [], matchedShoppingItemIds: [] }),
};

const where = () => screen.getByLabelText('Where').textContent;

/** Opens the app at Set up or skip and taps Show me how. */
async function openSnap(routes: Parameters<typeof stubSetupMember>[0] = {}) {
  const calls = stubSetupMember({
    ...routes,
    routes: { ...SCAN_ROUTES, ...routes.routes },
  });
  renderWithProviders(
    <>
      <App />
      <Where />
    </>,
    { route: '/intro/setup' },
  );
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: /Show me how/ }));
  await screen.findByRole('radiogroup', { name: "What's in front of you?" });
  return { user, calls };
}

/** Snap's camera, a photo of what was picked, and the Setup Review that follows. */
async function snapAPhoto(
  user: ReturnType<typeof userEvent.setup>,
  pick?: string,
) {
  if (pick) await user.click(screen.getByRole('radio', { name: pick }));
  await user.click(screen.getByRole('link', { name: 'Camera' }));
  await waitFor(() => expect(shutter()).toBeInTheDocument());
  takeScan();
}

const banner = () => screen.findByTestId('setup-review-banner');

describe('Setup 1: Snap, Setup Review, All set', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('takes Ingredients from Snap to a saved Pantry, All set with the count, and the Dashboard', async () => {
    const { user, calls } = await openSnap();

    // Only the camera is usable on Snap.
    for (const name of ['Home', 'Shopping', 'Pantry', 'Recipes'])
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    await snapAPhoto(user);

    // The line editor of that Scan, not the overview, with Gator's count and the one to check.
    expect(await banner()).toHaveTextContent('I spotted 3 things!');
    expect(
      within(await banner()).getByText(
        "Check the one I wasn't sure about. Tap any line to fix it.",
      ),
    ).toBeInTheDocument();
    expect(where()).toMatch(/^\/intro\/review\/.+/);
    expect(screen.getByRole('img', { name: 'Gator, happy' })).toBeVisible();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Camera/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
    expect(screen.queryByTestId('review-overview')).toBeNull();
    // The app's Dock is not on this screen: nothing leads away from Setup.
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull();
    // The normal (cream) look, not the olive of the step screens.
    expect(document.querySelector('[data-theme="warm"]')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Add 3 to Pantry' }));

    // All set shows what was really saved; the Shopping List tile is left out at 0.
    expect(
      await screen.findByText(
        "You're all set! I'll keep an eye on your kitchen.",
      ),
    ).toBeInTheDocument();
    expect(where()).toBe('/intro/all-set');
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('in your Pantry')).toBeInTheDocument();
    expect(screen.queryByText('on your Shopping List')).toBeNull();
    expect(screen.getByRole('img', { name: 'Gator, proud' })).toBeVisible();

    const scan = calls.find((c) => c.key === 'POST /api/scan/ingredients');
    expect(scan?.body).toEqual({
      ingredientsImage: 'data:image/jpeg;base64,YQ==',
    });
    const save = calls.filter((c) => c.key === 'POST /api/pantry/batches/bulk');
    expect(save).toHaveLength(1);
    expect(save[0].body).toMatchObject({
      batches: [
        { ingredientId: 'tomato' },
        { ingredientId: 'onion' },
        { ingredientId: 'courgette' },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Go to my kitchen' }));
    expect(
      await screen.findByRole('link', { name: 'Customise dashboard' }),
    ).toBeInTheDocument();
    expect(where()).toBe('/');
    expect(preferenceSaves(calls)).toEqual([{ introDone: true }]);
  });

  it('opens the same Setup Review for a Receipt, with the count of what was read', async () => {
    const { user, calls } = await openSnap();
    await snapAPhoto(user, 'Receipt');

    // Two lines were read; the bag the Scan left out is not counted.
    expect(await banner()).toHaveTextContent('I spotted 2 things!');
    expect(
      within(await banner()).getByText(
        "Nothing I wasn't sure about. Tap any line to fix it.",
      ),
    ).toBeInTheDocument();
    expect(where()).toMatch(/^\/intro\/review\/.+/);

    await user.click(screen.getByRole('button', { name: 'Add 2 to Pantry' }));
    expect(await screen.findByText('in your Pantry')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(
      calls.find((c) => c.key === 'POST /api/scan/receipt/confirm')?.body,
    ).toMatchObject({
      batches: [{ ingredientId: 'milk' }, { ingredientId: 'eggs' }],
    });
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/pantry/batches/bulk',
    );
  });

  it('goes back to the camera in the same mode on Retake, and again from "‹ Camera"', async () => {
    const { user } = await openSnap();
    await snapAPhoto(user, 'Receipt');
    await banner();

    await user.click(screen.getByRole('button', { name: 'Retake' }));
    await waitFor(() => expect(where()).toBe('/scan?mode=receipt'));
    expect(selected()).toEqual(['Receipt']);

    takeScan();
    await banner();
    await user.click(screen.getByRole('button', { name: /Camera/ }));
    await waitFor(() => expect(where()).toBe('/scan?mode=receipt'));
    // The dropped photos are gone: Retake does not pile them up in the Scan Session.
    expect(screen.queryByTestId('stack-badge')).toBeNull();
  });

  it('skips from Snap to All set with no tiles, and Go to my kitchen still finishes the Intro', async () => {
    const { user, calls } = await openSnap();
    await user.click(screen.getByRole('link', { name: 'Skip' }));

    expect(
      await screen.findByText(
        "You're all set! I'll keep an eye on your kitchen.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('in your Pantry')).toBeNull();
    expect(screen.queryByText('on your Shopping List')).toBeNull();
    expect(
      screen.getByText(
        'After each shop, snap the receipt. It ticks off your list too.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go to my kitchen' }));
    expect(
      await screen.findByRole('link', { name: 'Customise dashboard' }),
    ).toBeInTheDocument();
    expect(preferenceSaves(calls)).toEqual([{ introDone: true }]);
  });

  it('skips from the Setup Review to All set without saving anything', async () => {
    const { user, calls } = await openSnap();
    await snapAPhoto(user);
    await banner();

    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(
      await screen.findByText(
        "You're all set! I'll keep an eye on your kitchen.",
      ),
    ).toBeInTheDocument();
    expect(where()).toBe('/intro/all-set');
    expect(screen.queryByText('in your Pantry')).toBeNull();
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/pantry/batches/bulk',
    );
  });

  it('shows the normal reading state while the photo is read, then the line editor', async () => {
    let finish: (response: Response) => void = () => {};
    const { user } = await openSnap({
      routes: {
        'POST /api/scan/ingredients': () =>
          new Promise<Response>((resolve) => (finish = resolve)) as never,
      },
    });
    await snapAPhoto(user);

    expect(await screen.findByText("Gator's reading this one…")).toBeVisible();
    expect(screen.queryByTestId('setup-review-banner')).toBeNull();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();

    finish(Response.json({ lines: COUNTER }));
    expect(await banner()).toHaveTextContent('I spotted 3 things!');
  });

  it('says so when the photo could not be read, and Retake goes back to the camera', async () => {
    const { user } = await openSnap({
      routes: {
        'POST /api/scan/ingredients': () =>
          Response.json(
            { code: 'scan.nothing_found', params: {} },
            { status: 422 },
          ),
      },
    });
    await snapAPhoto(user);

    expect(await screen.findByText("Couldn't read, retake")).toBeVisible();
    expect(screen.getByRole('img', { name: 'Gator, worried' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retake' }));
    await waitFor(() => expect(where()).toBe('/scan?mode=ingredients'));
  });

  it('keeps the Scan screen to Setup: two modes, no Import, and Close goes back to Snap', async () => {
    const { user } = await openSnap();
    await user.click(screen.getByRole('link', { name: 'Camera' }));
    await waitFor(() => expect(shutter()).toBeInTheDocument());

    expect(
      within(screen.getByRole('radiogroup', { name: 'Scan mode' }))
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('aria-label') ?? radio.textContent),
    ).toEqual(['Ingredients', 'Receipt']);
    expect(
      screen.queryByRole('button', { name: 'Import from photos' }),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Close scanner' }));
    expect(
      await screen.findByRole('radiogroup', {
        name: "What's in front of you?",
      }),
    ).toBeInTheDocument();
    expect(where()).toBe('/intro/snap');
  });

  it('stays on All set and says so when the Intro could not be marked done', async () => {
    const { user, calls } = await openSnap({ finishFails: true });
    await user.click(screen.getByRole('link', { name: 'Skip' }));
    await user.click(
      await screen.findByRole('button', { name: 'Go to my kitchen' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't finish just now. Try again.",
    );
    expect(where()).toBe('/intro/all-set');
    expect(
      screen.getByRole('button', { name: 'Go to my kitchen' }),
    ).toBeEnabled();
    expect(preferenceSaves(calls)).toEqual([{ introDone: true }]);
  });

  it('is the normal Scan screen again once the Intro is done', async () => {
    const { user } = await openSnap();
    await user.click(screen.getByRole('link', { name: 'Skip' }));
    await user.click(
      await screen.findByRole('button', { name: 'Go to my kitchen' }),
    );
    await user.click(await screen.findByRole('link', { name: 'Camera' }));
    await waitFor(() => expect(shutter()).toBeInTheDocument());

    expect(
      within(
        screen.getByRole('radiogroup', { name: 'Scan mode' }),
      ).getAllByRole('radio'),
    ).toHaveLength(5);
    expect(
      screen.getByRole('button', { name: 'Import from photos' }),
    ).toBeInTheDocument();
  });
});
