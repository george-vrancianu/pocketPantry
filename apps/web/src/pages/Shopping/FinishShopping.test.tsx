import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  FinishProposal,
  FinishProposalLine,
} from '../../lib/finishShopping';
import type { ShoppingItem, ShoppingList } from '../../lib/shopping';
import { renderWithProviders, stubApi } from '../../test/render';
import { ShoppingPage } from './ShoppingPage';

const item = (id: string, name: string, checked: boolean): ShoppingItem => ({
  id,
  ingredientId: null,
  name,
  quantity: null,
  unit: null,
  checked,
  unmatched: false,
});

const dairy = { id: 'a4', name: 'Dairy & eggs', sortOrder: 4 };
const list: ShoppingList = {
  id: 'l1',
  groups: [
    {
      aisle: dairy,
      items: [item('i1', 'Parmesan', true), item('i2', 'Milk', true)],
    },
    { aisle: null, items: [item('i3', 'Dragon fruit', true)] },
  ],
  summary: { remaining: 0, checked: 3 },
};

const line = (
  overrides: Partial<FinishProposalLine> & { itemId: string; name: string },
): FinishProposalLine => ({
  unmatched: false,
  quantity: null,
  unit: null,
  location: 'fridge',
  expiryDate: null,
  ...overrides,
});

const proposal: FinishProposal = {
  listId: 'l1',
  lines: [
    line({
      itemId: 'i1',
      name: 'Parmesan',
      quantity: 200,
      unit: 'g',
      expiryDate: '2026-11-01',
    }),
    line({ itemId: 'i2', name: 'Milk', quantity: 1, unit: 'l' }),
    line({
      itemId: 'i3',
      name: 'Dragon fruit',
      unmatched: true,
      location: 'cupboard',
    }),
  ],
};

