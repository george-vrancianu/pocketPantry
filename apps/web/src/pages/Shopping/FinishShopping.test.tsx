import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  FinishProposal,
  FinishProposalLine,
} from '../../lib/finishShopping';
import type { ShoppingItem, ShoppingList } from '../../lib/shopping';
import { renderWithProviders, stubApi } from '../../test/render';
import { ShoppingPage } from './ShoppingPage';

const item = (id: string, name: string, checked: boolean): ShoppingItem => ({
  id,
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
    ...routes,
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

async function openReview() {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Finish shopping' }),
  );
  return screen.findByRole('region', { name: 'Add to your pantry' });
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
      screen.queryByRole('button', { name: 'Finish shopping' }),
    ).not.toBeInTheDocument();
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
    expect(parmesan.getByLabelText('Expiry date')).toHaveValue('2026-11-01');
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
    await user.clear(parmesan.getByLabelText('Expiry date'));
    await user.click(review.getByRole('button', { name: 'Drop Milk' }));
    await user.click(
      review.getByRole('button', { name: 'Add 2 items to pantry' }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Add to your pantry' }),
      ).not.toBeInTheDocument(),
    );
    expect(
      calls.find((c) => c.key === 'POST /api/shopping-list/finish')?.body,
    ).toEqual({
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
      review.getByRole('button', { name: 'Add 3 items to pantry' }),
    ).toBeDisabled();

    await user.clear(parmesan.getByLabelText('Quantity'));
    await user.type(parmesan.getByLabelText('Quantity'), '5');
    await user.click(
      review.getByRole('button', { name: 'Add 3 items to pantry' }),
    );

    expect(
      await screen.findByText(/The list changed while you were reviewing/),
    ).toBeVisible();
    expect(
      screen.getByRole('region', { name: 'Add to your pantry' }),
    ).toBeVisible();
  });
});
