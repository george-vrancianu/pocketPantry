import { tokens } from '@pocket-pantry/ui';
import { focusManager } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogSearchResult } from '../../lib/catalog';
import { defaultExpiryDate, type Batch } from '../../lib/pantry';
import { renderWithProviders, stubApi } from '../../test/render';
import { trackScrolling } from '../../test/scroll';
import { stubMotion } from '../../test/viewport';
import { PantryPage } from './PantryPage';

const inDays = (days: number) => defaultExpiryDate(days, new Date());

function batch(overrides: Partial<Batch>): Batch {
  return {
    id: crypto.randomUUID(),
    name: 'Milk',
    ingredientId: 'milk-id',
    unmatched: false,
    aisle: null,
    quantity: null,
    unit: null,
    location: 'fridge',
    expiryDate: null,
    productDescription: null,
    createdAt: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

const parmesan: CatalogSearchResult = {
  id: 'parmesan-id',
  name: 'Parmesan',
  defaultUnit: 'g',
  leafCategory: { id: 'hard-cheese', name: 'Hard cheese' },
  parentCategory: {
    id: 'dairy',
    name: 'Dairy',
    aisle: { id: 'aisle', name: 'Dairy & eggs' },
  },
  defaults: { expiryDays: 30, location: 'fridge' },
};

/** The Family Settings response, with the Stale Threshold the tags are coloured by. */
const familySettings = (staleThresholdDays: number) => () =>
  Response.json({ staleThresholdDays, expiryOverrides: [] });

function stubPantry(batches: Batch[], search: CatalogSearchResult[] = []) {
  const { fetchMock, calls } = stubApi({
    'GET /api/pantry': () => Response.json({ batches }),
    'GET /api/settings/family': familySettings(3),
    'GET /api/catalog/search': () => Response.json({ results: search }),
    'POST /api/pantry/batches': () => Response.json(batch({})),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

describe('PantryPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('groups Batches by Location in the order given, with name, amount, description and ExpiryTag', async () => {
    stubPantry([
      batch({
        name: 'Yogurt',
        ingredientId: 'yogurt-id',
        location: 'fridge',
        quantity: 500,
        unit: 'g',
        productDescription: 'Greek, opened',
        expiryDate: inDays(0),
      }),
      batch({
        name: 'Spinach',
        ingredientId: 'spinach-id',
        location: 'fridge',
        expiryDate: inDays(2),
      }),
      batch({
        name: 'Zorblax paste',
        location: 'cupboard',
        unmatched: true,
        ingredientId: null,
      }),
    ]);
    renderWithProviders(<PantryPage />);

    const fridge = await screen.findByRole('region', { name: 'Fridge · 2' });
    const rows = within(fridge).getAllByRole('listitem');
    expect(rows.map((row) => row.textContent)).toEqual([
      'Yogurt' + '500 g · Greek, opened' + 'Today',
      'Spinach' + '2 d left',
    ]);

    const cupboard = screen.getByRole('region', { name: 'Cupboard · 1' });
    expect(within(cupboard).getByText('Unmatched')).toBeInTheDocument();
    expect(within(cupboard).getByText('Zorblax paste')).toBeInTheDocument();
  });

  describe('expiry tags', () => {
    const ladder = () => [
      batch({ name: 'Bread', ingredientId: 'bread', expiryDate: inDays(-2) }),
      batch({ name: 'Yogurt', ingredientId: 'yogurt', expiryDate: inDays(0) }),
      batch({
        name: 'Spinach',
        ingredientId: 'spinach',
        expiryDate: inDays(1),
      }),
      batch({ name: 'Feta', ingredientId: 'feta', expiryDate: inDays(3) }),
      batch({ name: 'Ham', ingredientId: 'ham', expiryDate: inDays(4) }),
      batch({ name: 'Butter', ingredientId: 'butter', expiryDate: inDays(9) }),
      batch({ name: 'Mustard', ingredientId: 'mustard', expiryDate: null }),
    ];
    const rowTexts = () =>
      within(screen.getByRole('region', { name: /^Fridge/ }))
        .getAllByRole('listitem')
        .map((row) => row.textContent);

    it('counts the days left on each roll-up row, by the Stale Threshold, with nothing for no expiry', async () => {
      stubPantry(ladder());
      renderWithProviders(<PantryPage />);

      await screen.findByRole('region', { name: 'Fridge · 7' });
      await waitFor(() =>
        expect(rowTexts()).toEqual([
          'Bread' + 'Expired',
          'Yogurt' + 'Today',
          'Spinach' + 'Tomorrow',
          'Feta' + '3 d left',
          'Ham' + '4 d',
          'Butter' + '9 d',
          'Mustard',
        ]),
      );
      // The Expired tag leads with an alert icon.
      expect(screen.getByText('Expired').querySelector('svg')).not.toBeNull();
    });

    it('re-colours the tags when the Stale Threshold changes, with no other change', async () => {
      let threshold = 3;
      const { fetchMock } = stubApi({
        'GET /api/pantry': () => Response.json({ batches: ladder() }),
        'GET /api/settings/family': () => familySettings(threshold)(),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<PantryPage />);
      await screen.findByText('4 d');

      threshold = 1;
      act(() => {
        focusManager.setFocused(false);
        focusManager.setFocused(true);
      });
      await waitFor(() =>
        expect(rowTexts()).toEqual([
          'Bread' + 'Expired',
          'Yogurt' + 'Today',
          'Spinach' + 'Tomorrow',
          'Feta' + '3 d',
          'Ham' + '4 d',
          'Butter' + '9 d',
          'Mustard',
        ]),
      );

      threshold = 7;
      act(() => {
        focusManager.setFocused(false);
        focusManager.setFocused(true);
      });
      await waitFor(() =>
        expect(rowTexts()).toEqual([
          'Bread' + 'Expired',
          'Yogurt' + 'Today',
          'Spinach' + 'Tomorrow',
          'Feta' + '3 d left',
          'Ham' + '4 d left',
          'Butter' + '9 d',
          'Mustard',
        ]),
      );
    });

    it('shows the full date and tag in Batch detail, with the year only when it is not this year', async () => {
      const user = userEvent.setup();
      stubPantry([
        batch({ id: 'a', quantity: 1, unit: 'l', expiryDate: inDays(0) }),
        batch({ id: 'b', quantity: 2, unit: 'l', expiryDate: '2031-06-09' }),
        batch({ id: 'c', quantity: 3, unit: 'l', expiryDate: null }),
      ]);
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));

      const [todays, later, undated] = within(
        screen.getByRole('list', { name: 'Batches of Milk' }),
      ).getAllByRole('group');
      const thisYear = String(new Date().getFullYear());
      expect(todays).toHaveTextContent(
        /^1 L[A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}Today/,
      );
      expect(todays).not.toHaveTextContent(thisYear);
      expect(later).toHaveTextContent(/^2 LMon, Jun 9, 2031\d+ d(?! left)/);
      expect(undated).toHaveTextContent(/^3 LNo expiry/);
    });
  });

  describe('Ingredient Icons', () => {
    const DAIRY_AISLE_ID = '244cde4d-f9a5-5df8-9f40-5e1f48fd4fcf';
    const dairy = { id: DAIRY_AISLE_ID, name: 'Dairy & eggs', sortOrder: 4 };
    const PARMESAN_SEED_ID = '7d85ad5c-dbd3-527e-ad69-23c2eb53ae6e';
    const iconOf = (name: string) =>
      screen
        .getByText(name)
        .closest('li')
        ?.querySelector<SVGElement>('[data-ingredient-icon]');

    it('shows a mapped Ingredient its icon, tinted by its Aisle', async () => {
      stubPantry([
        batch({
          name: 'Parmesan',
          ingredientId: PARMESAN_SEED_ID,
          aisle: dairy,
        }),
      ]);
      renderWithProviders(<PantryPage />);
      await screen.findByText('Parmesan');
      expect(iconOf('Parmesan')).toHaveAttribute(
        'data-ingredient-icon',
        'parmesan',
      );
      expect(iconOf('Parmesan')).toHaveAttribute(
        'data-ingredient-tint',
        '#E3ECF3',
      );
      expect(iconOf('Parmesan')).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows an unmapped Ingredient the Default Icon, tinted by its Aisle', async () => {
      stubPantry([
        batch({ name: 'Zorblax', ingredientId: 'zorblax-id', aisle: dairy }),
      ]);
      renderWithProviders(<PantryPage />);
      await screen.findByText('Zorblax');
      expect(iconOf('Zorblax')).toHaveAttribute(
        'data-ingredient-icon',
        'default',
      );
      expect(iconOf('Zorblax')).toHaveAttribute(
        'data-ingredient-tint',
        '#E3ECF3',
      );
    });

    it('tints an Aisle without a tint neutral', async () => {
      stubPantry([
        batch({
          name: 'Parmesan',
          ingredientId: PARMESAN_SEED_ID,
          aisle: { id: 'admin-aisle-id', name: 'Custom', sortOrder: 99 },
        }),
      ]);
      renderWithProviders(<PantryPage />);
      await screen.findByText('Parmesan');
      expect(iconOf('Parmesan')).toHaveAttribute(
        'data-ingredient-icon',
        'parmesan',
      );
      expect(iconOf('Parmesan')).toHaveAttribute(
        'data-ingredient-tint',
        tokens.color.chipNeutral,
      );
    });

    it('shows an Unmatched Batch the Default Icon with the neutral tint', async () => {
      stubPantry([
        batch({
          name: 'Zorblax paste',
          ingredientId: null,
          unmatched: true,
          aisle: null,
        }),
      ]);
      renderWithProviders(<PantryPage />);
      await screen.findByText('Zorblax paste');
      expect(iconOf('Zorblax paste')).toHaveAttribute(
        'data-ingredient-icon',
        'default',
      );
      expect(iconOf('Zorblax paste')).toHaveAttribute(
        'data-ingredient-tint',
        tokens.color.chipNeutral,
      );
    });
  });

  it('shows an empty state with no Batches', async () => {
    stubPantry([]);
    renderWithProviders(<PantryPage />);
    expect(await screen.findByText(/Your Pantry is empty/)).toBeInTheDocument();
  });

  it('adds a Batch from the Catalog with pre-filled Location and expiry', async () => {
    const user = userEvent.setup();
    const calls = stubPantry([], [parmesan]);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'parm',
    );
    await user.click(await screen.findByRole('option', { name: /Parmesan/ }));

    expect(screen.getByLabelText('Location')).toHaveValue('fridge');
    expect(
      screen.getByRole('button', { name: /^Expires, .*, in 30 days$/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unit: g' })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Location'), 'freezer');
    await user.type(
      screen.getByRole('textbox', { name: /Amount of Parmesan/ }),
      '200',
    );
    await user.type(
      screen.getByLabelText('Product description'),
      'Grana Padano 200g',
    );
    await user.click(screen.getByRole('button', { name: 'Add to Pantry' }));

    const post = calls.find((call) => call.key === 'POST /api/pantry/batches');
    expect(post?.body).toEqual({
      ingredientId: 'parmesan-id',
      quantity: 200,
      unit: 'g',
      location: 'freezer',
      expiryDate: inDays(30),
      productDescription: 'Grana Padano 200g',
    });
    // Back on the list after saving, with focus on the Add button.
    const addButton = await screen.findByRole('button', { name: 'Add batch' });
    expect(addButton).toHaveFocus();
  });

  it('takes a typed unit with the amount and offers no "no unit" option', async () => {
    const user = userEvent.setup();
    const calls = stubPantry([], [parmesan]);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'parm',
    );
    await user.click(await screen.findByRole('option', { name: /Parmesan/ }));
    const amount = screen.getByRole('textbox', { name: /Amount of Parmesan/ });
    await user.type(amount, '1.5 kg');

    expect(amount).toHaveValue('1.5');
    await user.click(screen.getByRole('button', { name: 'Unit: kg' }));
    expect(
      within(screen.getByRole('group', { name: 'Units' }))
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['g', 'kg', 'ml', 'L', 'pcs']);

    await user.type(amount, '{Enter}');
    await waitFor(() =>
      expect(
        calls.find((call) => call.key === 'POST /api/pantry/batches')?.body,
      ).toMatchObject({ quantity: 1.5, unit: 'kg' }),
    );
  });

  it('takes a decimal comma and keeps a unit typed before the pick', async () => {
    const user = userEvent.setup();
    const calls = stubPantry([], [parmesan]);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Amount, for example 2 or 500 g' }),
      '1,5 kg',
    );
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'parm',
    );
    await user.click(await screen.findByRole('option', { name: /Parmesan/ }));

    expect(
      screen.getByRole('button', { name: 'Unit: kg' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to Pantry' }));
    await waitFor(() =>
      expect(
        calls.find((call) => call.key === 'POST /api/pantry/batches')?.body,
      ).toMatchObject({ quantity: 1.5, unit: 'kg' }),
    );
  });

  it('sets the unit from the chip', async () => {
    const user = userEvent.setup();
    const calls = stubPantry([], [parmesan]);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'parm',
    );
    await user.click(await screen.findByRole('option', { name: /Parmesan/ }));
    await user.type(
      screen.getByRole('textbox', { name: /Amount of Parmesan/ }),
      '2',
    );
    await user.click(screen.getByRole('button', { name: 'Unit: g' }));
    await user.click(
      within(screen.getByRole('group', { name: 'Units' })).getByRole('button', {
        name: 'kg',
      }),
    );
    expect(
      screen.getByRole('button', { name: 'Unit: kg' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add to Pantry' }));
    await waitFor(() =>
      expect(
        calls.find((call) => call.key === 'POST /api/pantry/batches')?.body,
      ).toMatchObject({ quantity: 2, unit: 'kg' }),
    );
  });

  it('explains an invalid quantity and returns focus to Add after Cancel', async () => {
    const user = userEvent.setup();
    stubPantry([], []);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    const amount = screen.getByRole('textbox', {
      name: 'Amount, for example 2 or 500 g',
    });
    // Half-typed amounts ("500 " on the way to "500 g") are not flagged while typing.
    await user.type(amount, '500 ');
    expect(amount).not.toHaveAttribute('aria-invalid');
    await user.clear(amount);
    await user.type(amount, '1.2345');
    expect(amount).not.toHaveAttribute('aria-invalid');
    // Past the unit chip, out of the amount field.
    await user.tab();
    await user.tab();
    expect(screen.getByLabelText('Location')).toHaveFocus();
    expect(amount).toHaveAttribute('aria-invalid', 'true');
    expect(
      screen.getByText(/from 0.001 to 1,000,000, with up to 3 decimals/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      await screen.findByRole('button', { name: 'Add batch' }),
    ).toHaveFocus();
  });

  it('saves a typed name with no Catalog match as an Unmatched Batch', async () => {
    const user = userEvent.setup();
    const calls = stubPantry([], []);
    renderWithProviders(<PantryPage />);

    await user.click(await screen.findByRole('button', { name: 'Add batch' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Search ingredients' }),
      'Zorblax paste',
    );
    expect(
      screen.getByRole('button', { name: 'Add to Pantry' }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: 'Not in the Catalog? Add "Zorblax paste" as Unmatched',
      }),
    );
    expect(
      screen.getByText(/saved as Unmatched and flagged/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to Pantry' }));

    const post = calls.find((call) => call.key === 'POST /api/pantry/batches');
    expect(post?.body).toMatchObject({
      rawName: 'Zorblax paste',
      location: 'cupboard',
      expiryDate: null,
      quantity: null,
      unit: null,
    });
    expect(post?.body).not.toHaveProperty('ingredientId');
  });

  describe('the expiry picker in Add batch', () => {
    // Wednesday 14 October 2026, mid-afternoon. Only `Date` is faked, so timers and transitions run as usual.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 14, 15, 30));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    /** Open Add batch and pick Parmesan (Default Expiry 30 days, Fridge). */
    async function addParmesan(user: ReturnType<typeof userEvent.setup>) {
      const calls = stubPantry([], [parmesan]);
      renderWithProviders(<PantryPage />);
      await user.click(
        await screen.findByRole('button', { name: 'Add batch' }),
      );
      await user.type(
        screen.getByRole('combobox', { name: 'Search ingredients' }),
        'parm',
      );
      await user.click(await screen.findByRole('option', { name: /Parmesan/ }));
      return calls;
    }

    async function save(
      user: ReturnType<typeof userEvent.setup>,
      calls: ReturnType<typeof stubPantry>,
    ) {
      await user.click(screen.getByRole('button', { name: 'Add to Pantry' }));
      await waitFor(() =>
        expect(
          calls.find((call) => call.key === 'POST /api/pantry/batches'),
        ).toBeDefined(),
      );
      return calls.find((call) => call.key === 'POST /api/pantry/batches')
        ?.body as { expiryDate: string | null };
    }

    it('shows the Default Expiry as an Expires summary row that opens a dialog', async () => {
      const user = userEvent.setup();
      await addParmesan(user);

      const row = screen.getByRole('button', {
        name: 'Expires, Friday, November 13, in 30 days',
      });
      expect(row).toHaveAttribute('aria-haspopup', 'dialog');
      expect(row).toHaveTextContent('Fri, Nov 13');
      expect(row).toHaveTextContent('in 30 days');
      expect(row).toHaveTextContent('30 d');
    });

    it("opens a sheet titled with the form's context, and a tapped day is saved as that ISO date", async () => {
      const user = userEvent.setup();
      const calls = await addParmesan(user);
      await user.type(
        screen.getByRole('textbox', { name: /Amount of Parmesan/ }),
        '200',
      );

      await user.click(screen.getByRole('button', { name: /^Expires,/ }));
      const sheet = await screen.findByRole('dialog', { name: 'Expires' });
      expect(
        within(sheet).getByRole('heading', { name: 'Expires' }),
      ).toBeInTheDocument();
      expect(sheet).toHaveTextContent('Parmesan · 200 g · Fridge');
      expect(within(sheet).getByRole('status')).toHaveTextContent(
        'Fri, Nov 13in 30 days30 d',
      );

      await user.click(
        within(sheet).getByRole('button', {
          name: 'Friday, November 20, 2026',
        }),
      );
      expect(within(sheet).getByRole('status')).toHaveTextContent(
        'Fri, Nov 20in 37 days37 d',
      );
      expect(
        within(sheet).getByRole('button', {
          name: 'Friday, November 20, 2026',
        }),
      ).toHaveAttribute('aria-pressed', 'true');

      await user.click(within(sheet).getByRole('button', { name: 'Done' }));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(
        screen.getByRole('button', {
          name: 'Expires, Friday, November 20, in 37 days',
        }),
      ).toBeInTheDocument();

      expect((await save(user, calls)).expiryDate).toBe('2026-11-20');
    });

    it('clears the pre-filled expiry when the name is marked Unmatched', async () => {
      const user = userEvent.setup();
      const calls = await addParmesan(user);
      const search = screen.getByRole('combobox', {
        name: 'Search ingredients',
      });
      await user.clear(search);
      await user.type(search, 'Parmigiano');
      await user.click(
        screen.getByRole('button', {
          name: 'Not in the Catalog? Add "Parmigiano" as Unmatched',
        }),
      );

      expect(
        screen.getByRole('button', { name: 'Expires, No expiry date' }),
      ).toBeInTheDocument();
      expect((await save(user, calls)).expiryDate).toBeNull();
    });

    async function openSheet(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: /^Expires,/ }));
      return screen.findByRole('dialog', { name: 'Expires' });
    }

    it('lets a past day be picked, and the readout tag follows expiryTagFor', async () => {
      const user = userEvent.setup();
      const calls = await addParmesan(user);
      const sheet = await openSheet(user);
      const readout = within(sheet).getByRole('status');
      const pick = (name: string) =>
        user.click(within(sheet).getByRole('button', { name }));

      // Stale Threshold 3: Today, Tomorrow, "N d left" up to 3, then "N d".
      await pick('Wednesday, October 14, 2026');
      expect(readout).toHaveTextContent('Wed, Oct 14todayToday');
      await pick('Thursday, October 15, 2026');
      expect(readout).toHaveTextContent('Thu, Oct 15tomorrowTomorrow');
      await pick('Saturday, October 17, 2026');
      expect(readout).toHaveTextContent('Sat, Oct 17in 3 days3 d left');
      await pick('Sunday, October 18, 2026');
      expect(readout).toHaveTextContent('Sun, Oct 18in 4 days4 d');
      await pick('Thursday, September 24, 2026');
      expect(readout).toHaveTextContent('Thu, Sep 2420 days agoExpired');

      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect((await save(user, calls)).expiryDate).toBe('2026-09-24');
    });

    it('"No expiry" saves null, and the scrim keeps the choice', async () => {
      const user = userEvent.setup();
      const calls = await addParmesan(user);
      const sheet = await openSheet(user);
      const noExpiry = within(sheet).getByRole('button', { name: 'No expiry' });
      expect(noExpiry).toHaveAttribute('aria-pressed', 'false');

      await user.click(noExpiry);
      expect(noExpiry).toHaveAttribute('aria-pressed', 'true');
      expect(within(sheet).getByRole('status')).toHaveTextContent(
        'No expiry dateNo expiry',
      );

      await user.click(document.querySelector('.MuiBackdrop-root') as Element);
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      const row = screen.getByRole('button', {
        name: 'Expires, No expiry date',
      });
      expect(row).toHaveTextContent('No expiry date');
      expect(row).toHaveTextContent('Tap to set one');
      expect((await save(user, calls)).expiryDate).toBeNull();
    });

    /** The quick-pick tiles, as "accessible name: pressed". */
    const quickPicks = (sheet: HTMLElement) =>
      within(within(sheet).getByRole('group', { name: 'Quick picks' }))
        .getAllByRole('button')
        .map(
          (tile) =>
            `${tile.getAttribute('aria-label')}: ${tile.getAttribute('aria-pressed')}`,
        );

    it('shows the pre-filled Default Expiry as the Usual quick pick, selected, ahead of 3 d to 1 mo', async () => {
      const user = userEvent.setup();
      await addParmesan(user);
      const sheet = await openSheet(user);

      // Parmesan's Default Expiry is 30 days, the same as 1 mo: only Usual lights up.
      expect(quickPicks(sheet)).toEqual([
        'Usual, 30 d, Friday, November 13: true',
        '3 d, Saturday, October 17: false',
        '5 d, Monday, October 19: false',
        '1 wk, Wednesday, October 21: false',
        '2 wk, Wednesday, October 28: false',
        '1 mo, Friday, November 13: false',
      ]);
      const usual = within(sheet).getByRole('button', { name: /^Usual/ });
      expect(usual).toHaveTextContent('30d');
      expect(usual).toHaveTextContent('Usual · Nov 13');
      const week = within(sheet).getByRole('button', { name: /^1 wk/ });
      expect(week).toHaveTextContent('1wk');
      expect(week).toHaveTextContent('Oct 21');
    });

    it('saves today + n for each quick pick (1 mo is 30 days) and scrolls the calendar smoothly to its month', async () => {
      const scrolling = trackScrolling();
      const user = userEvent.setup();
      const calls = await addParmesan(user);
      const sheet = await openSheet(user);
      const calendar = within(sheet).getByRole('group', { name: 'Calendar' });
      const readout = within(sheet).getByRole('status');
      const shown = () => {
        const last = scrolling.scrolledTo(calendar);
        return [last?.child?.querySelector('h3')?.textContent, last?.behavior];
      };

      await user.click(within(sheet).getByRole('button', { name: /^3 d,/ }));
      expect(readout).toHaveTextContent('Sat, Oct 17in 3 days');
      expect(shown()).toEqual(['October 2026', 'smooth']);
      await user.click(within(sheet).getByRole('button', { name: /^5 d,/ }));
      expect(readout).toHaveTextContent('Mon, Oct 19in 5 days');
      await user.click(within(sheet).getByRole('button', { name: /^1 wk,/ }));
      expect(readout).toHaveTextContent('Wed, Oct 21in 7 days');
      await user.click(within(sheet).getByRole('button', { name: /^1 mo,/ }));
      expect(readout).toHaveTextContent('Fri, Nov 13in 30 days');
      expect(shown()).toEqual(['November 2026', 'smooth']);
      await user.click(within(sheet).getByRole('button', { name: /^2 wk,/ }));
      expect(readout).toHaveTextContent('Wed, Oct 28in 14 days');
      expect(shown()).toEqual(['October 2026', 'smooth']);
      expect(
        within(sheet).getByRole('button', { name: /^2 wk,/ }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(
        within(sheet).getByRole('button', { name: /^Usual,/ }),
      ).toHaveAttribute('aria-pressed', 'false');

      await user.click(within(sheet).getByRole('button', { name: 'Done' }));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect((await save(user, calls)).expiryDate).toBe('2026-10-28');
    });

    it('leaves every quick pick unselected for a calendar day that matches none', async () => {
      const user = userEvent.setup();
      await addParmesan(user);
      const sheet = await openSheet(user);

      await user.click(
        within(sheet).getByRole('button', {
          name: 'Thursday, October 22, 2026',
        }),
      );
      expect(quickPicks(sheet).every((tile) => tile.endsWith(': false'))).toBe(
        true,
      );
      // A calendar day 3 days out does light up 3 d.
      await user.click(
        within(sheet).getByRole('button', {
          name: 'Saturday, October 17, 2026',
        }),
      );
      expect(
        within(sheet).getByRole('button', { name: /^3 d,/ }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('has no Usual tile for an Unmatched name', async () => {
      const user = userEvent.setup();
      await addParmesan(user);
      const search = screen.getByRole('combobox', {
        name: 'Search ingredients',
      });
      await user.clear(search);
      await user.type(search, 'Parmigiano');
      await user.click(
        screen.getByRole('button', {
          name: 'Not in the Catalog? Add "Parmigiano" as Unmatched',
        }),
      );
      const sheet = await openSheet(user);

      expect(quickPicks(sheet)).toEqual([
        '3 d, Saturday, October 17: false',
        '5 d, Monday, October 19: false',
        '1 wk, Wednesday, October 21: false',
        '2 wk, Wednesday, October 28: false',
        '1 mo, Friday, November 13: false',
      ]);
    });

    it('has no Usual tile for an Ingredient without a Default Expiry', async () => {
      const user = userEvent.setup();
      stubPantry(
        [],
        [
          {
            ...parmesan,
            id: 'salt-id',
            name: 'Salt',
            defaults: { expiryDays: null, location: 'spices' },
          },
        ],
      );
      renderWithProviders(<PantryPage />);
      await user.click(
        await screen.findByRole('button', { name: 'Add batch' }),
      );
      await user.type(
        screen.getByRole('combobox', { name: 'Search ingredients' }),
        'salt',
      );
      await user.click(await screen.findByRole('option', { name: /Salt/ }));
      const sheet = await openSheet(user);

      expect(
        within(sheet).queryByRole('button', { name: /^Usual/ }),
      ).not.toBeInTheDocument();
      expect(quickPicks(sheet)).toHaveLength(5);
    });

    it('jumps to the quick pick month instantly under reduced motion', async () => {
      stubMotion(true);
      const scrolling = trackScrolling();
      const user = userEvent.setup();
      await addParmesan(user);
      const sheet = await openSheet(user);
      const calendar = within(sheet).getByRole('group', { name: 'Calendar' });

      await user.click(within(sheet).getByRole('button', { name: /^3 d,/ }));
      const last = scrolling.scrolledTo(calendar);
      expect(last?.child?.querySelector('h3')).toHaveTextContent(
        'October 2026',
      );
      expect(last?.behavior).toBe('auto');
    });

    it('renders 14 Monday-first months, marks today, and tints today + Stale Threshold as the stale band', async () => {
      const user = userEvent.setup();
      await addParmesan(user);
      const sheet = await openSheet(user);
      const calendar = within(sheet).getByRole('group', { name: 'Calendar' });

      expect(
        within(calendar)
          .getAllByRole('heading')
          .map((heading) => heading.textContent),
      ).toEqual([
        'September 2026',
        'October 2026',
        'November 2026',
        'December 2026',
        'January 2027',
        'February 2027',
        'March 2027',
        'April 2027',
        'May 2027',
        'June 2027',
        'July 2027',
        'August 2027',
        'September 2027',
        'October 2027',
      ]);

      // 1 October 2026 is a Thursday: three blank cells, then the 1st.
      const october = within(calendar).getByRole('grid', {
        name: 'October 2026',
      });
      const [firstWeek] = within(october).getAllByRole('row');
      expect(
        within(firstWeek)
          .getAllByRole('gridcell')
          .map((cell) => cell.textContent),
      ).toEqual(['', '', '', '1', '2', '3', '4']);
      expect(
        within(firstWeek).getByRole('button', { name: /^Thursday/ }),
      ).toHaveTextContent('1');

      expect(
        within(calendar).getByRole('button', { current: 'date' }),
      ).toHaveAccessibleName('Wednesday, October 14, 2026');

      // Stale Threshold 3: today through 17 October, four days.
      const band = within(calendar)
        .getAllByRole('button')
        .filter((day) => day.hasAttribute('aria-describedby'));
      expect(band.map((day) => day.textContent)).toEqual([
        '14',
        '15',
        '16',
        '17',
      ]);
      for (const day of band)
        expect(day).toHaveAccessibleDescription('Within 3 days');
    });

    it("opens straight on the value's month (today's when empty) and stays put when a day is tapped", async () => {
      const scrolling = trackScrolling();
      const user = userEvent.setup();
      await addParmesan(user);
      const monthShown = (sheet: HTMLElement) => {
        const calendar = within(sheet).getByRole('group', { name: 'Calendar' });
        const shown = scrolling.scrolledTo(calendar);
        return [
          shown?.child?.querySelector('h3')?.textContent,
          shown?.behavior,
          scrolling.scrollsOf(calendar).length,
        ];
      };

      let sheet = await openSheet(user);
      expect(monthShown(sheet)).toEqual(['November 2026', 'auto', 1]);

      await user.click(
        within(sheet).getByRole('button', {
          name: 'Wednesday, December 2, 2026',
        }),
      );
      expect(monthShown(sheet)).toEqual(['November 2026', 'auto', 1]);

      await user.click(within(sheet).getByRole('button', { name: 'Done' }));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      sheet = await openSheet(user);
      expect(monthShown(sheet)).toEqual(['December 2026', 'auto', 1]);

      await user.click(
        within(sheet).getByRole('button', { name: 'No expiry' }),
      );
      await user.click(within(sheet).getByRole('button', { name: 'Done' }));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      sheet = await openSheet(user);
      expect(monthShown(sheet)).toEqual(['October 2026', 'auto', 1]);
    });
  });

  describe('managing the Pantry', () => {
    const stock = () => [
      batch({
        id: 'milk-1',
        name: 'Milk',
        quantity: 1,
        unit: 'l',
        expiryDate: inDays(5),
      }),
      batch({
        id: 'milk-2',
        name: 'Milk',
        quantity: 0.5,
        unit: 'l',
        productDescription: 'Opened',
        expiryDate: inDays(2),
      }),
      batch({
        id: 'cheese',
        name: 'Parmesan',
        ingredientId: 'parmesan-id',
        location: 'freezer',
        productDescription: 'Grana Padano 200g',
        expiryDate: inDays(40),
      }),
      batch({
        id: 'rice',
        name: 'Rice',
        ingredientId: 'rice-id',
        location: 'cupboard',
      }),
    ];

    /** The Batch rows of an expanded roll-up, in order. */
    const batchRows = (name = 'Milk') =>
      within(
        screen.getByRole('list', { name: `Batches of ${name}` }),
      ).getAllByRole('group');
    /** The keyboard path to the editor sheet: focus the row, press Enter. */
    async function openEditor(
      user: ReturnType<typeof userEvent.setup>,
      row = batchRows()[0],
    ) {
      act(() => row.focus());
      await user.keyboard('{Enter}');
      return screen.findByRole('form', { name: /^Edit .* batch$/ });
    }
    /** The keyboard path to removing: focus the row, Delete, then the Remove button. */
    async function removeBatch(
      user: ReturnType<typeof userEvent.setup>,
      row = batchRows()[0],
    ) {
      act(() => row.focus());
      await user.keyboard('{Delete}');
      await user.click(screen.getByRole('button', { name: 'Remove' }));
    }

    function stubManaged(initial: Batch[], { failDeletes = false } = {}) {
      let batches = initial;
      const remove = (id: string) => () => {
        if (failDeletes) {
          return Response.json(
            { code: 'unknown', params: {} },
            { status: 500 },
          );
        }
        batches = batches.filter((b) => b.id !== id);
        return new Response(null, { status: 204 });
      };
      const { fetchMock, calls } = stubApi({
        'GET /api/pantry': () => Response.json({ batches }),
        'PATCH /api/pantry/batches/milk-2': () => Response.json(batches[1]),
        'DELETE /api/pantry/batches/milk-2': remove('milk-2'),
        'DELETE /api/pantry/batches/cheese': remove('cheese'),
      });
      vi.stubGlobal('fetch', fetchMock);
      return calls;
    }

    it('rolls Batches of one Ingredient into a row with the total and soonest expiry', async () => {
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const fridge = await screen.findByRole('region', { name: 'Fridge · 2' });
      const [row] = within(fridge).getAllByRole('listitem');
      expect(row.textContent).toBe('Milk' + '1.5 L · 2 batches' + '2 d left');
    });

    describe('Staple star', () => {
      const staple = {
        id: 'staple-1',
        ingredientId: 'milk-id',
        name: 'Milk',
        quantity: null,
        unit: null,
        aisle: null,
      };

      function stubStaples() {
        const { fetchMock, calls } = stubApi({
          'GET /api/pantry': () =>
            Response.json({
              batches: [
                batch({ name: 'Milk', quantity: 1, unit: 'l' }),
                batch({
                  name: 'Zorblax paste',
                  unmatched: true,
                  ingredientId: null,
                  location: 'cupboard',
                }),
              ],
            }),
          'GET /api/staples': () => Response.json({ staples: [] }),
          'POST /api/staples': () => Response.json(staple, { status: 201 }),
        });
        vi.stubGlobal('fetch', fetchMock);
        return calls;
      }

      it('toggles a Staple from a matched row and leaves an Unmatched row without a star', async () => {
        const user = userEvent.setup();
        const calls = stubStaples();
        renderWithProviders(<PantryPage />);

        await user.click(
          await screen.findByRole('button', { name: /^Zorblax/ }),
        );
        expect(
          screen.queryByRole('button', { name: /Zorblax paste a staple/ }),
        ).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /^Milk/ }));
        const star = screen.getByRole('button', { name: 'Make Milk a staple' });
        await waitFor(() =>
          expect(star).not.toHaveAttribute('aria-disabled', 'true'),
        );

        await user.click(star);
        await waitFor(() =>
          expect(
            calls.find((c) => c.key === 'POST /api/staples')?.body,
          ).toEqual({ ingredientId: 'milk-id' }),
        );
      });

      it('shows a translated error in the page when the Staple limit is reached', async () => {
        const user = userEvent.setup();
        const { fetchMock } = stubApi({
          'GET /api/pantry': () =>
            Response.json({ batches: [batch({ name: 'Milk' })] }),
          'GET /api/staples': () => Response.json({ staples: [] }),
          'POST /api/staples': () =>
            Response.json(
              { code: 'shopping.staple_limit_reached', params: { max: 200 } },
              { status: 409 },
            ),
        });
        vi.stubGlobal('fetch', fetchMock);
        renderWithProviders(<PantryPage />);

        await user.click(await screen.findByRole('button', { name: /^Milk/ }));
        const star = screen.getByRole('button', { name: 'Make Milk a staple' });
        await waitFor(() =>
          expect(star).not.toHaveAttribute('aria-disabled', 'true'),
        );
        await user.click(star);

        expect(await screen.findByRole('alert')).toHaveTextContent(
          'You can have up to 200 staples',
        );
      });

      it('shows the star only while the row is expanded', async () => {
        const user = userEvent.setup();
        stubStaples();
        renderWithProviders(<PantryPage />);

        const toggle = await screen.findByRole('button', { name: /^Milk/ });
        expect(
          screen.queryByRole('button', { name: 'Make Milk a staple' }),
        ).not.toBeInTheDocument();
        await user.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(
          screen.getByRole('button', { name: 'Make Milk a staple' }),
        ).toBeInTheDocument();
        await user.click(toggle);
        expect(
          screen.queryByRole('button', { name: 'Make Milk a staple' }),
        ).not.toBeInTheDocument();
      });
    });

    it('lists totals separately when the units differ', async () => {
      stubManaged([
        batch({ name: 'Flour', ingredientId: 'f', quantity: 500, unit: 'g' }),
        batch({ name: 'Flour', ingredientId: 'f', quantity: 2, unit: 'pcs' }),
      ]);
      renderWithProviders(<PantryPage />);
      expect(
        await screen.findByText('500 g + 2 pcs · 2 batches'),
      ).toBeVisible();
    });

    it('expands a row to each Batch with its own expiry, swipeable and holdable', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const toggle = await screen.findByRole('button', { name: /^Milk/ });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      // The roll-up row itself is not a gesture row.
      expect(screen.queryByRole('group', { name: 'Milk' })).toBeNull();
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      const details = batchRows();
      expect(details[0]).toHaveTextContent(/^0\.5 L · Opened.*2 d left/);
      expect(details[1]).toHaveTextContent(/^1 L.*5 d/);
      expect(batchRows()[0]).toHaveAccessibleDescription(
        'Swipe left to remove, hold to edit',
      );
      // No Edit or Delete icons any more: the hidden custom actions are not tab stops.
      expect(
        screen.getAllByRole('button', { name: /Edit Milk/ })[0],
      ).toHaveAttribute('tabindex', '-1');
      expect(screen.queryByRole('button', { name: /Delete Milk/ })).toBeNull();

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('moves the expiry from the row onto each Batch while expanded', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const toggle = await screen.findByRole('button', { name: /^Parmesan/ });
      expect(toggle).toHaveTextContent(/40 d$/);
      await user.click(toggle);

      expect(toggle).not.toHaveTextContent(/40 d$/);
      const [detail] = batchRows('Parmesan');
      expect(detail).toHaveTextContent(/^Grana Padano 200g.*40 d/);
    });

    it('edits a Batch and sends only that Batch', async () => {
      const user = userEvent.setup();
      const calls = stubManaged(stock());
      renderWithProviders(<PantryPage />);

      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await openEditor(user);
      const form = screen.getByRole('form', { name: 'Edit Milk batch' });
      expect(
        within(form).getByRole('textbox', { name: /Amount of Milk/ }),
      ).toHaveValue('0.5');
      expect(within(form).getByLabelText('Product description')).toHaveValue(
        'Opened',
      );

      await user.clear(
        within(form).getByRole('textbox', { name: /Amount of Milk/ }),
      );
      await user.type(
        within(form).getByRole('textbox', { name: /Amount of Milk/ }),
        '0.25',
      );
      await user.selectOptions(
        within(form).getByLabelText('Location'),
        'freezer',
      );
      await user.clear(within(form).getByLabelText('Expiry date'));
      await user.click(
        within(form).getByRole('button', { name: 'Save changes' }),
      );

      const patch = calls.find(
        (call) => call.key === 'PATCH /api/pantry/batches/milk-2',
      );
      // Only what changed, so two Members editing different fields do not overwrite each other.
      expect(patch?.body).toEqual({
        quantity: 0.25,
        location: 'freezer',
        expiryDate: null,
      });
      await waitFor(() =>
        expect(
          screen.queryByRole('form', { name: 'Edit Milk batch' }),
        ).not.toBeInTheDocument(),
      );
    });

    it("does not revert another Member's change made while the form was open", async () => {
      const user = userEvent.setup();
      const initial = stock();
      let live = initial;
      const { fetchMock, calls } = stubApi({
        'GET /api/pantry': () => Response.json({ batches: live }),
        'PATCH /api/pantry/batches/milk-2': () => Response.json(live[1]),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await openEditor(user);
      const form = screen.getByRole('form', { name: 'Edit Milk batch' });

      // Another Member changes the quantity, and the list refetches under the open form.
      live = initial.map((b) =>
        b.id === 'milk-2' ? { ...b, quantity: 0.75 } : b,
      );
      act(() => {
        focusManager.setFocused(false);
        focusManager.setFocused(true);
      });
      await waitFor(() =>
        expect(calls.filter((c) => c.key === 'GET /api/pantry').length).toBe(2),
      );

      await user.type(
        within(form).getByLabelText('Product description'),
        ' jar',
      );
      await user.click(
        within(form).getByRole('button', { name: 'Save changes' }),
      );
      const patch = calls.find((c) => c.key.startsWith('PATCH'));
      expect(patch?.body).toEqual({ productDescription: 'Opened jar' });
    });

    it('edits the amount and unit in one input, next to the Location', async () => {
      const user = userEvent.setup();
      const calls = stubManaged(stock());
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await openEditor(user);
      const amount = screen.getByRole('textbox', { name: /Amount of Milk/ });
      await user.clear(amount);
      await user.type(amount, '500 ml');
      await user.selectOptions(screen.getByLabelText('Location'), 'freezer');
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() =>
        expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({
          quantity: 500,
          unit: 'ml',
          location: 'freezer',
        }),
      );
    });

    it('saves on Enter in the amount, and Escape closes only the unit popover', async () => {
      const user = userEvent.setup();
      const calls = stubManaged(stock());
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await openEditor(user);
      const form = screen.getByRole('form', { name: 'Edit Milk batch' });

      await user.click(within(form).getByRole('button', { name: /^Unit: / }));
      expect(within(form).getByRole('group', { name: 'Units' })).toBeVisible();
      await user.keyboard('{Escape}');
      expect(within(form).queryByRole('group', { name: 'Units' })).toBeNull();
      expect(form).toBeInTheDocument();

      const amount = within(form).getByRole('textbox', {
        name: /Amount of Milk/,
      });
      await user.clear(amount);
      await user.type(amount, '2{Enter}');
      await waitFor(() =>
        expect(calls.find((c) => c.key.startsWith('PATCH'))?.body).toEqual({
          quantity: 2,
        }),
      );
    });

    it('sends no request when nothing changed', async () => {
      const user = userEvent.setup();
      const calls = stubManaged(stock());
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await openEditor(user);
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      await waitFor(() =>
        expect(
          screen.queryByRole('form', { name: 'Edit Milk batch' }),
        ).not.toBeInTheDocument(),
      );
      expect(calls.some((c) => c.key.startsWith('PATCH'))).toBe(false);
    });

    it('refuses an exponent quantity when editing', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await openEditor(user);
      fireEvent.change(
        screen.getByRole('textbox', { name: /Amount of Milk/ }),
        {
          target: { value: '1e3' },
        },
      );
      expect(
        screen.getByRole('button', { name: 'Save changes' }),
      ).toBeDisabled();
    });

    it('refuses an invalid quantity when editing', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);
      await user.click(await screen.findByRole('button', { name: /^Milk/ }));
      await openEditor(user);
      await user.clear(screen.getByRole('textbox', { name: /Amount of Milk/ }));
      await user.type(
        screen.getByRole('textbox', { name: /Amount of Milk/ }),
        '1.2345',
      );
      expect(
        screen.getByRole('button', { name: 'Save changes' }),
      ).toBeDisabled();
    });

    describe('removing a Batch', () => {
      afterEach(() => vi.useRealTimers());

      async function openMilk(batches = stock(), options = {}) {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const calls = stubManaged(batches, options);
        renderWithProviders(<PantryPage />);
        const toggle = await screen.findByRole('button', { name: /^Milk/ });
        await user.click(toggle);
        return { user, toggle, calls };
      }
      const deletes = (calls: { key: string }[]) =>
        calls.filter((c) => c.key.startsWith('DELETE'));
      const expireUndo = () => act(() => vi.advanceTimersByTimeAsync(5100));

      it('hides the Batch with Undo and sends the delete only when the Undo expires', async () => {
        const { user, calls } = await openMilk();
        await removeBatch(user);

        expect(await screen.findByText('Removed Milk')).toBeInTheDocument();
        await waitFor(() => expect(batchRows()).toHaveLength(1));
        expect(deletes(calls)).toHaveLength(0);

        await expireUndo();
        await waitFor(() =>
          expect(calls.map((c) => c.key)).toContain(
            'DELETE /api/pantry/batches/milk-2',
          ),
        );
        expect(batchRows()).toHaveLength(1);
      });

      it('brings the Batch back with an error toast when the delete fails', async () => {
        const { user, calls } = await openMilk(stock(), { failDeletes: true });
        await removeBatch(user);
        await waitFor(() => expect(batchRows()).toHaveLength(1));

        await expireUndo();

        await waitFor(() => expect(batchRows()).toHaveLength(2));
        expect(deletes(calls)).toHaveLength(1);
        expect(screen.queryByText('Removed Milk')).toBeNull();
        expect(
          screen.getByText('Something went wrong. Please try again.'),
        ).toBeInTheDocument();
      });

      it('brings the Batch back on Undo without any request', async () => {
        const { user, calls } = await openMilk();
        await removeBatch(user);
        await user.click(await screen.findByRole('button', { name: 'Undo' }));

        expect(batchRows()).toHaveLength(2);
        await expireUndo();
        expect(deletes(calls)).toHaveLength(0);
      });

      it('keeps a roll-up open after its last Batch is removed, and collapses it once the delete is sent', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const calls = stubManaged(stock());
        renderWithProviders(<PantryPage />);
        const toggle = await screen.findByRole('button', { name: /^Parmesan/ });
        await user.click(toggle);
        await removeBatch(user, batchRows('Parmesan')[0]);

        await screen.findByText('Removed Parmesan');
        expect(toggle).toBeInTheDocument();
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.queryByRole('group', { name: 'Parmesan' })).toBeNull();
        expect(deletes(calls)).toHaveLength(0);

        // Undo puts the Batch back inside the same open roll-up.
        await user.click(screen.getByRole('button', { name: 'Undo' }));
        expect(batchRows('Parmesan')).toHaveLength(1);

        await removeBatch(user, batchRows('Parmesan')[0]);
        await expireUndo();
        await waitFor(() =>
          expect(
            screen.queryByRole('button', { name: /^Parmesan/ }),
          ).toBeNull(),
        );
        expect(deletes(calls)).toHaveLength(1);
      });

      it('moves focus to the next Batch row after removing one of several', async () => {
        const { user } = await openMilk();
        await removeBatch(user);
        await waitFor(() => expect(batchRows()).toHaveLength(1));
        expect(batchRows()[0]).toHaveFocus();
      });

      it('focuses the section heading after removing the last Batch of a row', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        stubManaged([
          ...stock(),
          batch({
            id: 'peas',
            name: 'Peas',
            ingredientId: 'peas-id',
            location: 'freezer',
          }),
        ]);
        renderWithProviders(<PantryPage />);
        await user.click(
          await screen.findByRole('button', { name: /^Parmesan/ }),
        );
        await removeBatch(user, batchRows('Parmesan')[0]);
        await waitFor(() =>
          expect(
            screen.getByRole('heading', { name: 'Freezer · 1' }),
          ).toHaveFocus(),
        );
      });

      it('focuses the Add button after removing the last Batch of the last section', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        stubManaged([stock()[2]]);
        renderWithProviders(<PantryPage />);
        await user.click(
          await screen.findByRole('button', { name: /^Parmesan/ }),
        );
        await removeBatch(user, batchRows('Parmesan')[0]);
        await waitFor(() =>
          expect(
            screen.getByRole('button', { name: 'Add batch' }),
          ).toHaveFocus(),
        );
        await expireUndo();
        await waitFor(() =>
          expect(screen.queryByRole('heading', { name: /Freezer/ })).toBeNull(),
        );
        expect(screen.getByRole('button', { name: 'Add batch' })).toHaveFocus();
      });
    });

    describe('the Batch editor sheet', () => {
      afterEach(() => vi.useRealTimers());

      it('focuses the form, and returns focus to the row on Cancel', async () => {
        const user = userEvent.setup();
        stubManaged(stock());
        renderWithProviders(<PantryPage />);
        await user.click(await screen.findByRole('button', { name: /^Milk/ }));
        const row = batchRows()[0];
        await openEditor(user, row);
        expect(
          screen.getByRole('textbox', { name: /Amount of Milk/ }),
        ).toHaveFocus();
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await waitFor(() => expect(row).toHaveFocus());
      });

      it('says "Updated Milk" after Save and returns focus to the row', async () => {
        const user = userEvent.setup();
        stubManaged(stock());
        renderWithProviders(<PantryPage />);
        await user.click(await screen.findByRole('button', { name: /^Milk/ }));
        const row = batchRows()[0];
        await openEditor(user, row);
        await user.clear(
          screen.getByRole('textbox', { name: /Amount of Milk/ }),
        );
        await user.type(
          screen.getByRole('textbox', { name: /Amount of Milk/ }),
          '2',
        );
        await user.click(screen.getByRole('button', { name: 'Save changes' }));
        expect(await screen.findByText('Updated Milk')).toBeInTheDocument();
        await waitFor(() => expect(row).toHaveFocus());
      });

      it('"Remove from Pantry" closes the sheet and opens the row\'s confirmation', async () => {
        const user = userEvent.setup();
        stubManaged(stock());
        renderWithProviders(<PantryPage />);
        await user.click(await screen.findByRole('button', { name: /^Milk/ }));
        await openEditor(user);
        await user.click(
          screen.getByRole('button', { name: 'Remove from Pantry' }),
        );

        const question = await screen.findByRole('group', {
          name: 'Remove Milk?',
        });
        expect(within(question).getByText('in your Pantry')).toBeVisible();
        await waitFor(() =>
          expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus(),
        );
        expect(screen.queryByRole('form')).toBeNull();
      });
    });

    describe('hold to edit', () => {
      afterEach(() => vi.useRealTimers());

      async function expanded() {
        // Real timers to load and expand; then frozen time, so no real time leaks into the hold.
        const user = userEvent.setup();
        stubManaged(stock());
        renderWithProviders(<PantryPage />);
        await user.click(await screen.findByRole('button', { name: /^Milk/ }));
        const content = batchRows()[0].querySelector(
          '[data-swipe-row-content]',
        ) as HTMLElement;
        vi.useFakeTimers();
        return { content };
      }
      const press = (content: HTMLElement, x = 50, y = 20) =>
        fireEvent.pointerDown(content, {
          pointerId: 1,
          clientX: x,
          clientY: y,
        });
      const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

      it('opens the editor after 500 ms (plus the 160 ms lead-in)', async () => {
        const { content } = await expanded();
        press(content);
        await wait(600);
        expect(screen.queryByRole('form')).toBeNull();
        await wait(200);
        expect(
          screen.getByRole('form', { name: 'Edit Milk batch' }),
        ).toBeInTheDocument();
      });

      it('does nothing visible for a quick tap', async () => {
        const { content } = await expanded();
        press(content);
        await wait(60);
        expect(content.querySelector('[data-hold-circle]')).toBeNull();
        fireEvent.pointerUp(content, {
          pointerId: 1,
          clientX: 50,
          clientY: 20,
        });
        await wait(1000);
        expect(screen.queryByRole('form')).toBeNull();
        expect(content.querySelector('[data-hold-circle]')).toBeNull();
      });

      it('cancels when the finger moves more than 8 pt', async () => {
        const { content } = await expanded();
        press(content);
        await wait(200);
        fireEvent.pointerMove(content, {
          pointerId: 1,
          clientX: 50,
          clientY: 31,
        });
        await wait(1000);
        expect(screen.queryByRole('form')).toBeNull();
      });

      it('only dims the row, with no circle, under reduce-motion', async () => {
        stubMotion(true);
        const { content } = await expanded();
        press(content);
        await wait(120);
        expect(content.querySelector('[data-hold-circle]')).toBeNull();
        expect(content.firstElementChild).toHaveStyle({ opacity: '0.7' });
      });

      it('shows the hold circle while pressing', async () => {
        const { content } = await expanded();
        press(content);
        await wait(120);
        expect(content.querySelector('[data-hold-circle]')).not.toBeNull();
      });
    });

    it('searches localised names and Product Descriptions', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const search = await screen.findByRole('searchbox', {
        name: 'Search Pantry',
      });
      await user.type(search, 'grana');
      expect(screen.getByText('Parmesan')).toBeInTheDocument();
      expect(screen.queryByText('Milk')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'All · 1' }),
      ).toBeInTheDocument();

      await user.clear(search);
      await user.type(search, 'MILK');
      expect(screen.getByText('Milk')).toBeInTheDocument();
      expect(screen.queryByText('Parmesan')).not.toBeInTheDocument();

      await user.clear(search);
      await user.type(search, 'zzz');
      expect(screen.getByText('No batches match.')).toBeInTheDocument();
    });

    it('filters by Location with live counts and marks the active chip', async () => {
      const user = userEvent.setup();
      stubManaged(stock());
      renderWithProviders(<PantryPage />);

      const all = await screen.findByRole('button', { name: 'All · 4' });
      expect(all).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('button', { name: 'Fridge · 2' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Freezer · 1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cupboard · 1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Spices · 0' }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Freezer · 1' }));
      expect(
        screen.getByRole('button', { name: 'Freezer · 1' }),
      ).toHaveAttribute('aria-pressed', 'true');
      expect(all).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('Parmesan')).toBeInTheDocument();
      expect(screen.queryByText('Milk')).not.toBeInTheDocument();

      // Counts follow the search.
      await user.type(
        screen.getByRole('searchbox', { name: 'Search Pantry' }),
        'milk',
      );
      expect(
        screen.getByRole('button', { name: 'Fridge · 2' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Freezer · 0' }),
      ).toBeInTheDocument();
    });
  });
});