function stubFinish(routes: Record<string, () => Response> = {}) {
  const { fetchMock, calls } = stubApi({
    'GET /api/shopping-list': () => Response.json(list),
    'GET /api/shopping-list/finish': () => Response.json(proposal),
    'GET /api/settings/family': () =>
      Response.json({ staleThresholdDays: 3, expiryOverrides: [] }),
    ...routes,
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

async function openReview() {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Move 3 to Pantry' }),
  );
  return screen.findByRole('region', { name: 'Add to your Pantry' });
}

describe('Finish Shopping review', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('offers Finish Shopping only when something is checked', async () => {
    stubFinish({
      'GET /api/shopping-list': () =>
        Response.json({
          ...list,
          groups: [{ aisle: dairy, items: [item('i1', 'Parmesan', false)] }],
          summary: { remaining: 1, checked: 0 },
        }),
    });
    renderWithProviders(<ShoppingPage />);

    await screen.findByText('1 to buy');
    expect(
      screen.queryByRole('button', { name: /to Pantry/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/ticked off/)).not.toBeInTheDocument();
  });

  it('pre-fills a Batch per checked item with Location and expiry', async () => {
    stubFinish();
    renderWithProviders(<ShoppingPage />);

    const review = await openReview();

    const parmesan = within(
      await within(review).findByRole('region', { name: 'Parmesan' }),
    );
    expect(parmesan.getByLabelText('Quantity')).toHaveValue(200);
    expect(parmesan.getByLabelText('Unit')).toHaveValue('g');
    expect(parmesan.getByLabelText('Location')).toHaveValue('fridge');
    expect(
      parmesan.getByRole('button', { name: /^Expires, Sunday, November 1\b/ }),
    ).toHaveAttribute('aria-haspopup', 'dialog');
    const unmatched = within(
      within(review).getByRole('region', { name: 'Dragon fruit' }),
    );
    expect(unmatched.getByText(/Unmatched/)).toBeVisible();
    expect(unmatched.getByLabelText('Location')).toHaveValue('cupboard');
  });

  it('sends edited and dropped lines on confirm, then returns to the list', async () => {
    const calls = stubFinish({
      'POST /api/shopping-list/finish': () =>
        Response.json({ listId: 'l2', batchCount: 2 }),
    });
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();
    const review = within(await openReview());

    const parmesan = within(
      await review.findByRole('region', { name: 'Parmesan' }),
    );
    await user.selectOptions(parmesan.getByLabelText('Location'), 'freezer');
    await user.clear(parmesan.getByLabelText('Quantity'));
    await user.type(parmesan.getByLabelText('Quantity'), '150');
    await user.click(parmesan.getByRole('button', { name: /^Expires,/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Expires' });
    await user.click(within(sheet).getByRole('button', { name: 'No expiry' }));
    await user.click(within(sheet).getByRole('button', { name: 'Done' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await user.click(review.getByRole('button', { name: 'Drop Milk' }));
    await user.click(
      review.getByRole('button', { name: 'Add 2 items to Pantry' }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Add to your Pantry' }),
      ).not.toBeInTheDocument(),
    );
    expect(
      calls.find((c) => c.key === 'POST /api/shopping-list/finish')?.body,
    ).toEqual({
      listId: 'l1',
      lines: [
        {
          itemId: 'i1',
          quantity: 150,
          unit: 'g',
          location: 'freezer',
          expiryDate: null,
        },
        {
          itemId: 'i3',
          quantity: null,
          unit: null,
          location: 'cupboard',
          expiryDate: null,
        },
      ],
      droppedItemIds: ['i2'],
    });
  });

  it('blocks confirming an invalid quantity and keeps the list on failure', async () => {
    stubFinish({
      'POST /api/shopping-list/finish': () =>
        Response.json(
          { code: 'shopping.list_changed', params: {} },
          { status: 409 },
        ),
    });
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();
    const review = within(await openReview());
    const parmesan = within(
      await review.findByRole('region', { name: 'Parmesan' }),
    );

    await user.clear(parmesan.getByLabelText('Quantity'));
    await user.type(parmesan.getByLabelText('Quantity'), '0');
    expect(
      review.getByRole('button', { name: 'Add 3 items to Pantry' }),
    ).toBeDisabled();

    await user.clear(parmesan.getByLabelText('Quantity'));
    await user.type(parmesan.getByLabelText('Quantity'), '5');
    await user.click(
      review.getByRole('button', { name: 'Add 3 items to Pantry' }),
    );

    expect(
      await screen.findByText(/The list changed while you were reviewing/),
    ).toBeVisible();
    expect(
      screen.getByRole('region', { name: 'Add to your Pantry' }),
    ).toBeVisible();
  });
  it('offers Reload after a 409 that refetches the proposal and clears edits and the error', async () => {
    let proposals = 0;
    const calls = stubFinish({
      'GET /api/shopping-list/finish': () => {
        proposals += 1;
        return Response.json(
          proposals === 1
            ? proposal
            : { listId: 'l2', lines: [line({ itemId: 'i9', name: 'Bread' })] },
        );
      },
      'POST /api/shopping-list/finish': () =>
        Response.json(
          { code: 'shopping.list_changed', params: {} },
          { status: 409 },
        ),
    });
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();
    const review = within(await openReview());
    await user.click(await review.findByRole('button', { name: 'Drop Milk' }));
    await user.click(
      review.getByRole('button', { name: 'Add 2 items to Pantry' }),
    );
    await screen.findByText(/The list changed while you were reviewing/);

    await user.click(review.getByRole('button', { name: 'Reload' }));

    expect(await review.findByRole('region', { name: 'Bread' })).toBeVisible();
    expect(
      screen.queryByText(/The list changed while you were reviewing/),
    ).not.toBeInTheDocument();
    expect(review.queryByRole('button', { name: 'Reload' })).toBeNull();
    expect(
      calls.filter((c) => c.key === 'GET /api/shopping-list/finish'),
    ).toHaveLength(2);
    // The list behind the Review is stale too, so Reload refreshes it as well.
    await waitFor(() =>
      expect(
        calls.filter((c) => c.key === 'GET /api/shopping-list'),
      ).toHaveLength(2),
    );
  });

  it('shows an empty state when the proposal has no lines', async () => {
    stubFinish({
      'GET /api/shopping-list/finish': () =>
        Response.json({ listId: 'l2', lines: [] }),
    });
    renderWithProviders(<ShoppingPage />);

    const review = within(await openReview());

    expect(await review.findByText(/Nothing to review/)).toBeVisible();
    expect(
      review.queryByRole('button', { name: /to Pantry/ }),
    ).not.toBeInTheDocument();
  });

  it('marks Drop as pressed once a line is dropped', async () => {
    stubFinish();
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();
    const review = within(await openReview());

    const drop = await review.findByRole('button', { name: 'Drop Milk' });
    expect(drop).toHaveAttribute('aria-pressed', 'false');
    await user.click(drop);

    expect(review.getByRole('button', { name: 'Keep Milk' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('blocks a quantity above the 1,000,000 maximum', async () => {
    stubFinish();
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();
    const review = within(await openReview());
    const parmesan = within(
      await review.findByRole('region', { name: 'Parmesan' }),
    );

    await user.clear(parmesan.getByLabelText('Quantity'));
    await user.type(parmesan.getByLabelText('Quantity'), '1000001');

    expect(
      review.getByRole('button', { name: 'Add 3 items to Pantry' }),
    ).toBeDisabled();
  });
});

describe('the expiry picker in the Finish Shopping Review', () => {
  // Wednesday 14 October 2026, mid-afternoon: Parmesan's pre-filled 1 November is 18 days away. Only `Date` is faked.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 14, 15, 30));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Open the expiry sheet of one Review line. */
  async function openSheet(
    user: ReturnType<typeof userEvent.setup>,
    name: string,
  ) {
    const section = await screen.findByRole('region', { name });
    await user.click(
      within(section).getByRole('button', { name: /^Expires,/ }),
    );
    return screen.findByRole('dialog', { name: 'Expires' });
  }

  async function closeSheet(
    user: ReturnType<typeof userEvent.setup>,
    sheet: HTMLElement,
  ) {
    await user.click(within(sheet).getByRole('button', { name: 'Done' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  }

  /** The quick-pick tiles, as "accessible name: pressed". */
  const quickPicks = (sheet: HTMLElement) =>
    within(within(sheet).getByRole('group', { name: 'Quick picks' }))
      .getAllByRole('button')
      .map(
        (tile) =>
          `${tile.getAttribute('aria-label')}: ${tile.getAttribute('aria-pressed')}`,
      );

  it("shows a line's pre-filled date as the Usual quick pick, selected", async () => {
    stubFinish();
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();
    await openReview();

    expect(
      screen.getByRole('button', {
        name: 'Expires, Sunday, November 1, in 18 days',
      }),
    ).toBeInTheDocument();
    const sheet = await openSheet(user, 'Parmesan');
    expect(sheet).toHaveTextContent('Parmesan · 200 g · Fridge');
    expect(quickPicks(sheet)).toEqual([
      'Usual, 18 d, Sunday, November 1: true',
      '3 d, Saturday, October 17: false',
      '5 d, Monday, October 19: false',
      '1 wk, Wednesday, October 21: false',
      '2 wk, Wednesday, October 28: false',
      '1 mo, Friday, November 13: false',
    ]);
  });

  it('offers no Usual for a line without a pre-filled date, or for an Unmatched line', async () => {
    stubFinish({
      'GET /api/shopping-list/finish': () =>
        Response.json({
          ...proposal,
          lines: proposal.lines.map((l) =>
            l.unmatched ? { ...l, expiryDate: '2026-10-20' } : l,
          ),
        }),
    });
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();
    await openReview();

    let sheet = await openSheet(user, 'Milk');
    expect(quickPicks(sheet).some((tile) => tile.startsWith('Usual'))).toBe(
      false,
    );
    expect(quickPicks(sheet)).toHaveLength(5);
    await closeSheet(user, sheet);

    sheet = await openSheet(user, 'Dragon fruit');
    expect(quickPicks(sheet).some((tile) => tile.startsWith('Usual'))).toBe(
      false,
    );
    expect(quickPicks(sheet)).toHaveLength(5);
  });

  it("sends each line's chosen date, changing only the line that was picked", async () => {
    const calls = stubFinish({
      'POST /api/shopping-list/finish': () =>
        Response.json({ listId: 'l2', batchCount: 3 }),
    });
    renderWithProviders(<ShoppingPage />);
    const user = userEvent.setup();
    await openReview();

    let sheet = await openSheet(user, 'Milk');
    await user.click(within(sheet).getByRole('button', { name: /^1 wk/ }));
    await closeSheet(user, sheet);
    sheet = await openSheet(user, 'Dragon fruit');
    await user.click(
      within(sheet).getByRole('button', { name: 'Thursday, December 3, 2026' }),
    );
    await closeSheet(user, sheet);
    expect(
      within(screen.getByRole('region', { name: 'Milk' })).getByRole('button', {
        name: 'Expires, Wednesday, October 21, in 7 days',
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Add 3 items to Pantry' }),
    );
    await waitFor(() =>
      expect(
        calls.find((c) => c.key === 'POST /api/shopping-list/finish'),
      ).toBeDefined(),
    );
    const body = calls.find((c) => c.key === 'POST /api/shopping-list/finish')
      ?.body as { lines: { itemId: string; expiryDate: string | null }[] };
    expect(
      body.lines.map(({ itemId, expiryDate }) => ({ itemId, expiryDate })),
    ).toEqual([
      { itemId: 'i1', expiryDate: '2026-11-01' },
      { itemId: 'i2', expiryDate: '2026-10-21' },
      { itemId: 'i3', expiryDate: '2026-12-03' },
    ]);
  });
});
