import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Batch } from '../../../lib/pantry';
import type { Staple } from '../../../lib/staples';
import { renderWithProviders, stubApi } from '../../../test/render';
import { stubMotion } from '../../../test/viewport';
import { HealthWidget } from './HealthWidget';

const isoIn = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

let counter = 0;
const batch = (overrides: Partial<Batch> = {}): Batch => {
  counter += 1;
  return {
    id: `b${counter}`,
    name: 'Item',
    ingredientId: `ing${counter}`,
    unmatched: false,
    aisle: null,
    amountScale: null,
    defaultUnit: null,
    defaultExpiryDays: null,
    quantity: null,
    unit: null,
    location: 'fridge',
    expiryDate: isoIn(30),
    productDescription: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
};

const staple = (ingredientId: string): Staple => ({
  id: `s-${ingredientId}`,
  ingredientId,
  name: ingredientId,
  quantity: null,
  unit: null,
  aisle: null,
});

/**
 * Ten Batches: eight in date, one expired, one undated; two Staples, one stocked and one missing.
 * Fresh 89, Staples 50, Dated 90, Rotation 100: 79, with three Health To-dos (expired, missing Staple, undated).
 */
function tenBatchPantry() {
  return {
    batches: [
      batch({ ingredientId: 'milk' }),
      ...Array.from({ length: 7 }, () => batch()),
      batch({ expiryDate: isoIn(-2) }),
      batch({ expiryDate: null }),
    ],
    runningLow: [] as string[],
  };
}

function stub(
  pantry: { batches: Batch[]; runningLow: string[] },
  staples: Staple[] = [staple('milk'), staple('eggs')],
  settings: () => Response | Promise<Response> = () =>
    Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
  dismissed: string[] = [],
  extraRoutes: Record<string, (url: URL) => Response | Promise<Response>> = {},
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/settings/family': settings,
    'GET /api/pantry': () => Response.json(pantry),
    'GET /api/shopping-list/suggestions': () =>
      Response.json({
        staples: [],
        usedUp: [],
        runningLow: [],
        expired: [],
        dismissed,
      }),
    'GET /api/staples': () => Response.json({ staples }),
    'GET /api/shopping-list': () =>
      Response.json({
        id: 'l1',
        groups: [],
        summary: { remaining: 0, checked: 0 },
      }),
    ...extraRoutes,
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

/** The element's markup under the active Theme: a Theme is its CSS variables, set on the root. */
const snapshotOf = (element: Element) =>
  `data-theme=${document.documentElement.dataset.theme}\n${element.outerHTML.replace(/_r_\w+_/g, '_r_N_')}`;

/** The disclosure button of a Health To-do; its bulk button shares the start of the name. */
const disclosure = (sheet: HTMLElement, name: RegExp) =>
  within(sheet).getByRole('button', { name, expanded: false });

/** The items a disclosure button controls. */
const itemsOf = (button: HTMLElement) =>
  within(
    document.getElementById(
      button.getAttribute('aria-controls') as string,
    ) as HTMLElement,
  ).getAllByRole('listitem');

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('HealthWidget', () => {
  it('shows the score, verdict and to-do count on the wide card, named for a screen reader', async () => {
    stub(tenBatchPantry());

    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    const card = await screen.findByRole('button', {
      name: 'Pantry health, 79, A few things to sort, 3 things to do',
    });
    expect(card).toHaveAttribute('aria-haspopup', 'dialog');
    expect(card).toHaveTextContent('79');
    expect(card).toHaveTextContent('A few things to sort');
    expect(card).toHaveTextContent('3 to do');
    expect(card.querySelectorAll('[data-factor]')).toHaveLength(4);
  });

  it('counts a dismissed missing Staple neither for nor against the score', async () => {
    const name = 'Pantry health, 94, In good shape, 2 things to do';

    // Eggs is not a Staple at all: the score a dismissed Staple must match.
    stub(tenBatchPantry(), [staple('milk')]);
    const first = renderWithProviders(<HealthWidget size="wide" columns={2} />);
    expect(await screen.findByRole('button', { name })).toBeInTheDocument();
    first.unmount();
    vi.unstubAllGlobals();

    stub(tenBatchPantry(), [staple('milk'), staple('eggs')], undefined, [
      'eggs',
    ]);
    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    // Fresh 89, Staples 100 (eggs left out), Dated 90, Rotation 100.
    expect(await screen.findByRole('button', { name })).toBeInTheDocument();
  });

  it('shows the same on the small card, without the bar', async () => {
    stub(tenBatchPantry());

    renderWithProviders(<HealthWidget size="small" columns={2} />);

    const card = await screen.findByRole('button', {
      name: 'Pantry health, 79, A few things to sort, 3 things to do',
    });
    expect(card).toHaveTextContent('3 to do');
    expect(card.querySelector('[data-factor]')).toBeNull();
  });

  it('says there is nothing to do for a Pantry in order', async () => {
    stub(
      {
        batches: Array.from({ length: 10 }, () => batch()),
        runningLow: [],
      },
      [],
    );

    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    const card = await screen.findByRole('button', {
      name: 'Pantry health, 100, In good shape, nothing to do',
    });
    expect(card).toHaveTextContent('Nothing to do');
  });

  it('shows a progress ring and no verdict under ten Batches', async () => {
    stub(
      {
        batches: [batch(), batch(), batch(), batch({ expiryDate: isoIn(-1) })],
        runningLow: [],
      },
      [],
    );

    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    const card = await screen.findByRole('button', {
      name: 'Pantry health, Add 6 more to the Pantry to get your score, 1 thing to do',
    });
    expect(card).toHaveTextContent(
      'Add 6 more to the Pantry to get your score',
    );
    expect(card).toHaveTextContent('1 to do');
    expect(card).not.toHaveTextContent('In good shape');
    expect(card.querySelector('[data-factor]')).toBeNull();
  });

  it('waits for the Family Settings before scoring, so the default Stale Threshold never shows', async () => {
    let release: () => void = () => {};
    const settingsLoaded = new Promise<void>((resolve) => {
      release = resolve;
    });
    const calls = stub(
      {
        batches: [
          ...Array.from({ length: 9 }, () => batch()),
          batch({ expiryDate: isoIn(5) }),
        ],
        runningLow: [],
      },
      [],
      async () => {
        await settingsLoaded;
        return Response.json({ staleThresholdDays: 10, expiryOverrides: [] });
      },
    );

    renderWithProviders(<HealthWidget size="wide" columns={2} />);

    await waitFor(() =>
      expect(calls.some((call) => call.key === 'GET /api/pantry')).toBe(true),
    );
    expect(
      await screen.findByRole('progressbar', { name: 'Loading' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    release();
    // With the default threshold of 3 the Batch five days out would count as fresh and the score be 100.
    expect(
      await screen.findByRole('button', { name: /^Pantry health, 98/ }),
    ).toBeInTheDocument();
  });

  it('speaks Romanian', async () => {
    stub({ batches: [batch()], runningLow: [] }, []);

    renderWithProviders(<HealthWidget size="wide" columns={2} />, {
      locale: 'ro',
    });

    expect(
      await screen.findByRole('button', { name: /^Starea cămării, / }),
    ).toHaveTextContent('Adaugă încă 9 în cămară');
  });

  describe('when the score changes', () => {
    async function changeScore(reduceMotion: boolean) {
      const pantry = tenBatchPantry();
      stub(pantry);
      stubMotion(reduceMotion);
      const { queryClient } = renderWithProviders(
        <HealthWidget size="wide" columns={2} />,
      );
      const card = await screen.findByRole('button', {
        name: /^Pantry health, 79/,
      });
      // Swapping the expired Batch for a dated one lifts Fresh to 100: 40 + 15 + 13.5 + 15 = 83.5, rounded to 84.
      pantry.batches.splice(8, 1);
      pantry.batches.push(batch());
      await queryClient.invalidateQueries({ queryKey: ['pantry'] });
      return card;
    }

    it('jumps to the new score with reduced motion', async () => {
      const card = await changeScore(true);

      await waitFor(() => expect(card).toHaveTextContent('84'));
    });

    it('counts to the new score otherwise', async () => {
      const card = await changeScore(false);

      expect(card).toHaveTextContent('79');
      await waitFor(() => expect(card).toHaveTextContent('84'), {
        timeout: 2000,
      });
    });
  });

  describe('sheet', () => {
    it('opens on a tap with the header: the ring, verdict and each Health Factor', async () => {
      stub(tenBatchPantry());
      const user = userEvent.setup();
      renderWithProviders(<HealthWidget size="wide" columns={2} />);

      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, 79/ }),
      );

      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });
      expect(sheet).toHaveTextContent('79');
      expect(sheet).toHaveTextContent('A few things to sort');
      expect(sheet).toHaveTextContent(
        'Fresh 89 · Staples 50 · Dated 90 · Rotation 100',
      );
      expect(
        within(sheet).getByRole('button', { name: 'Close' }),
      ).toBeInTheDocument();
    });

    it('explains the progress instead of the Health Factors under ten Batches', async () => {
      stub({ batches: [batch(), batch()], runningLow: [] }, []);
      const user = userEvent.setup();
      renderWithProviders(<HealthWidget size="small" columns={2} />);

      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, Add 8/ }),
      );

      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });
      expect(sheet).toHaveTextContent(
        'Add 8 more to the Pantry to get your score',
      );
      expect(sheet).not.toHaveTextContent('Fresh');
    });

    async function openSheet() {
      stub(tenBatchPantry());
      stubMotion(true);
      const user = userEvent.setup();
      renderWithProviders(<HealthWidget size="wide" columns={2} />);
      const card = await screen.findByRole('button', {
        name: /^Pantry health, 79/,
      });
      await user.click(card);
      await screen.findByRole('dialog', { name: 'Pantry health' });
      return { user, card };
    }

    const closed = () =>
      waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );

    it('closes on Escape and gives focus back to the card', async () => {
      const { user, card } = await openSheet();

      await user.keyboard('{Escape}');

      await closed();
      expect(card).toHaveFocus();
    });

    it('closes on the scrim and gives focus back to the card', async () => {
      const { user, card } = await openSheet();

      await user.click(document.querySelector('.MuiBackdrop-root') as Element);

      await closed();
      expect(card).toHaveFocus();
    });

    it('closes on the close button and gives focus back to the card', async () => {
      const { user, card } = await openSheet();

      await user.click(screen.getByRole('button', { name: 'Close' }));

      await closed();
      expect(card).toHaveFocus();
    });
  });

  describe('Health To-dos', () => {
    const iso = isoIn;
    /** Twelve Batches: two expired (Milk oldest), two expiring soon, one undated and a missing Staple. */
    function todoPantry() {
      return {
        batches: [
          batch({
            name: 'Yogurt',
            expiryDate: iso(-1),
            quantity: 500,
            unit: 'g',
          }),
          batch({ name: 'Milk', expiryDate: iso(-3), quantity: 1, unit: 'l' }),
          batch({ name: 'Ham', expiryDate: iso(2), location: 'fridge' }),
          batch({ name: 'Cheese', expiryDate: iso(1) }),
          batch({ name: 'Rice', expiryDate: null }),
          ...Array.from({ length: 7 }, () => batch()),
        ],
        runningLow: [] as string[],
      };
    }

    async function openTodos(
      pantry = todoPantry(),
      staples = [staple('eggs')],
    ) {
      const calls = stub(pantry, staples);
      stubMotion(true);
      const user = userEvent.setup();
      const view = renderWithProviders(
        <HealthWidget size="wide" columns={2} />,
      );
      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, / }),
      );
      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });
      return { user, sheet, calls, ...view };
    }

    it('groups the Health To-dos as Now, This week and Tidy up with their titles', async () => {
      const { sheet } = await openTodos();

      const headings = within(sheet)
        .getAllByRole('heading')
        .map((heading) => heading.textContent);
      expect(headings).toEqual([
        expect.stringContaining('Now'),
        expect.stringContaining('This week'),
        expect.stringContaining('Tidy up'),
      ]);
      const disclosures = within(sheet)
        .getAllByRole('button', { expanded: false })
        .map((button) => button.textContent);
      expect(disclosures).toEqual([
        expect.stringContaining('Toss 2 expired'),
        expect.stringContaining('Add 1 Staple'),
        expect.stringContaining('Use 2 by '),
        expect.stringContaining('Date 1 Batch'),
      ]);
    });

    it('opens a Health To-do without re-mounting its items, so the transition plays', async () => {
      const { user, sheet } = await openTodos();
      const expired = disclosure(sheet, /^Toss 2 expired/);
      const list = document.getElementById(
        expired.getAttribute('aria-controls') as string,
      );

      await user.click(expired);

      expect(
        document.getElementById(
          expired.getAttribute('aria-controls') as string,
        ),
      ).toBe(list);
    });

    it('names the first three items and the rest as +n', async () => {
      const { sheet } = await openTodos({
        ...todoPantry(),
        batches: [
          ...['A', 'B', 'C', 'D', 'E'].map((name, index) =>
            batch({ name, expiryDate: iso(-1 - index) }),
          ),
          ...Array.from({ length: 6 }, () => batch()),
        ],
      });

      // Oldest first: E (5 days ago), D, C, then +2.
      expect(disclosure(sheet, /^Toss 5 expired/)).toHaveTextContent(
        'E, D, C +2',
      );
    });

    it('opens one Health To-do at a time, listing its Batches', async () => {
      const { user, sheet } = await openTodos();

      const expired = disclosure(sheet, /^Toss 2 expired/);
      expect(expired).toHaveAttribute('aria-expanded', 'false');
      await user.click(expired);

      expect(expired).toHaveAttribute('aria-expanded', 'true');
      const items = document.getElementById(
        expired.getAttribute('aria-controls') as string,
      ) as HTMLElement;
      expect(within(items).getAllByRole('listitem')).toHaveLength(2);

      const soon = disclosure(sheet, /^Use 2 by /);
      await user.click(soon);

      expect(soon).toHaveAttribute('aria-expanded', 'true');
      expect(expired).toHaveAttribute('aria-expanded', 'false');
      expect(within(items).queryByRole('listitem')).not.toBeInTheDocument();
    });
  });

  describe('Health To-do details', () => {
    const iso = isoIn;
    const longAgo = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString();
    };

    async function open(
      batches: Batch[],
      staples: Staple[] = [],
      runningLow: string[] = [],
    ) {
      stub({ batches, runningLow }, staples);
      stubMotion(true);
      const user = userEvent.setup();
      const view = renderWithProviders(
        <HealthWidget size="wide" columns={2} />,
      );
      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, / }),
      );
      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });
      return { user, sheet, ...view };
    }

    const filler = (count: number) =>
      Array.from({ length: count }, () => batch());

    it('writes each item line as the ticket words it', async () => {
      const { user, sheet } = await open(
        [
          batch({
            name: 'Yogurt',
            quantity: 500,
            unit: 'g',
            expiryDate: iso(-2),
          }),
          batch({ name: 'Ham', quantity: 2, unit: 'pcs', expiryDate: iso(2) }),
          batch({
            name: 'Pesto',
            quantity: 190,
            unit: 'g',
            createdAt: longAgo(5),
            expiryDate: null,
          }),
          batch({
            name: 'Peas',
            location: 'freezer',
            createdAt: longAgo(215),
            expiryDate: null,
          }),
          ...filler(6),
        ],
        [{ ...staple('flour'), name: 'Flour', quantity: 1, unit: 'kg' }],
      );

      for (const name of [
        /^Toss 1 expired/,
        /^Add 1 Staple/,
        /^Use 1 by /,
        /^Date 2 Batches/,
      ]) {
        await user.click(
          within(sheet).getByRole('button', { name, expanded: false }),
        );
        await user.click(
          within(sheet).getByRole('button', { name, expanded: true }),
        );
      }
      // Items are mounted closed too, so read all lines from the dialog's text.
      const lines = within(sheet)
        .getAllByRole('listitem', { hidden: true })
        .map((item) => item.textContent);
      expect(lines).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Yogurt500 g · fridge · since \w{3}$/),
          expect.stringContaining('FlourStaple · usual 1 kg · none left'),
          expect.stringMatching(/Ham2 pcs · fridge/),
          expect.stringContaining('Pesto190 g · fridge · 5 d old'),
          expect.stringContaining('Peas7 months in the freezer'),
        ]),
      );
    });

    it('puts the days-left Tag on an Expiring Soon item', async () => {
      const { user, sheet } = await open([
        batch({ name: 'Ham', expiryDate: iso(2) }),
        ...filler(9),
      ]);

      const soon = disclosure(sheet, /^Use 1 by /);
      await user.click(soon);

      expect(itemsOf(soon)[0]).toHaveTextContent('2 d left');
    });

    it('shows Running low items with their amount and Location', async () => {
      const { user, sheet } = await open(
        [
          batch({
            name: 'Milk',
            ingredientId: 'milk',
            quantity: 1,
            unit: 'l',
            location: 'fridge',
          }),
          ...filler(9),
        ],
        [],
        ['milk'],
      );

      const low = disclosure(sheet, /^Restock 1 running low/);
      await user.click(low);

      expect(itemsOf(low)[0]).toHaveTextContent('1 L · fridge');
    });

    it('lists Forgotten Batches before the other undated ones', async () => {
      const { user, sheet } = await open([
        batch({ name: 'Recent', expiryDate: null }),
        batch({ name: 'Forgotten', expiryDate: null, createdAt: longAgo(40) }),
        ...filler(8),
      ]);

      const undated = disclosure(sheet, /^Date 2 Batches/);
      await user.click(undated);

      const names = itemsOf(undated).map((item) => item.textContent);
      expect(names[0]).toContain('Forgotten40 days in the fridge');
      expect(names[1]).toContain('Recent');
    });

    it('shows a gain pill where fixing raises the score, none for Expiring Soon', async () => {
      const { sheet } = await open([
        batch({ expiryDate: iso(-1) }),
        batch({ expiryDate: iso(2) }),
        ...filler(10),
      ]);

      // Fresh 88 and total 95 now; without the expired Batch 96 and 98.
      expect(disclosure(sheet, /^Toss 1 expired/)).toHaveTextContent('+3');
      expect(disclosure(sheet, /^Use 1 by /)).not.toHaveTextContent('+');
    });

    it('shows no gain while the Pantry is not scored, and still lists the Health To-dos', async () => {
      const { sheet } = await open([
        batch({ expiryDate: iso(-1) }),
        ...filler(2),
      ]);

      expect(disclosure(sheet, /^Toss 1 expired/)).not.toHaveTextContent('+');
    });

    it('names the card subline after the first Health To-do', async () => {
      stub(tenBatchPantry());
      renderWithProviders(<HealthWidget size="wide" columns={2} />);

      expect(
        await screen.findByRole('button', { name: /^Pantry health, 79/ }),
      ).toHaveTextContent('3 to do · Toss 1 expired');
    });

    it('gives each bulk button its full accessible name; Toss and Date all wait for their own tickets', async () => {
      const { sheet } = await open(
        [
          batch({ expiryDate: iso(-1) }),
          batch({ expiryDate: iso(-2) }),
          batch({ expiryDate: iso(2) }),
          batch({ expiryDate: null }),
          ...filler(7),
        ],
        [staple('eggs')],
      );

      expect(
        within(sheet).getByRole('button', { name: 'Toss 2 expired' }),
      ).toBeDisabled();
      expect(
        within(sheet).getByRole('button', { name: 'Add 1 Staple' }),
      ).toBeEnabled();
      expect(
        within(sheet).getByRole('button', { name: 'Date all (1 Batch)' }),
      ).toBeDisabled();
      expect(
        within(sheet).getByRole('link', { name: 'Recipes' }),
      ).toHaveAttribute('href', '/recipes');
    });

    it('opens Recipes from the Expiring Soon Health To-do', async () => {
      stub(
        {
          batches: [batch({ expiryDate: iso(1) }), ...filler(9)],
          runningLow: [],
        },
        [],
      );
      stubMotion(true);
      const user = userEvent.setup();
      renderWithProviders(
        <Routes>
          <Route path="/" element={<HealthWidget size="wide" columns={2} />} />
          <Route path="/recipes" element={<p>Recipes page</p>} />
        </Routes>,
      );
      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, / }),
      );

      await user.click(await screen.findByRole('link', { name: 'Recipes' }));

      expect(await screen.findByText('Recipes page')).toBeInTheDocument();
    });

    it('does not list a dismissed missing Staple', async () => {
      stub(tenBatchPantry(), [staple('milk'), staple('eggs')], undefined, [
        'eggs',
      ]);
      stubMotion(true);
      const user = userEvent.setup();
      renderWithProviders(<HealthWidget size="wide" columns={2} />);
      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, / }),
      );
      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });

      expect(sheet).not.toHaveTextContent(/Add \d+ Staple/);
      expect(sheet).not.toHaveTextContent('eggs');
      expect(sheet).toHaveTextContent('Staples covered');
    });

    it('shows a done pill for each Health To-do with nothing to do', async () => {
      const { sheet } = await open([
        batch({ expiryDate: iso(-1) }),
        ...filler(9),
      ]);

      const pills = within(sheet)
        .getAllByRole('listitem')
        .map((item) => item.textContent);
      expect(pills).toEqual(
        expect.arrayContaining([
          'Staples covered',
          'Nothing due soon',
          'Nothing low',
          'All dated',
          'Nothing forgotten',
        ]),
      );
      expect(pills).not.toContain('Nothing expired');
    });

    it('drops the Nothing forgotten pill while a Batch is Forgotten', async () => {
      const { sheet } = await open([
        batch({ expiryDate: null, createdAt: longAgo(40) }),
        ...filler(9),
      ]);

      const pills = within(sheet)
        .getAllByRole('listitem')
        .map((item) => item.textContent);
      expect(pills).not.toContain('Nothing forgotten');
    });

    it('says all done, with every pill, when there is nothing to do', async () => {
      const { sheet } = await open(filler(10));

      expect(sheet).toHaveTextContent(
        'Nothing to do. Everything is in date, stocked and accounted for.',
      );
      expect(within(sheet).getAllByRole('listitem')).toHaveLength(6);
    });

    it('keeps the open Health To-do open when the data changes', async () => {
      const pantry = {
        batches: [
          batch({ name: 'Milk', expiryDate: iso(-1) }),
          batch({ name: 'Ham', expiryDate: iso(-2) }),
          ...filler(10),
        ],
        runningLow: [] as string[],
      };
      stub(pantry, []);
      stubMotion(true);
      const user = userEvent.setup();
      const { queryClient } = renderWithProviders(
        <HealthWidget size="wide" columns={2} />,
      );
      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, / }),
      );
      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });
      await user.click(disclosure(sheet, /^Toss 2 expired/));

      pantry.batches.splice(1, 1);
      await queryClient.invalidateQueries({ queryKey: ['pantry'] });

      const expired = await within(sheet).findByRole('button', {
        name: /^Toss 1 expired/,
        expanded: true,
      });
      expect(expired).toBeInTheDocument();
    });
  });

  describe('adding to the Shopping List', () => {
    type Line = {
      id: string;
      ingredientId: string;
      quantity?: number;
      unit?: string;
    };

    /** A Shopping List the stubbed API keeps: bulk-add appends (ids in request order), delete removes. */
    function shoppingApi() {
      const lines: Line[] = [];
      let next = 0;
      const view = () => ({
        id: 'l1',
        groups: [
          {
            aisle: null,
            items: lines.map((line) => ({
              ...line,
              name: line.ingredientId,
              quantity: line.quantity ?? null,
              unit: line.unit ?? null,
              checked: false,
              unmatched: false,
            })),
          },
        ],
        summary: { remaining: lines.length, checked: 0 },
      });
      const deleted: string[] = [];
      let gate: Promise<void> = Promise.resolve();
      const routes: Record<string, () => Response> = {
        'GET /api/shopping-list': () => Response.json(view()),
      };
      return {
        lines,
        deleted,
        routes,
        /** Holds the bulk-add response until the returned release is called. */
        holdAdd: () => {
          let release = () => {};
          gate = new Promise<void>((resolve) => {
            release = resolve;
          });
          return release;
        },
        waitForGate: () => gate,
        /** Adds the lines a bulk-add request names and answers with the list and their ids. */
        add: (items: Array<Omit<Line, 'id'>>) => {
          const createdIds = items.map((item) => {
            next += 1;
            lines.push({ id: `sh${next}`, ...item });
            return `sh${next}`;
          });
          return Response.json({ ...view(), createdIds });
        },
        remove: (id: string) => {
          const at = lines.findIndex((line) => line.id === id);
          if (at >= 0) lines.splice(at, 1);
          deleted.push(id);
          return Response.json(view());
        },
      };
    }

    async function openWith(
      batches: Batch[],
      staples: Staple[],
      runningLow: string[] = [],
    ) {
      const shopping = shoppingApi();
      const calls = stub({ batches, runningLow }, staples, undefined, [], {
        ...shopping.routes,
        'POST /api/shopping-list/items/bulk': async () => {
          await shopping.waitForGate();
          const { body } = calls
            .filter((call) => call.key === 'POST /api/shopping-list/items/bulk')
            .at(-1) as { body: { items: Array<Omit<Line, 'id'>> } };
          return shopping.add(body.items);
        },
        'DELETE /api/shopping-list/items/sh1': () => shopping.remove('sh1'),
        'DELETE /api/shopping-list/items/sh2': () => shopping.remove('sh2'),
        'DELETE /api/shopping-list/items/sh3': () => shopping.remove('sh3'),
      });
      stubMotion(true);
      const user = userEvent.setup();
      renderWithProviders(<HealthWidget size="wide" columns={2} />);
      await user.click(
        await screen.findByRole('button', { name: /^Pantry health, / }),
      );
      const sheet = await screen.findByRole('dialog', {
        name: 'Pantry health',
      });
      const posts = () =>
        calls
          .filter((call) => call.key === 'POST /api/shopping-list/items/bulk')
          .map((call) => call.body);
      return { user, sheet, shopping, posts, calls };
    }

    const filler = (count: number) =>
      Array.from({ length: count }, () => batch());
    const flour = {
      ...staple('flour'),
      name: 'Flour',
      quantity: 1,
      unit: 'kg' as const,
    };
    const salt = { ...staple('salt'), name: 'Salt' };

    it('adds every missing Staple with its preferred amount, and the Health To-do drops out', async () => {
      const { user, sheet, posts } = await openWith(filler(10), [flour, salt]);

      await user.click(
        within(sheet).getByRole('button', { name: 'Add 2 Staples' }),
      );

      expect(posts()).toEqual([
        {
          items: [
            { ingredientId: 'flour', quantity: 1, unit: 'kg' },
            { ingredientId: 'salt' },
          ],
        },
      ]);
      await waitFor(() =>
        expect(sheet).not.toHaveTextContent(/Add \d+ Staples/),
      );
      expect(sheet).toHaveTextContent('Staples covered');
    });

    it('announces the count and the new score in a toast', async () => {
      const { user, sheet } = await openWith(filler(10), [flour, salt]);

      await user.click(
        within(sheet).getByRole('button', { name: 'Add 2 Staples' }),
      );

      // Staples go from 0 to 0.5 each: 40 + 15 + 15 + 15 = 85 from 70.
      expect(
        await screen.findByText('2 added to the Shopping List · score 85'),
      ).toBeInTheDocument();
    });

    it('adds a single Staple from its row with a plus button', async () => {
      const { user, sheet, posts } = await openWith(filler(10), [flour, salt]);
      await user.click(disclosure(sheet, /^Add 2 Staples/));

      await user.click(
        within(sheet).getByRole('button', { name: 'Add Flour' }),
      );

      expect(posts()).toEqual([
        { items: [{ ingredientId: 'flour', quantity: 1, unit: 'kg' }] },
      ]);
      await waitFor(() =>
        expect(
          within(sheet).queryByRole('button', { name: 'Add Flour' }),
        ).not.toBeInTheDocument(),
      );
      expect(
        within(sheet).getByRole('button', { name: 'Add 1 Staple' }),
      ).toBeInTheDocument();
    });

    it('adds the Running low Ingredients, one at a time or together, without an amount', async () => {
      const { user, sheet, posts } = await openWith(
        [
          batch({ name: 'Milk', ingredientId: 'milk' }),
          batch({ name: 'Eggs', ingredientId: 'eggs' }),
          ...filler(8),
        ],
        [],
        ['milk', 'eggs'],
      );
      await user.click(disclosure(sheet, /^Restock 2 running low/));

      await user.click(within(sheet).getByRole('button', { name: 'Add Milk' }));
      await waitFor(() =>
        expect(
          within(sheet).queryByRole('button', { name: 'Add Milk' }),
        ).not.toBeInTheDocument(),
      );
      await user.click(
        within(sheet).getByRole('button', { name: 'Add 1 running low' }),
      );

      expect(posts()).toEqual([
        { items: [{ ingredientId: 'milk' }] },
        { items: [{ ingredientId: 'eggs' }] },
      ]);
    });

    it('undoes exactly the Shopping Items the add returned, leaving others alone', async () => {
      const { user, sheet, shopping } = await openWith(filler(10), [
        flour,
        salt,
      ]);
      shopping.lines.push({ id: 'sh0', ingredientId: 'butter' });
      await user.click(
        within(sheet).getByRole('button', { name: 'Add 2 Staples' }),
      );
      await screen.findByText(/^2 added to the Shopping List/);

      await user.click(screen.getByRole('button', { name: 'Undo' }));

      await waitFor(() => expect(shopping.deleted).toEqual(['sh1', 'sh2']));
      expect(shopping.lines.map((line) => line.id)).toEqual(['sh0']);
      expect(
        await within(sheet).findByRole('button', { name: 'Add 2 Staples' }),
      ).toBeInTheDocument();
    });

    it('still shows the toast when the sheet is closed before the add answers', async () => {
      const { user, sheet, shopping } = await openWith(filler(10), [
        flour,
        salt,
      ]);
      const release = shopping.holdAdd();
      await user.click(
        within(sheet).getByRole('button', { name: 'Add 2 Staples' }),
      );

      await user.click(within(sheet).getByRole('button', { name: 'Close' }));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      release();

      expect(
        await screen.findByText(/^2 added to the Shopping List/),
      ).toBeInTheDocument();
    });
  });

  describe.each(['warm', 'minimal', 'dark'] as const)(
    'in the %s Theme',
    (theme) => {
      // The open sheet prints dates ("since Tue"); a fixed day keeps the snapshots stable.
      beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-10-15T12:00:00'));
      });
      afterEach(() => {
        vi.useRealTimers();
      });

      async function render(size: 'wide' | 'small') {
        localStorage.setItem(
          'pp.appearance',
          JSON.stringify({ theme, matchSystem: false }),
        );
        stub(tenBatchPantry());
        stubMotion(true);
        const result = renderWithProviders(
          <HealthWidget size={size} columns={2} />,
        );
        const card = await screen.findByRole('button', {
          name: /^Pantry health, 79/,
        });
        return { ...result, card };
      }

      it('looks the same wide', async () => {
        const { card } = await render('wide');
        expect(snapshotOf(card)).toMatchSnapshot();
      });

      it('looks the same small', async () => {
        const { card } = await render('small');
        expect(snapshotOf(card)).toMatchSnapshot();
      });

      it('looks the same as an open sheet', async () => {
        const { card } = await render('wide');
        await userEvent.setup().click(card);
        const sheet = await screen.findByRole('dialog', {
          name: 'Pantry health',
        });
        expect(snapshotOf(sheet)).toMatchSnapshot();
      });
    },
  );
});
